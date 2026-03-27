import nodemailer from "nodemailer";

const STORE_NAME = "Sequoia Speed Colombia";
const STORE_URL = "https://sequoiaspeed.com.co";
const LOGO_URL = `${STORE_URL}/logo-sequoia.png`;
const WHATSAPP_NUMBER = "573247892412";
const PRIMARY_COLOR = "#DC2626";
const FROM_EMAIL = `${STORE_NAME} <ventas@sequoiaspeed.com.co>`;

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

/* ─── Base Template ─── */
function baseTemplate(content: string, preheader = "") {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>${STORE_NAME}</title>
<!--[if mso]><style>table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
${preheader ? `<div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

<!-- Header -->
<tr><td style="background-color:#0a0a0a;padding:24px 32px;text-align:center;">
  <a href="${STORE_URL}" style="text-decoration:none;">
    <img src="${LOGO_URL}" alt="${STORE_NAME}" width="80" height="45" style="display:inline-block;vertical-align:middle;"/>
  </a>
</td></tr>

<!-- Content -->
<tr><td style="padding:32px;">
${content}
</td></tr>

<!-- Footer -->
<tr><td style="background-color:#fafafa;padding:24px 32px;border-top:1px solid #e5e7eb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">¿Necesitas ayuda? Estamos para ti</p>
      <a href="https://wa.me/${WHATSAPP_NUMBER}" style="display:inline-block;padding:8px 20px;background-color:#25D366;color:#ffffff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">💬 Escríbenos por WhatsApp</a>
      <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">
        ${STORE_NAME} · Colombia<br/>
        <a href="${STORE_URL}" style="color:#9ca3af;">sequoiaspeed.com.co</a>
      </p>
    </td></tr>
  </table>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ─── Item Row Helper ─── */
function itemRow(item: { name: string; quantity: number; price: number; variantName?: string; image?: string }) {
  return `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${item.image ? `<td width="60" style="vertical-align:top;"><img src="${item.image}" alt="" width="56" height="56" style="border-radius:8px;object-fit:cover;background-color:#f3f4f6;"/></td>` : ""}
          <td style="vertical-align:top;padding-left:${item.image ? "12" : "0"}px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#1f2937;">${item.name}</p>
            ${item.variantName ? `<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">${item.variantName}</p>` : ""}
            <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">Cant: ${item.quantity}</p>
          </td>
          <td style="vertical-align:top;text-align:right;white-space:nowrap;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#1f2937;">$${(item.price * item.quantity).toLocaleString("es-CO")}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

/* ─── Format price ─── */
function fmtPrice(n: number) {
  return `$${n.toLocaleString("es-CO")}`;
}

/* ─── Status badge ─── */
function statusBadge(label: string, color: string) {
  return `<span style="display:inline-block;padding:4px 14px;background-color:${color}15;color:${color};border-radius:20px;font-size:13px;font-weight:600;">${label}</span>`;
}

/* ═══════════════════════════════════════
   EMAIL TEMPLATES
   ═══════════════════════════════════════ */

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number; variantName?: string; image?: string }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentLabel: string;
  shippingAddress: string;
  city: string;
  department: string;
  paymentInstructions?: string;
}

/* ── 1. Order Confirmation ── */
export function orderConfirmationEmail(data: OrderEmailData) {
  const itemsHtml = data.items.map(itemRow).join("");

  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;margin-bottom:8px;">✅</div>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#1f2937;">¡Pedido recibido!</h1>
      <p style="margin:8px 0 0;font-size:15px;color:#6b7280;">Gracias por tu compra, ${data.customerName.split(" ")[0]}</p>
    </div>

    <!-- Order number -->
    <div style="background-color:#fafafa;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Número de pedido</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:${PRIMARY_COLOR};letter-spacing:1px;">${data.orderNumber}</p>
    </div>

    ${data.paymentInstructions ? `
    <!-- Payment instructions -->
    <div style="background-color:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#92400E;">⚡ Instrucciones de pago — ${data.paymentLabel}</p>
      <p style="margin:0;font-size:13px;color:#78350F;line-height:1.5;">${data.paymentInstructions}</p>
    </div>` : ""}

    <!-- Items -->
    <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Resumen del pedido</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemsHtml}
    </table>

    <!-- Totals -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;">Subtotal</td><td style="text-align:right;font-size:14px;color:#6b7280;">${fmtPrice(data.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;">Envío</td><td style="text-align:right;font-size:14px;color:${data.shipping === 0 ? "#16a34a" : "#6b7280"};">${data.shipping === 0 ? "GRATIS" : fmtPrice(data.shipping)}</td></tr>
      ${data.discount > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#16a34a;">Descuento</td><td style="text-align:right;font-size:14px;color:#16a34a;">-${fmtPrice(data.discount)}</td></tr>` : ""}
      <tr><td colspan="2" style="padding:12px 0 0;border-top:2px solid #e5e7eb;"></td></tr>
      <tr><td style="padding:4px 0;font-size:18px;font-weight:700;color:#1f2937;">Total</td><td style="text-align:right;font-size:18px;font-weight:700;color:${PRIMARY_COLOR};">${fmtPrice(data.total)}</td></tr>
    </table>

    <!-- Shipping address -->
    <div style="margin-top:24px;padding:16px;background-color:#fafafa;border-radius:8px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">📦 Dirección de envío</p>
      <p style="margin:0;font-size:14px;color:#1f2937;line-height:1.5;">${data.shippingAddress}<br/>${data.city}, ${data.department}</p>
    </div>

    <!-- Método de pago -->
    <div style="margin-top:12px;padding:16px;background-color:#fafafa;border-radius:8px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">💳 Método de pago</p>
      <p style="margin:0;font-size:14px;color:#1f2937;">${data.paymentLabel}</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-top:28px;">
      <a href="${STORE_URL}/mi-cuenta/pedidos" style="display:inline-block;padding:12px 32px;background-color:${PRIMARY_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.5px;">VER MI PEDIDO</a>
    </div>
  `;

  return {
    subject: `Pedido ${data.orderNumber} confirmado — ${STORE_NAME}`,
    html: baseTemplate(content, `Tu pedido ${data.orderNumber} ha sido recibido. Gracias por comprar en ${STORE_NAME}.`),
  };
}

/* ── 2. Payment Confirmed ── */
export function paymentConfirmedEmail(data: { orderNumber: string; customerName: string; total: number }) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;margin-bottom:8px;">💰</div>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#1f2937;">¡Pago confirmado!</h1>
      <p style="margin:8px 0 0;font-size:15px;color:#6b7280;">${data.customerName.split(" ")[0]}, tu pago ha sido verificado</p>
    </div>

    <div style="background-color:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#065F46;text-transform:uppercase;letter-spacing:1px;">Pedido</p>
      <p style="margin:4px 0 8px;font-size:22px;font-weight:700;color:#065F46;">${data.orderNumber}</p>
      ${statusBadge("Pagado ✓", "#16a34a")}
    </div>

    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.6;text-align:center;">
      Ya estamos preparando tu pedido con mucho cuidado.<br/>Te notificaremos cuando sea despachado. 🏍️
    </p>

    <div style="text-align:center;margin-top:28px;">
      <a href="${STORE_URL}/mi-cuenta/pedidos" style="display:inline-block;padding:12px 32px;background-color:${PRIMARY_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;">VER MI PEDIDO</a>
    </div>
  `;

  return {
    subject: `Pago confirmado — Pedido ${data.orderNumber}`,
    html: baseTemplate(content, `Tu pago para el pedido ${data.orderNumber} ha sido verificado. Estamos preparando tu envío.`),
  };
}

/* ── 3. Order Shipped ── */
export function orderShippedEmail(data: { orderNumber: string; customerName: string; trackingNumber?: string; carrier?: string }) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;margin-bottom:8px;">🚚</div>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#1f2937;">¡Tu pedido va en camino!</h1>
      <p style="margin:8px 0 0;font-size:15px;color:#6b7280;">${data.customerName.split(" ")[0]}, tu pedido ha sido despachado</p>
    </div>

    <div style="background-color:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#1E40AF;text-transform:uppercase;letter-spacing:1px;">Pedido</p>
      <p style="margin:4px 0 8px;font-size:22px;font-weight:700;color:#1E40AF;">${data.orderNumber}</p>
      ${statusBadge("Enviado 🚚", "#2563eb")}
    </div>

    ${data.trackingNumber ? `
    <div style="background-color:#fafafa;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Número de guía</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#1f2937;letter-spacing:1px;">${data.trackingNumber}</p>
      ${data.carrier ? `<p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Transportadora: ${data.carrier}</p>` : ""}
    </div>` : ""}

    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.6;text-align:center;">
      Tu pedido está en camino. Si tienes preguntas sobre la entrega, escríbenos por WhatsApp. 📦
    </p>

    <div style="text-align:center;margin-top:28px;">
      <a href="${STORE_URL}/mi-cuenta/pedidos" style="display:inline-block;padding:12px 32px;background-color:${PRIMARY_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;">RASTREAR MI PEDIDO</a>
    </div>
  `;

  return {
    subject: `Tu pedido ${data.orderNumber} va en camino 🚚`,
    html: baseTemplate(content, `Tu pedido ${data.orderNumber} ha sido despachado y va en camino.`),
  };
}

/* ── 4. Order Delivered ── */
export function orderDeliveredEmail(data: { orderNumber: string; customerName: string }) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;margin-bottom:8px;">🎉</div>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#1f2937;">¡Pedido entregado!</h1>
      <p style="margin:8px 0 0;font-size:15px;color:#6b7280;">${data.customerName.split(" ")[0]}, tu pedido ha sido entregado</p>
    </div>

    <div style="background-color:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:12px;color:#065F46;text-transform:uppercase;letter-spacing:1px;">Pedido</p>
      <p style="margin:4px 0 8px;font-size:22px;font-weight:700;color:#065F46;">${data.orderNumber}</p>
      ${statusBadge("Entregado ✓", "#16a34a")}
    </div>

    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.6;text-align:center;">
      Esperamos que disfrutes tus nuevos productos. 🏍️<br/>
      ¿Te gustó tu compra? ¡Tu opinión nos ayuda a mejorar!
    </p>

    <div style="text-align:center;margin-top:28px;">
      <a href="${STORE_URL}" style="display:inline-block;padding:12px 32px;background-color:${PRIMARY_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;">SEGUIR COMPRANDO</a>
    </div>
  `;

  return {
    subject: `Pedido ${data.orderNumber} entregado — ¡Disfrútalo! 🎉`,
    html: baseTemplate(content, `Tu pedido ${data.orderNumber} ha sido entregado. ¡Esperamos que lo disfrutes!`),
  };
}

/* ── 5. Admin: New Order Notification ── */
export function adminNewOrderEmail(data: { orderNumber: string; customerName: string; total: number; paymentLabel: string; itemCount: number }) {
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;margin-bottom:8px;">🛒</div>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#1f2937;">Nuevo pedido recibido</h1>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border-radius:8px;">
      <tr><td style="padding:16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:13px;color:#6b7280;padding:4px 0;">Pedido</td><td style="text-align:right;font-size:14px;font-weight:700;color:${PRIMARY_COLOR};">${data.orderNumber}</td></tr>
          <tr><td style="font-size:13px;color:#6b7280;padding:4px 0;">Cliente</td><td style="text-align:right;font-size:14px;color:#1f2937;">${data.customerName}</td></tr>
          <tr><td style="font-size:13px;color:#6b7280;padding:4px 0;">Productos</td><td style="text-align:right;font-size:14px;color:#1f2937;">${data.itemCount} items</td></tr>
          <tr><td style="font-size:13px;color:#6b7280;padding:4px 0;">Método de pago</td><td style="text-align:right;font-size:14px;color:#1f2937;">${data.paymentLabel}</td></tr>
          <tr><td colspan="2" style="padding:8px 0 0;border-top:1px solid #e5e7eb;"></td></tr>
          <tr><td style="font-size:15px;font-weight:700;color:#1f2937;padding:4px 0;">Total</td><td style="text-align:right;font-size:18px;font-weight:700;color:${PRIMARY_COLOR};">${fmtPrice(data.total)}</td></tr>
        </table>
      </td></tr>
    </table>

    <div style="text-align:center;margin-top:24px;">
      <a href="${STORE_URL}/panel/pedidos" style="display:inline-block;padding:12px 32px;background-color:${PRIMARY_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;">VER EN EL PANEL</a>
    </div>
  `;

  return {
    subject: `🛒 Nuevo pedido ${data.orderNumber} — ${fmtPrice(data.total)}`,
    html: baseTemplate(content, `Nuevo pedido ${data.orderNumber} de ${data.customerName} por ${fmtPrice(data.total)}`),
  };
}

/* ═══ SEND EMAIL ═══ */
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}


/* ═══ CONVENIENCE FUNCTIONS ═══ */
export async function sendOrderConfirmation(email: string, data: OrderEmailData) {
  const { subject, html } = orderConfirmationEmail(data);
  return sendEmail(email, subject, html);
}

export async function sendPaymentConfirmed(email: string, data: { orderNumber: string; customerName: string; total: number }) {
  const { subject, html } = paymentConfirmedEmail(data);
  return sendEmail(email, subject, html);
}

export async function sendOrderShipped(email: string, data: { orderNumber: string; customerName: string; trackingNumber?: string; carrier?: string }) {
  const { subject, html } = orderShippedEmail(data);
  return sendEmail(email, subject, html);
}

export async function sendOrderDelivered(email: string, data: { orderNumber: string; customerName: string }) {
  const { subject, html } = orderDeliveredEmail(data);
  return sendEmail(email, subject, html);
}

export async function sendAdminNewOrder(data: { orderNumber: string; customerName: string; total: number; paymentLabel: string; itemCount: number }) {
  const ADMIN_EMAIL = "ventas@sequoiaspeed.com.co";
  const { subject, html } = adminNewOrderEmail(data);
  return sendEmail(ADMIN_EMAIL, subject, html);
}
