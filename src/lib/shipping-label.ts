// Shipping label HTML generation for print
interface LabelData {
  orderNumber: string;
  carrier: string;
  trackingNumber?: string;
  weight?: number;
  sender: { name: string; address: string; city: string; phone: string };
  recipient: { name: string; address: string; city: string; state: string; phone: string };
  items: { name: string; quantity: number }[];
}

export function generateShippingLabelHTML(data: LabelData): string {
  const itemsList = data.items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Guía ${data.orderNumber}</title>
<style>
  body{font-family:Arial,sans-serif;color:#000;max-width:400px;margin:0 auto;padding:10px;}
  @media print{body{padding:0;} .no-print{display:none;}}
  .label{border:3px solid #000;padding:15px;page-break-after:always;}
  .barcode{font-family:monospace;font-size:24px;letter-spacing:4px;text-align:center;padding:10px;background:#f5f5f5;margin:10px 0;}
  .section{margin:10px 0;padding:8px 0;border-top:1px dashed #999;}
  h3{margin:0 0 5px;font-size:11px;text-transform:uppercase;color:#666;}
  p{margin:2px 0;font-size:13px;}
  .big{font-size:18px;font-weight:bold;}
</style>
</head>
<body>
  <div class="no-print" style="margin-bottom:10px;">
    <button onclick="window.print()" style="padding:8px 16px;background:#000;color:white;border:none;border-radius:4px;cursor:pointer;">Imprimir Guía</button>
  </div>
  <div class="label">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div><strong style="font-size:16px;">SEQUOIA SPEED</strong></div>
      <div style="text-align:right;">
        <span style="font-size:12px;">#${data.orderNumber}</span><br>
        <span style="font-size:11px;color:#666;">${data.carrier.toUpperCase()}</span>
      </div>
    </div>

    ${data.trackingNumber ? `<div class="barcode">${data.trackingNumber}</div>` : ""}

    <div class="section">
      <h3>Remitente</h3>
      <p><strong>${data.sender.name}</strong></p>
      <p>${data.sender.address}</p>
      <p>${data.sender.city} | Tel: ${data.sender.phone}</p>
    </div>

    <div class="section">
      <h3>Destinatario</h3>
      <p class="big">${data.recipient.name}</p>
      <p>${data.recipient.address}</p>
      <p><strong>${data.recipient.city}, ${data.recipient.state}</strong></p>
      <p>Tel: ${data.recipient.phone}</p>
    </div>

    <div class="section">
      <h3>Contenido (${data.items.reduce((s, i) => s + i.quantity, 0)} items)</h3>
      <ul style="margin:5px 0;padding-left:20px;font-size:12px;">${itemsList}</ul>
      ${data.weight ? `<p style="font-size:11px;color:#666;">Peso: ${data.weight} kg</p>` : ""}
    </div>

    <div style="text-align:center;margin-top:10px;font-size:10px;color:#999;">
      sequoiaspeed.com.co
    </div>
  </div>
</body></html>`;
}
