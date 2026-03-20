import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Compress conversation history to reduce tokens
// Keeps last N messages verbatim, summarizes older ones
export async function compressConversation(
  messages: { mensaje: string; is_bot: boolean; nombre_agente?: string; fecha_creacion: string }[],
  keepRecent: number = 6
): Promise<{ summary: string; recentMessages: typeof messages }> {
  
  if (messages.length <= keepRecent) {
    return { summary: "", recentMessages: messages };
  }

  // Split: older messages get summarized, recent ones stay verbatim
  const olderMessages = messages.slice(0, messages.length - keepRecent);
  const recentMessages = messages.slice(messages.length - keepRecent);

  // Build text for summarization
  const conversationText = olderMessages.map(m => 
    `${m.is_bot ? "Asesor" : "Cliente"}: ${m.mensaje}`
  ).join("\n");

  try {
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 100,
      system: "Resume esta conversacion de WhatsApp en MAXIMO 3 lineas. Incluye: que producto pregunto, que precio se dio, que talla, ciudad del cliente, y en que punto quedo la conversacion. Solo datos clave, sin relleno.",
      messages: [{ role: "user", content: conversationText }],
    });

    const summary = res.content[0].type === "text" ? res.content[0].text : "";
    return { summary: `[Resumen conversacion anterior: ${summary}]`, recentMessages };
  } catch (e) {
    console.error("[Context Compress]", e);
    // Fallback: return all messages without compression
    return { summary: "", recentMessages: messages };
  }
}
