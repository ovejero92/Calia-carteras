import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    }
});

// ── Email a la PROPIETARIA cuando llega un pedido nuevo ──
export const sendNewOrderToOwner = async (sale) => {
    const itemsHtml = sale.items.map(item => `
        <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.productName}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">$${item.subtotal.toLocaleString('es-AR')}</td>
        </tr>
    `).join('');

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

    await transporter.sendMail({
        from: `"Calia - Pedidos" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `🛍️ Nuevo pedido #${sale.saleNumber} de ${sale.userName}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;">
            <div style="background:#2c3e50;color:white;padding:25px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="margin:0;font-size:24px;">🛍️ Nuevo Pedido Recibido</h1>
                <p style="margin:8px 0 0;opacity:0.8;">Pedido #${sale.saleNumber}</p>
            </div>
            <div style="background:white;padding:25px;border-radius:0 0 8px 8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color:#333;border-bottom:2px solid #eee;padding-bottom:8px;">👤 Datos del Cliente</h3>
                <p><strong>Nombre:</strong> ${sale.userName}</p>
                <p><strong>Email:</strong> ${sale.userEmail || '-'}</p>
                <p><strong>Teléfono:</strong> ${sale.userPhone || '-'}</p>
                <p><strong>Dirección:</strong> ${sale.userAddress || '-'}</p>
                <p><strong>Método de pago:</strong> ${sale.paymentMethod}</p>
                ${sale.notes ? `<p><strong>Notas:</strong> ${sale.notes}</p>` : ''}
                <h3 style="color:#333;border-bottom:2px solid #eee;padding-bottom:8px;margin-top:20px;">📦 Productos</h3>
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f8f9fa;">
                            <th style="padding:8px 12px;text-align:left;">Producto</th>
                            <th style="padding:8px 12px;text-align:center;">Cant.</th>
                            <th style="padding:8px 12px;text-align:right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding:12px;text-align:right;font-weight:bold;font-size:16px;">Total:</td>
                            <td style="padding:12px;text-align:right;font-weight:bold;font-size:16px;color:#28a745;">$${sale.total.toLocaleString('es-AR')}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="margin-top:30px;text-align:center;">
                    <a href="${baseUrl}/owner/sales/${sale.id}/accept"
                       style="display:inline-block;padding:14px 30px;background:#28a745;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;margin-right:15px;">
                        ✅ Aceptar Pedido
                    </a>
                    <a href="${baseUrl}/owner/sales/${sale.id}/reject"
                       style="display:inline-block;padding:14px 30px;background:#dc3545;color:white;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">
                        ❌ Rechazar Pedido
                    </a>
                </div>
                <p style="text-align:center;margin-top:15px;font-size:12px;color:#999;">
                    También podés gestionar desde el 
                    <a href="${baseUrl}/owner/sales" style="color:#007bff;">panel de ventas</a>
                </p>
            </div>
        </div>`
    });
};

// ── Email al CLIENTE cuando su pedido es aceptado ──
export const sendOrderAcceptedToClient = async (sale) => {
    if (!sale.userEmail) return;

    await transporter.sendMail({
        from: `"Calia Carteras" <${process.env.GMAIL_USER}>`,
        to: sale.userEmail,
        subject: `✅ Tu pedido #${sale.saleNumber} fue aceptado`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;">
            <div style="background:#28a745;color:white;padding:25px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="margin:0;font-size:24px;">✅ ¡Pedido Aceptado!</h1>
                <p style="margin:8px 0 0;opacity:0.9;">Pedido #${sale.saleNumber}</p>
            </div>
            <div style="background:white;padding:25px;border-radius:0 0 8px 8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <p style="font-size:16px;color:#333;">Hola <strong>${sale.userName}</strong>,</p>
                <p style="color:#555;">¡Tu pedido fue aceptado! Estamos preparando todo para vos.</p>
                ${sale.estimatedDelivery ? `
                <div style="background:#e8f5e9;border-left:4px solid #28a745;padding:15px;border-radius:4px;margin:20px 0;">
                    <p style="margin:0;font-size:16px;color:#2e7d32;">
                        🕐 <strong>Horario estimado de entrega:</strong> ${sale.estimatedDelivery}
                    </p>
                </div>` : ''}
                <h3 style="color:#333;border-bottom:2px solid #eee;padding-bottom:8px;">📦 Tu pedido</h3>
                ${sale.items.map(item => `
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;">
                        <span>${item.productName} x${item.quantity}</span>
                        <strong>$${item.subtotal.toLocaleString('es-AR')}</strong>
                    </div>
                `).join('')}
                <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:18px;font-weight:bold;">
                    <span>Total</span>
                    <span style="color:#28a745;">$${sale.total.toLocaleString('es-AR')}</span>
                </div>
                <p style="color:#555;"><strong>Método de pago:</strong> ${sale.paymentMethod}</p>
                <p style="color:#777;font-size:13px;margin-top:20px;border-top:1px solid #eee;padding-top:15px;">
                    Podés rastrear tu pedido ingresando tu email en nuestra tienda.
                </p>
            </div>
        </div>`
    });
};

// ── Email al CLIENTE cuando su pedido es rechazado ──
export const sendOrderRejectedToClient = async (sale) => {
    if (!sale.userEmail) return;

    await transporter.sendMail({
        from: `"Calia Carteras" <${process.env.GMAIL_USER}>`,
        to: sale.userEmail,
        subject: `❌ Tu pedido #${sale.saleNumber} no pudo procesarse`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;">
            <div style="background:#dc3545;color:white;padding:25px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="margin:0;font-size:24px;">Lo sentimos</h1>
                <p style="margin:8px 0 0;opacity:0.9;">Pedido #${sale.saleNumber}</p>
            </div>
            <div style="background:white;padding:25px;border-radius:0 0 8px 8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                <p style="font-size:16px;color:#333;">Hola <strong>${sale.userName}</strong>,</p>
                <p style="color:#555;">Lamentablemente no pudimos procesar tu pedido en este momento. Es posible que alguno de los productos ya no esté disponible.</p>
                <p style="color:#555;">Si tenés dudas, no dudes en contactarnos respondiendo este email.</p>
                <p style="color:#777;font-size:13px;margin-top:20px;border-top:1px solid #eee;padding-top:15px;">
                    ¡Esperamos verte pronto en Calia!
                </p>
            </div>
        </div>`
    });
};