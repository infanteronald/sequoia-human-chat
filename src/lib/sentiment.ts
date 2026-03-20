// Lightweight sentiment analysis for WhatsApp messages
// Detects frustration/anger to trigger automatic human handoff

const NEGATIVE_PATTERNS = [
  // Frustration keywords (Spanish)
  /\b(reclamo|queja|insatisfecho|molesto|enojado|furioso|indignado|decepcionado|decepcion|frustra)\b/i,
  /\b(estafa|ladron|ladrona|robo|fraude|engano|mentira|mentiroso)\b/i,
  /\b(demanda|abogado|sic|superintendencia|denuncia|demando)\b/i,
  /\b(inutil|incompetente|pesimo|pesima|terrible|horrible|desastre|basura|porqueria)\b/i,
  /\b(nunca (mas|más)|no vuelvo|no compro|me arrepiento)\b/i,
  /\b(devuelv|reembols|devolucion|plata de vuelta|dinero de vuelta)\b/i,
  // ALL CAPS detection (3+ consecutive caps words = yelling)
  /\b[A-ZÁÉÍÓÚÑ]{4,}(\s+[A-ZÁÉÍÓÚÑ]{4,}){2,}\b/,
  // Excessive punctuation (frustration)
  /[!?]{3,}/,
  // Profanity (Colombian Spanish)
  /\b(mierda|hijueputa|marica|gonorrea|hp|malparido|mkda|jueputa)\b/i,
];

const ESCALATION_PHRASES = [
  /\b(quiero hablar con (un|una|alguien|persona|humano|agente|asesor|gerente|jefe|supervisor))\b/i,
  /\b(pas(a|e)me con (un|una|alguien|otra persona))\b/i,
  /\b(no quiero hablar con (un )?bot|no quiero hablar con (una )?maquina|eres (un )?robot)\b/i,
  /\b(necesito hablar con alguien)\b/i,
];

export interface SentimentResult {
  score: number;          // 0-100 (0=very negative, 50=neutral, 100=positive)
  shouldEscalate: boolean;
  reason: string | null;
}

export function analyzeSentiment(message: string): SentimentResult {
  let negativeScore = 0;
  let reason: string | null = null;

  // Check for explicit escalation requests
  for (const pattern of ESCALATION_PHRASES) {
    if (pattern.test(message)) {
      return { score: 10, shouldEscalate: true, reason: "Cliente solicita hablar con humano" };
    }
  }

  // Check negative patterns
  for (const pattern of NEGATIVE_PATTERNS) {
    if (pattern.test(message)) {
      negativeScore += 30;
      if (!reason) {
        if (/reclamo|queja/i.test(message)) reason = "Reclamo detectado";
        else if (/estafa|fraude|robo/i.test(message)) reason = "Acusacion grave detectada";
        else if (/demanda|abogado|sic/i.test(message)) reason = "Amenaza legal detectada";
        else if (/devuelv|reembols/i.test(message)) reason = "Solicitud de devolucion";
        else if (/[A-Z]{4,}/.test(message)) reason = "Cliente escribiendo en mayusculas";
        else if (/mierda|hijueputa|gonorrea/i.test(message)) reason = "Lenguaje ofensivo detectado";
        else reason = "Sentimiento negativo detectado";
      }
    }
  }

  // Message length factor (long angry messages)
  if (message.length > 300 && negativeScore > 0) negativeScore += 20;

  // Calculate final score
  const score = Math.max(0, 50 - negativeScore);
  const shouldEscalate = score < 25;

  return { score, shouldEscalate, reason };
}

// Check conversation history for repeated negative sentiment
export function checkConversationFrustration(messages: { mensaje: string; is_bot: boolean }[]): boolean {
  const clientMessages = messages.filter(m => !m.is_bot).slice(-5); // last 5 client messages
  let negativeCount = 0;
  for (const msg of clientMessages) {
    const result = analyzeSentiment(msg.mensaje || "");
    if (result.score < 40) negativeCount++;
  }
  // If 3+ of last 5 messages are negative, escalate
  return negativeCount >= 3;
}


// ML-based sentiment analysis using Claude (for important cases)
export async function analyzeSentimentML(message: string): Promise<SentimentResult> {
  // First try fast regex
  const regexResult = analyzeSentiment(message);
  
  // If regex is confident (very negative or explicit request), use it directly
  if (regexResult.score < 20 || regexResult.shouldEscalate) {
    return regexResult;
  }
  
  // For ambiguous cases (score 20-45), use Claude for better analysis
  if (regexResult.score < 45 && message.length > 20) {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic();
      const res = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 30,
        system: "Analiza el sentimiento de este mensaje de WhatsApp en espanol. Responde SOLO con: POSITIVO, NEUTRAL, NEGATIVO, o FURIOSO. Nada mas.",
        messages: [{ role: "user", content: message }],
      });
      const sentiment = (res.content[0] as any).text?.trim().toUpperCase() || "";
      if (sentiment.includes("FURIOSO")) return { score: 5, shouldEscalate: true, reason: "IA detecta cliente furioso" };
      if (sentiment.includes("NEGATIVO")) return { score: 30, shouldEscalate: false, reason: "Sentimiento negativo (IA)" };
    } catch {}
  }
  
  return regexResult;
}
