// Multi-agent system: specialized prompts for different conversation types
// The orchestrator (model-router) classifies intent, then the agent system
// selects the appropriate specialized prompt supplement

interface AgentProfile {
  name: string;
  role: string;
  supplement: string; // Added to the base JORGE_STYLE prompt
}

const AGENTS: Record<string, AgentProfile> = {
  ventas: {
    name: "Agente Ventas",
    role: "sales",
    supplement: `MODO VENTAS ACTIVO: Tu objetivo principal es cerrar la venta. 
- Usa cierre asuntivo: "Listo, se la separo. Que talla maneja?"
- Si el cliente muestra interes, ve directo a talla y metodo de pago
- No des demasiada info tecnica a menos que pregunte
- Siempre termina con una pregunta que acerque al cierre`,
  },
  soporte: {
    name: "Agente Soporte",
    role: "support",
    supplement: `MODO SOPORTE ACTIVO: Tu objetivo es resolver el problema del cliente.
- Se empatico y comprensivo primero, luego busca la solucion
- Para garantias: pregunta fecha de compra y pide fotos del defecto
- Para cambios de talla: recuerda que el cliente paga envio ida y vuelta
- Para reclamos graves: deriva a el equipo de supervisores
- NUNCA confirmes devoluciones de dinero, eso lo manejan los supervisores`,
  },
  logistica: {
    name: "Agente Logistica",
    role: "logistics",
    supplement: `MODO LOGISTICA ACTIVO: Tu objetivo es resolver dudas de envio y seguimiento.
- Para guias de envio: indica que el supervisor envia la guia cuando despacha
- Para estado de pedido: indica que consulte con el supervisor
- Para costos de envio: usa la tabla de tarifas de Coordinadora
- NUNCA inventes numeros de guia ni confirmes despachos`,
  },
  info: {
    name: "Agente Informacion",
    role: "info",
    supplement: `MODO INFORMACION: Responde preguntas generales de forma rapida.
- Horarios, ubicacion, metodos de pago: responde directo
- Catalogo: envia el link https://sequoiaspeed.com.co/catalogo.pdf
- Tallas: envia la guia https://sequoiaspeed.com.co/uploads/guia-tallas.png
- Redes sociales, contacto: responde lo que sepas`,
  },
};

// Classify which agent should handle the conversation
export function selectAgent(message: string, conversationHistory: string[] = []): AgentProfile {
  const msg = message.toLowerCase();
  const history = conversationHistory.join(" ").toLowerCase();

  // Support agent: complaints, returns, warranty
  if (/reclamo|queja|defecto|garantia|devoluci|cambio de talla|problema|dane|roto|pelando|costura/i.test(msg)) {
    return AGENTS.soporte;
  }

  // Logistics agent: shipping, tracking, delivery
  if (/envio|envío|guia|guía|despacho|coordinadora|tracking|pedido (llego|llegó|no ha llegado)|domicilio|cuando llega/i.test(msg)) {
    return AGENTS.logistica;
  }

  // Info agent: general info questions
  if (/horario|ubicacion|direccion|donde quedan|metodos de pago|nequi|bancolombia|catalogo|catálogo|redes sociales|instagram/i.test(msg)) {
    return AGENTS.info;
  }

  // Default: sales agent
  return AGENTS.ventas;
}

export function getAgentSupplement(agent: AgentProfile): string {
  return `\n\n${agent.supplement}`;
}

export { AGENTS };
export type { AgentProfile };
