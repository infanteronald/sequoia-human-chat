type Intent = "greeting" | "faq" | "product_query" | "complex";

interface ModelConfig {
  model: string;
  maxTokens: number;
  intent: Intent;
}

const GREETING_PATTERNS = /^(hola|hey|buenas|saludos|buenos?\s*d[ií]as?|que\s*tal|hi|hello|ey|epa)[\s!?.]*$/i;

const FAQ_KEYWORDS = ["envio", "envío", "pago", "garantia", "garantía", "devolucion", "devolución", "horario", "ubicacion", "ubicación", "direccion", "dirección", "tienda", "metodos", "métodos", "nequi", "bancolombia", "domicilio", "coordinadora", "catalogo", "catálogo"];

const COMPLEX_KEYWORDS = ["queja", "reclamo", "problema", "insatisfecho", "mal servicio", "nunca llego", "defectuoso", "estafa", "denuncia", "devolver", "reembolso", "por mayor", "al por mayor", "cotizacion", "cotización", "dotacion", "dotación", "corporativo", "empresa", "personalizado", "medidas especiales"];

const PRODUCT_KEYWORDS = ["chaqueta", "pantalon", "pantalón", "impermeable", "guante", "bota", "storm", "sahara", "black pro", "gas black", "mesh", "talla", "precio", "cuanto", "cuánto", "cuesta", "vale", "tiene", "venden", "disponible", "color", "proteccion", "protección"];

export function classifyIntent(message: string): Intent {
  const msg = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
  // Short greetings
  if (GREETING_PATTERNS.test(message.trim())) return "greeting";
  if (msg.length < 15 && !PRODUCT_KEYWORDS.some(k => msg.includes(k))) return "greeting";
  
  // Complex queries (complaints, corporate, bulk)
  if (COMPLEX_KEYWORDS.some(k => msg.includes(k))) return "complex";
  if (msg.length > 200) return "complex"; // Long messages tend to be complex
  
  // Product queries
  if (PRODUCT_KEYWORDS.some(k => msg.includes(k))) return "product_query";
  
  // FAQ (shipping, payments, location, etc.)
  if (FAQ_KEYWORDS.some(k => msg.includes(k))) return "faq";
  
  // Default to product_query (most common use case)
  return "product_query";
}

export function getModelConfig(intent: Intent): ModelConfig {
  switch (intent) {
    case "greeting":
      return { model: "claude-haiku-4-5", maxTokens: 60, intent };
    case "faq":
      return { model: "claude-haiku-4-5", maxTokens: 100, intent };
    case "product_query":
      return { model: "claude-haiku-4-5", maxTokens: 120, intent };
    case "complex":
      return { model: "claude-sonnet-4-20250514", maxTokens: 200, intent };
  }
}

export function isProductRelated(message: string): boolean {
  const msg = message.toLowerCase();
  return PRODUCT_KEYWORDS.some(k => msg.includes(k));
}
