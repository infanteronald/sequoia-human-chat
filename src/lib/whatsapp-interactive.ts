export interface InteractiveButton {
  type: "reply";
  reply: { id: string; title: string };
}

export interface InteractiveMessage {
  type: "button" | "list";
  body: { text: string };
  action: {
    buttons?: InteractiveButton[];
    button?: string;
    sections?: { title: string; rows: { id: string; title: string; description?: string }[] }[];
  };
}

export function buildProductButtons(productSlug: string): InteractiveMessage {
  return {
    type: "button",
    body: { text: "" }, // will be set by caller
    action: {
      buttons: [
        { type: "reply", reply: { id: `tallas_${productSlug}`, title: "📏 Ver tallas" } },
        { type: "reply", reply: { id: `fotos_${productSlug}`, title: "📸 Ver fotos" } },
        { type: "reply", reply: { id: `comprar_${productSlug}`, title: "🛒 Comprar" } },
      ],
    },
  };
}

export function buildCategoryList(): InteractiveMessage {
  return {
    type: "list",
    body: { text: "Que tipo de producto le interesa?" },
    action: {
      button: "Ver categorias",
      sections: [{
        title: "Categorias",
        rows: [
          { id: "cat_impermeables", title: "Impermeables", description: "Chaqueta + pantalon impermeable" },
          { id: "cat_chaquetas", title: "Chaquetas", description: "Con protecciones certificadas CE" },
          { id: "cat_pantalones", title: "Pantalones", description: "Antifriccion con protecciones" },
          { id: "cat_guantes", title: "Guantes", description: "Con protecciones para moto" },
          { id: "cat_combos", title: "Combos", description: "Chaqueta + pantalon" },
        ],
      }],
    },
  };
}

export function formatInteractivePayload(to: string, interactive: InteractiveMessage) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive,
  };
}

// Parse button click ID to determine user intent
export function parseButtonClick(buttonId: string): { action: string; slug: string } | null {
  const match = buttonId.match(/^(tallas|fotos|comprar|cat)_(.+)$/);
  if (!match) return null;
  return { action: match[1], slug: match[2] };
}
