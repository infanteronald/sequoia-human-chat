import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";
import { cacheGet } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "7d";
  
  let interval = "7 days";
  if (period === "30d") interval = "30 days";
  if (period === "90d") interval = "90 days";
  if (period === "today") interval = "1 day";

  try {
    // Overview stats
    const [totalContacts, activeToday, messagesStats, statusBreakdown, agentStats, dailyMessages, responseTime] = await Promise.all([
      // Total contacts
      pool.query("SELECT COUNT(*) as count FROM contacts"),
      // Active today (contacts with messages in last 24h)
      pool.query("SELECT COUNT(DISTINCT session_id) as count FROM messages WHERE fecha_creacion > NOW() - INTERVAL '1 day'"),
      // Messages in period
      pool.query(`SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_bot = true) as outbound,
        COUNT(*) FILTER (WHERE is_bot = false) as inbound,
        COUNT(*) FILTER (WHERE nota_interna = true OR private = true) as notes
       FROM messages WHERE fecha_creacion > NOW() - INTERVAL '${interval}'`),
      // Conversation status breakdown
      pool.query(`SELECT 
        COUNT(*) FILTER (WHERE conversation_status = 0) as open,
        COUNT(*) FILTER (WHERE conversation_status = 1) as pending,
        COUNT(*) FILTER (WHERE conversation_status = 2) as resolved,
        COUNT(*) FILTER (WHERE conversation_status = 3) as snoozed
       FROM contacts`),
      // Agent stats
      pool.query(`SELECT 
        a.name, a.id,
        COUNT(DISTINCT c.id) as assigned_count,
        COUNT(DISTINCT CASE WHEN c.conversation_status = 2 THEN c.id END) as resolved_count
       FROM agents a 
       LEFT JOIN contacts c ON c.assigned_agent_id = a.id
       GROUP BY a.id, a.name
       ORDER BY assigned_count DESC`),
      // Daily message volume (last 14 days)
      pool.query(`SELECT 
        DATE(fecha_creacion) as date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_bot = true) as outbound,
        COUNT(*) FILTER (WHERE is_bot = false) as inbound
       FROM messages 
       WHERE fecha_creacion > NOW() - INTERVAL '14 days'
       GROUP BY DATE(fecha_creacion) 
       ORDER BY date`),
      // Avg response time (approximate - time between inbound and next outbound msg)
      pool.query(`SELECT 
        AVG(response_time) as avg_response_minutes
       FROM (
         SELECT EXTRACT(EPOCH FROM (
           (SELECT MIN(m2.fecha_creacion) FROM messages m2 WHERE m2.session_id = m.session_id AND m2.is_bot = true AND m2.fecha_creacion > m.fecha_creacion)
           - m.fecha_creacion
         ))/60 as response_time
         FROM messages m 
         WHERE m.is_bot = false AND m.fecha_creacion > NOW() - INTERVAL '${interval}'
         LIMIT 1000
       ) sub WHERE response_time > 0 AND response_time < 1440`),
    ]);

    // CSAT stats
    let csatStats = { avg_rating: 0, total_responses: 0 };
    try {
      const csatRes = await pool.query(
        "SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_responses FROM csat_responses WHERE created_at > NOW() - INTERVAL '" + interval + "'"
      );
      csatStats = csatRes.rows[0];
    } catch {}

    // AI-specific metrics
    const [aiResolutions, aiConversations, cacheHits, cacheMisses] = await Promise.all([
      // Conversations resolved by AI only (no human agent messages)
      pool.query(`SELECT COUNT(DISTINCT c.session_id) as count
        FROM contacts c
        WHERE c.conversation_status = 2
        AND c.session_id NOT IN (
          SELECT DISTINCT session_id FROM messages 
          WHERE is_bot = true AND nombre_agente != 'Sequoia Speed AI' AND nombre_agente != 'Sistema'
          AND nombre_agente IS NOT NULL AND nombre_agente != ''
          AND fecha_creacion > NOW() - INTERVAL '${interval}'
        )
        AND EXISTS (SELECT 1 FROM messages m WHERE m.session_id = c.session_id AND m.fecha_creacion > NOW() - INTERVAL '${interval}')`),
      // Total conversations with at least 1 AI message in period
      pool.query(`SELECT COUNT(DISTINCT session_id) as count FROM messages 
        WHERE nombre_agente = 'Sequoia Speed AI' AND fecha_creacion > NOW() - INTERVAL '${interval}'`),
      // Redis cache hits
      cacheGet<string>("stats:cache_hits").then(v => parseInt(v || "0")).catch(() => 0),
      // Redis cache misses
      cacheGet<string>("stats:cache_misses").then(v => parseInt(v || "0")).catch(() => 0),
    ]);

    const aiResCount = parseInt(aiResolutions.rows[0]?.count || "0");
    const aiConvCount = parseInt(aiConversations.rows[0]?.count || "0");
    const totalCacheRequests = (cacheHits as number) + (cacheMisses as number);
    const cacheHitRate = totalCacheRequests > 0 ? ((cacheHits as number) / totalCacheRequests * 100).toFixed(1) : "0";

    // Estimated AI cost (based on avg tokens per conversation)
    const estimatedCostPerConv = 0.012; // $0.012 per conversation on Haiku
    const estimatedMonthlyCost = aiConvCount * estimatedCostPerConv;

    return NextResponse.json({
      totalContacts: parseInt(totalContacts.rows[0].count),
      activeToday: parseInt(activeToday.rows[0].count),
      messages: {
        total: parseInt(messagesStats.rows[0].total),
        outbound: parseInt(messagesStats.rows[0].outbound),
        inbound: parseInt(messagesStats.rows[0].inbound),
        notes: parseInt(messagesStats.rows[0].notes),
      },
      status: {
        open: parseInt(statusBreakdown.rows[0].open),
        pending: parseInt(statusBreakdown.rows[0].pending),
        resolved: parseInt(statusBreakdown.rows[0].resolved),
        snoozed: parseInt(statusBreakdown.rows[0].snoozed),
      },
      agents: agentStats.rows,
      dailyMessages: dailyMessages.rows,
      avgResponseMinutes: parseFloat(responseTime.rows[0]?.avg_response_minutes || "0"),
      csat: {
        avgRating: parseFloat(csatStats.avg_rating?.toString() || "0"),
        totalResponses: parseInt(csatStats.total_responses?.toString() || "0"),
      },
      ai: {
        resolutionsWithoutHuman: aiResCount,
        totalAiConversations: aiConvCount,
        resolutionRate: aiConvCount > 0 ? ((aiResCount / aiConvCount) * 100).toFixed(1) : "0",
        cacheHits: cacheHits as number,
        cacheMisses: cacheMisses as number,
        cacheHitRate,
        estimatedCostUSD: estimatedMonthlyCost.toFixed(2),
      costPerResolution: aiConvCount > 0 ? (estimatedMonthlyCost / aiConvCount).toFixed(4) : "0",
      costPerConversation: estimatedCostPerConv.toFixed(4),
      intercomEquivalent: (aiConvCount * 0.99).toFixed(2),
      zendeskEquivalent: (aiConvCount * 1.50).toFixed(2),
      savingsVsIntercom: ((aiConvCount * 0.99) - estimatedMonthlyCost).toFixed(2),
      savingsVsZendesk: ((aiConvCount * 1.50) - estimatedMonthlyCost).toFixed(2),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
