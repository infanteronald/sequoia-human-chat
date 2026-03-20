// Invoice HTML generation for print
interface InvoiceItem {
  name: string;
  variant?: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  orderNumber: string;
  date: string;
  customer: { name: string; email: string; phone?: string };
  shipping: { name: string; address: string; city: string; state: string; phone?: string };
  items: InvoiceItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod?: string;
}

function formatCOP(n: number): string {
  return "$ " + n.toLocaleString("es-CO");
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}${item.variant ? ` <span style="color:#666;">(${item.variant})</span>` : ""}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatCOP(item.price)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatCOP(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Factura ${data.orderNumber}</title>
<style>
  body{font-family:Arial,sans-serif;color:#333;max-width:800px;margin:0 auto;padding:20px;}
  @media print{body{padding:0;} .no-print{display:none;}}
  table{width:100%;border-collapse:collapse;}
  .header{display:flex;justify-content:space-between;align-items:start;margin-bottom:30px;border-bottom:3px solid #e53e3e;padding-bottom:20px;}
  .total-row{font-size:18px;font-weight:bold;}
</style>
</head>
<body>
  <div class="no-print" style="margin-bottom:20px;">
    <button onclick="window.print()" style="padding:10px 20px;background:#e53e3e;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;">Imprimir Factura</button>
  </div>
  <div class="header">
    <div>
      <h1 style="margin:0;color:#e53e3e;font-size:28px;">SEQUOIA SPEED</h1>
      <p style="margin:5px 0;color:#666;">Indumentaria para Motociclistas</p>
      <p style="margin:2px 0;font-size:12px;color:#888;">NIT: 901.XXX.XXX-X</p>
      <p style="margin:2px 0;font-size:12px;color:#888;">Bogotá, Colombia</p>
    </div>
    <div style="text-align:right;">
      <h2 style="margin:0;color:#333;">FACTURA</h2>
      <p style="margin:5px 0;font-size:16px;">#${data.orderNumber}</p>
      <p style="margin:2px 0;font-size:13px;color:#666;">Fecha: ${data.date}</p>
      ${data.paymentMethod ? `<p style="margin:2px 0;font-size:13px;color:#666;">Pago: ${data.paymentMethod}</p>` : ""}
    </div>
  </div>

  <div style="display:flex;gap:40px;margin-bottom:30px;">
    <div style="flex:1;">
      <h3 style="margin:0 0 8px;color:#666;font-size:12px;text-transform:uppercase;">Cliente</h3>
      <p style="margin:2px 0;font-weight:bold;">${data.customer.name}</p>
      <p style="margin:2px 0;font-size:13px;">${data.customer.email}</p>
      ${data.customer.phone ? `<p style="margin:2px 0;font-size:13px;">Tel: ${data.customer.phone}</p>` : ""}
    </div>
    <div style="flex:1;">
      <h3 style="margin:0 0 8px;color:#666;font-size:12px;text-transform:uppercase;">Envío</h3>
      <p style="margin:2px 0;font-weight:bold;">${data.shipping.name}</p>
      <p style="margin:2px 0;font-size:13px;">${data.shipping.address}</p>
      <p style="margin:2px 0;font-size:13px;">${data.shipping.city}, ${data.shipping.state}</p>
      ${data.shipping.phone ? `<p style="margin:2px 0;font-size:13px;">Tel: ${data.shipping.phone}</p>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr style="background:#f7f7f7;">
        <th style="padding:10px 8px;text-align:left;">Producto</th>
        <th style="padding:10px 8px;text-align:center;width:80px;">Cant.</th>
        <th style="padding:10px 8px;text-align:right;width:120px;">Precio</th>
        <th style="padding:10px 8px;text-align:right;width:120px;">Total</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div style="margin-top:20px;text-align:right;">
    <p style="margin:4px 0;">Subtotal: ${formatCOP(data.subtotal)}</p>
    <p style="margin:4px 0;">Envío: ${formatCOP(data.shippingCost)}</p>
    ${data.tax > 0 ? `<p style="margin:4px 0;">IVA: ${formatCOP(data.tax)}</p>` : ""}
    <p class="total-row" style="margin:10px 0;padding-top:10px;border-top:2px solid #333;">Total: ${formatCOP(data.total)}</p>
  </div>

  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#888;font-size:11px;">
    <p>Gracias por tu compra en Sequoia Speed | www.sequoiaspeed.com.co</p>
  </div>
</body></html>`;
}
