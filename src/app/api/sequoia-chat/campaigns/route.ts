import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/sequoia-chat-db";

export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM campaigns ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, template_name, message_text, filter_criteria, scheduled_at } = await req.json();
    
    // Count recipients based on filter
    let recipientQuery = "SELECT id, session_id FROM contacts WHERE 1=1";
    const params: any[] = [];
    
    if (filter_criteria?.status !== undefined) {
      params.push(filter_criteria.status);
      recipientQuery += ` AND conversation_status = $${params.length}`;
    }
    if (filter_criteria?.labelId) {
      params.push(filter_criteria.labelId);
      recipientQuery += ` AND id IN (SELECT contact_id FROM contact_labels WHERE label_id = $${params.length})`;
    }
    if (filter_criteria?.city) {
      params.push(`%${filter_criteria.city}%`);
      recipientQuery += ` AND ciudad ILIKE $${params.length}`;
    }

    const recipients = await pool.query(recipientQuery, params);
    
    // Create campaign
    const { rows } = await pool.query(
      `INSERT INTO campaigns (name, template_name, message_text, filter_criteria, scheduled_at, total_recipients, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft') RETURNING *`,
      [name, template_name || null, message_text || null, JSON.stringify(filter_criteria || {}), scheduled_at || null, recipients.rows.length]
    );

    // Insert recipients
    const campaign = rows[0];
    for (const r of recipients.rows) {
      await pool.query(
        "INSERT INTO campaign_recipients (campaign_id, contact_id, session_id) VALUES ($1, $2, $3)",
        [campaign.id, r.id, r.session_id]
      );
    }

    return NextResponse.json(campaign);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, action } = await req.json();

    if (action === "start") {
      // Start sending campaign
      await pool.query(
        "UPDATE campaigns SET status = 'sending', started_at = NOW() WHERE id = $1",
        [id]
      );

      // Get recipients
      const { rows: recipients } = await pool.query(
        "SELECT * FROM campaign_recipients WHERE campaign_id = $1 AND status = 'pending'",
        [id]
      );

      // Get campaign info
      const { rows: [campaign] } = await pool.query("SELECT * FROM campaigns WHERE id = $1", [id]);
      
      const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
      const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
      
      if (!WHATSAPP_TOKEN || WHATSAPP_TOKEN === "PENDIENTE_CONFIGURAR") {
        return NextResponse.json({ error: "Token de WhatsApp no configurado" }, { status: 400 });
      }

      let sentCount = 0;
      let failedCount = 0;

      // Send in batches with rate limiting
      for (const recipient of recipients) {
        try {
          let body: any;
          if (campaign.template_name) {
            body = {
              messaging_product: "whatsapp",
              to: recipient.session_id,
              type: "template",
              template: { name: campaign.template_name, language: { code: "es" } },
            };
          } else {
            body = {
              messaging_product: "whatsapp",
              to: recipient.session_id,
              type: "text",
              text: { body: campaign.message_text },
            };
          }

          const res = await fetch(
            `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const waId = data.messages?.[0]?.id;
            await pool.query(
              "UPDATE campaign_recipients SET status = 'sent', wa_message_id = $1, sent_at = NOW() WHERE id = $2",
              [waId, recipient.id]
            );
            sentCount++;
          } else {
            const err = await res.json();
            await pool.query(
              "UPDATE campaign_recipients SET status = 'failed', error_message = $1 WHERE id = $2",
              [JSON.stringify(err), recipient.id]
            );
            failedCount++;
          }

          // Rate limit: ~80 messages per second max (WhatsApp limit)
          await new Promise(r => setTimeout(r, 50));
        } catch (e: any) {
          await pool.query(
            "UPDATE campaign_recipients SET status = 'failed', error_message = $1 WHERE id = $2",
            [e.message, recipient.id]
          );
          failedCount++;
        }
      }

      // Update campaign status
      await pool.query(
        `UPDATE campaigns SET 
          status = 'completed', 
          sent_count = $1, 
          failed_count = $2, 
          completed_at = NOW() 
         WHERE id = $3`,
        [sentCount, failedCount, id]
      );

      return NextResponse.json({ sent: sentCount, failed: failedCount });
    }

    if (action === "delete") {
      await pool.query("DELETE FROM campaigns WHERE id = $1", [id]);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
