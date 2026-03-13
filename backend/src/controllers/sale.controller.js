import * as saleService from "../services/sale.service.js";
import * as productService from "../services/product.service.js";
import * as userService from "../services/user.service.js";
import { saleSchema, saleFilterSchema } from "../schemas/sale.schema.js";
import { sendNewOrderToOwner, sendOrderAcceptedToClient, sendOrderRejectedToClient } from "../services/email.service.js";

// Mapeo de métodos de pago a etiquetas legibles
const PAYMENT_LABELS = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    tarjeta_debito: "Tarjeta de débito",
    tarjeta_credito: "Tarjeta de crédito",
    tarjeta: "Tarjeta (sin detalle)",
    otro: "Otro",
};

export const renderSales = async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod;
        if (req.query.startDate) filters.startDate = req.query.startDate;
        if (req.query.endDate) filters.endDate = req.query.endDate;
        if (req.query.userId) filters.userId = req.query.userId;

        const salesList = await saleService.getSales(filters);

        let stats;
        try {
            stats = await saleService.getSaleStats(req.query.startDate || null, req.query.endDate || null);
        } catch (error) {
            stats = { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} };
        }

        const products = await productService.getProducts();

        let users = [];
        try {
            users = await userService.getUsers({ status: 'activo' });
        } catch (error) {
            users = [];
        }

        res.render('owner/sales', {
            titulo: 'Gestión de Ventas',
            user: req.user,
            sales: salesList,
            stats,
            products,
            users,
            filters,
        });
    } catch (error) {
        console.error("❌ Error al renderizar ventas:", error);
        res.status(500).send("Error al cargar las ventas.");
    }
};

export const createSale = async (req, res) => {
    try {
        // Normalizar método de pago: si viene tarjeta + cardType, combinarlos
        const body = { ...req.body };
        if (body.paymentMethod === "tarjeta" && body.cardType) {
            if (body.cardType === "debito") body.paymentMethod = "tarjeta_debito";
            else if (body.cardType === "credito") body.paymentMethod = "tarjeta_credito";
        }
        delete body.cardType;

        const result = saleSchema.safeParse(body);
        if (!result.success) {
            const errorMessages = result.error.errors.map(err => ({ path: err.path.join('.'), message: err.message }));
            return res.status(400).json({ errors: errorMessages });
        }

        const sale = await saleService.createSale(result.data);

        try {
            await sendNewOrderToOwner(sale);
            console.log("📧 Email de nuevo pedido enviado a la propietaria");
        } catch (emailError) {
            console.error("⚠️ Error enviando email a propietaria:", emailError.message);
        }

        res.status(201).json({ status: "success", message: "Venta creada exitosamente", data: sale });
    } catch (error) {
        console.error("Error al crear venta:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateSale = async (req, res) => {
    try {
        const { id } = req.params;
        const existingSale = await saleService.getSaleById(id);
        if (!existingSale) return res.status(404).json({ error: "Venta no encontrada" });

        const updateData = {};
        if (req.body.status && ['pendiente', 'completada', 'cancelada'].includes(req.body.status)) {
            updateData.status = req.body.status;
        }

        // Normalizar paymentMethod con cardType
        let pm = req.body.paymentMethod;
        if (pm === "tarjeta" && req.body.cardType) {
            if (req.body.cardType === "debito") pm = "tarjeta_debito";
            else if (req.body.cardType === "credito") pm = "tarjeta_credito";
        }
        const validMethods = Object.keys(PAYMENT_LABELS);
        if (pm && validMethods.includes(pm)) updateData.paymentMethod = pm;

        if (req.body.notes !== undefined) updateData.notes = req.body.notes;
        if (req.body.estimatedDelivery !== undefined) updateData.estimatedDelivery = req.body.estimatedDelivery;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No hay datos válidos para actualizar" });
        }

        await saleService.updateSale(id, updateData);
        res.json({ status: "success", message: "Venta actualizada exitosamente" });
    } catch (error) {
        console.error("Error al actualizar venta:", error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteSale = async (req, res) => {
    try {
        const { id } = req.params;
        const existingSale = await saleService.getSaleById(id);
        if (!existingSale) return res.status(404).json({ error: "Venta no encontrada" });
        await saleService.deleteSale(id);
        res.json({ status: "success", message: "Venta eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar venta:", error);
        res.status(500).json({ error: error.message });
    }
};

export const exportSalesCsv = async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod;
        if (req.query.startDate) filters.startDate = req.query.startDate;
        if (req.query.endDate) filters.endDate = req.query.endDate;
        if (req.query.userId) filters.userId = req.query.userId;

        const salesList = await saleService.getSales(filters);

        const header = ['NumeroVenta','Fecha','Cliente','Email','Telefono','MetodoPago','Estado','Total','CantidadItems','ProductosDetalle'];

        const rows = salesList.map(sale => {
            const date = sale.createdAt instanceof Date
                ? sale.createdAt.toISOString()
                : new Date(sale.createdAt).toISOString();

            const productos = (sale.items || [])
                .map(item => `${item.productName} x${item.quantity} ($${item.subtotal})`)
                .join(' | ');

            const pmLabel = PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod || '';

            return [
                sale.saleNumber || '',
                date,
                sale.userName || '',
                sale.userEmail || '',
                sale.userPhone || '',
                pmLabel,
                sale.status || '',
                sale.total ?? '',
                sale.items ? sale.items.length : 0,
                productos
            ].map(value => {
                const str = String(value ?? '');
                return (str.includes(',') || str.includes('"') || str.includes('\n'))
                    ? `"${str.replace(/"/g, '""')}"` : str;
            }).join(',');
        });

        const csvContent = [header.join(','), ...rows].join('\n');
        const fileName = `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(csvContent);
    } catch (error) {
        console.error("Error al exportar ventas CSV:", error);
        res.status(500).send("Error al exportar las ventas.");
    }
};

export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await saleService.getSaleById(id);
        if (!sale) return res.status(404).json({ error: "Venta no encontrada" });
        res.json({ status: "success", data: sale });
    } catch (error) {
        console.error("Error al obtener venta:", error);
        res.status(500).json({ error: error.message });
    }
};

export const acceptSale = async (req, res) => {
    try {
        const { id } = req.params;
        const estimatedDelivery = req.query.delivery || null;
        const sale = await saleService.getSaleById(id);

        if (!sale) return res.status(404).send(pageHtml('❌ Pedido no encontrado', '#dc3545', 'No se encontró el pedido.', null));

        if (sale.status !== 'pendiente') {
            return res.send(pageHtml('ℹ️ Pedido ya procesado', '#6c757d',
                `Este pedido ya fue procesado. Estado actual: <strong>${sale.status}</strong>`, id));
        }

        if (!estimatedDelivery) {
            return res.send(`
                <!DOCTYPE html><html><head><meta charset="UTF-8">
                <title>Aceptar Pedido ${sale.saleNumber}</title>
                <style>
                    * { box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
                    .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 480px; width: 90%; }
                    h2 { color: #333; margin-bottom: 5px; }
                    .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; }
                    .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 14px; }
                    .info p { margin: 4px 0; }
                    label { display: block; font-weight: bold; color: #555; margin-bottom: 8px; }
                    input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 15px; margin-bottom: 8px; }
                    input:focus { outline: none; border-color: #28a745; }
                    .hint { font-size: 12px; color: #999; margin-bottom: 20px; }
                    .btn { width: 100%; padding: 14px; background: #28a745; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
                    .btn:hover { background: #218838; }
                </style></head>
                <body>
                    <div class="card">
                        <h2>✅ Aceptar Pedido</h2>
                        <span class="badge">#${sale.saleNumber}</span>
                        <div class="info">
                            <p><strong>Cliente:</strong> ${sale.userName}</p>
                            <p><strong>Email:</strong> ${sale.userEmail || '-'}</p>
                            <p><strong>Teléfono:</strong> ${sale.userPhone || '-'}</p>
                            <p><strong>Total:</strong> $${sale.total?.toLocaleString('es-AR')}</p>
                            <p><strong>Pago:</strong> ${PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}</p>
                            ${sale.notes ? `<p><strong>Notas:</strong> ${sale.notes}</p>` : ''}
                        </div>
                        <form action="/owner/sales/${id}/accept" method="GET">
                            <label>Horario estimado de entrega</label>
                            <input type="text" name="delivery" placeholder="ej: Hoy entre 14:00 y 16:00" required>
                            <p class="hint">Este horario le llegará al cliente por email</p>
                            <button type="submit" class="btn">Confirmar y notificar al cliente</button>
                        </form>
                    </div>
                </body></html>
            `);
        }

        await saleService.updateSale(id, { status: 'completada', estimatedDelivery });
        try {
            await sendOrderAcceptedToClient({ ...sale, status: 'completada', estimatedDelivery });
        } catch (emailError) {
            console.error("⚠️ Error enviando email al cliente:", emailError.message);
        }

        return res.send(`
            <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido Aceptado</title>
            <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
                .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; width: 90%; text-align: center; }
                .icon { font-size: 60px; margin-bottom: 15px; }
                h2 { color: #28a745; }
                .delivery { background: #e8f5e9; padding: 12px; border-radius: 8px; margin: 15px 0; font-weight: bold; color: #2e7d32; }
                a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2c3e50; color: white; text-decoration: none; border-radius: 8px; }
            </style></head>
            <body>
                <div class="card">
                    <div class="icon">✅</div>
                    <h2>Pedido aceptado</h2>
                    <p>El pedido <strong>#${sale.saleNumber}</strong> de <strong>${sale.userName}</strong> fue marcado como completado.</p>
                    <div class="delivery">🕐 Entrega: ${estimatedDelivery}</div>
                    ${sale.userEmail
                        ? `<p style="font-size:13px;color:#888;">Se notificó al cliente en <strong>${sale.userEmail}</strong></p>`
                        : `<p style="font-size:13px;color:#888;">El cliente no tiene email registrado</p>`}
                    <a href="/owner/sales">Ver todos los pedidos</a>
                </div>
            </body></html>
        `);
    } catch (error) {
        console.error("Error al aceptar venta:", error);
        res.status(500).send("Error al procesar la aceptación");
    }
};

export const rejectSale = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await saleService.getSaleById(id);
        if (!sale) return res.status(404).send(pageHtml('❌ Pedido no encontrado', '#dc3545', 'No se encontró el pedido.', null));

        if (sale.status !== 'pendiente') {
            return res.send(pageHtml('ℹ️ Pedido ya procesado', '#6c757d',
                `Este pedido ya fue procesado. Estado actual: <strong>${sale.status}</strong>`, id));
        }

        await saleService.updateSale(id, { status: 'cancelada' });
        try {
            await sendOrderRejectedToClient(sale);
        } catch (emailError) {
            console.error("⚠️ Error enviando email al cliente:", emailError.message);
        }

        return res.send(`
            <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido Rechazado</title>
            <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
                .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; width: 90%; text-align: center; }
                .icon { font-size: 60px; margin-bottom: 15px; }
                h2 { color: #dc3545; }
                a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2c3e50; color: white; text-decoration: none; border-radius: 8px; }
            </style></head>
            <body>
                <div class="card">
                    <div class="icon">❌</div>
                    <h2>Pedido rechazado</h2>
                    <p>El pedido <strong>#${sale.saleNumber}</strong> de <strong>${sale.userName}</strong> fue cancelado.</p>
                    ${sale.userEmail ? `<p style="font-size:13px;color:#888;">Se notificó al cliente en <strong>${sale.userEmail}</strong></p>` : ''}
                    <a href="/owner/sales">Ver todos los pedidos</a>
                </div>
            </body></html>
        `);
    } catch (error) {
        console.error("Error al rechazar venta:", error);
        res.status(500).send("Error al procesar el rechazo");
    }
};

const pageHtml = (title, color, message, saleId) => `
    <!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
        .card { background: white; padding: 40px; border-radius: 12px; text-align: center; max-width: 400px; width: 90%; }
        h2 { color: ${color}; }
        a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2c3e50; color: white; text-decoration: none; border-radius: 8px; }
    </style></head>
    <body><div class="card"><h2>${title}</h2><p>${message}</p><a href="/owner/sales">Ver todos los pedidos</a></div></body></html>
`;
// import * as saleService from "../services/sale.service.js";
// import * as productService from "../services/product.service.js";
// import * as userService from "../services/user.service.js";
// import { saleSchema, saleFilterSchema } from "../schemas/sale.schema.js";
// import { sendNewOrderToOwner, sendOrderAcceptedToClient, sendOrderRejectedToClient } from "../services/email.service.js";

// export const renderSales = async (req, res) => {
//     try {
//         const filters = {};
//         if (req.query.status) filters.status = req.query.status;
//         if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod;
//         if (req.query.startDate) filters.startDate = req.query.startDate;
//         if (req.query.endDate) filters.endDate = req.query.endDate;
//         if (req.query.userId) filters.userId = req.query.userId;

//         const salesList = await saleService.getSales(filters);

//         let stats;
//         try {
//             stats = await saleService.getSaleStats(req.query.startDate || null, req.query.endDate || null);
//         } catch (error) {
//             stats = { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} };
//         }

//         const products = await productService.getProducts();

//         let users = [];
//         try {
//             users = await userService.getUsers({ status: 'activo' });
//         } catch (error) {
//             users = [];
//         }

//         res.render('owner/sales', {
//             titulo: 'Gestión de Ventas',
//             user: req.user,
//             sales: salesList,
//             stats,
//             products,
//             users,
//             filters
//         });
//     } catch (error) {
//         console.error("❌ Error al renderizar ventas:", error);
//         res.status(500).send("Error al cargar las ventas.");
//     }
// };

// export const createSale = async (req, res) => {
//     try {
//         const result = saleSchema.safeParse(req.body);

//         if (!result.success) {
//             const errorMessages = result.error.errors.map(err => ({
//                 path: err.path.join('.'),
//                 message: err.message
//             }));
//             return res.status(400).json({ errors: errorMessages });
//         }

//         const sale = await saleService.createSale(result.data);

//         // Notificar a la propietaria — si falla el email, el pedido igual se crea
//         try {
//             await sendNewOrderToOwner(sale);
//             console.log("📧 Email de nuevo pedido enviado a la propietaria");
//         } catch (emailError) {
//             console.error("⚠️ Error enviando email a propietaria:", emailError.message);
//         }

//         res.status(201).json({
//             status: "success",
//             message: "Venta creada exitosamente",
//             data: sale
//         });
//     } catch (error) {
//         console.error("Error al crear venta:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// export const updateSale = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const existingSale = await saleService.getSaleById(id);
//         if (!existingSale) return res.status(404).json({ error: "Venta no encontrada" });

//         const updateData = {};
//         if (req.body.status && ['pendiente', 'completada', 'cancelada'].includes(req.body.status)) {
//             updateData.status = req.body.status;
//         }
//         if (req.body.paymentMethod && ['efectivo', 'transferencia', 'tarjeta', 'otro'].includes(req.body.paymentMethod)) {
//             updateData.paymentMethod = req.body.paymentMethod;
//         }
//         if (req.body.notes !== undefined) updateData.notes = req.body.notes;
//         if (req.body.estimatedDelivery !== undefined) updateData.estimatedDelivery = req.body.estimatedDelivery;

//         if (Object.keys(updateData).length === 0) {
//             return res.status(400).json({ error: "No hay datos válidos para actualizar" });
//         }

//         await saleService.updateSale(id, updateData);
//         res.json({ status: "success", message: "Venta actualizada exitosamente" });
//     } catch (error) {
//         console.error("Error al actualizar venta:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// export const deleteSale = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const existingSale = await saleService.getSaleById(id);
//         if (!existingSale) return res.status(404).json({ error: "Venta no encontrada" });
//         await saleService.deleteSale(id);
//         res.json({ status: "success", message: "Venta eliminada exitosamente" });
//     } catch (error) {
//         console.error("Error al eliminar venta:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ── Exportar ventas a CSV ─────────────────────────────────────────────────────
// export const exportSalesCsv = async (req, res) => {
//     try {
//         const filters = {};
//         if (req.query.status) filters.status = req.query.status;
//         if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod;
//         if (req.query.startDate) filters.startDate = req.query.startDate;
//         if (req.query.endDate) filters.endDate = req.query.endDate;
//         if (req.query.userId) filters.userId = req.query.userId;

//         const salesList = await saleService.getSales(filters);

//         const header = [
//             'NumeroVenta',
//             'Fecha',
//             'Cliente',
//             'Email',
//             'Telefono',
//             'MetodoPago',
//             'Estado',
//             'Total',
//             'CantidadItems',
//             'ProductosDetalle'
//         ];

//         const rows = salesList.map(sale => {
//             const date = sale.createdAt instanceof Date
//                 ? sale.createdAt.toISOString()
//                 : new Date(sale.createdAt).toISOString();

//             const productos = (sale.items || [])
//                 .map(item => `${item.productName} x${item.quantity} ($${item.subtotal})`)
//                 .join(' | ');

//             return [
//                 sale.saleNumber || '',
//                 date,
//                 sale.userName || '',
//                 sale.userEmail || '',
//                 sale.userPhone || '',
//                 sale.paymentMethod || '',
//                 sale.status || '',
//                 sale.total ?? '',
//                 sale.items ? sale.items.length : 0,
//                 productos
//             ].map(value => {
//                 const str = String(value ?? '');
//                 if (str.includes(',') || str.includes('"') || str.includes('\n')) {
//                     return `"${str.replace(/"/g, '""')}"`;
//                 }
//                 return str;
//             }).join(',');
//         });

//         const csvContent = [header.join(','), ...rows].join('\n');

//         const fileName = `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
//         res.setHeader('Content-Type', 'text/csv; charset=utf-8');
//         res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//         res.send(csvContent);
//     } catch (error) {
//         console.error("Error al exportar ventas CSV:", error);
//         res.status(500).send("Error al exportar las ventas.");
//     }
// };

// export const getSaleById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const sale = await saleService.getSaleById(id);
//         if (!sale) return res.status(404).json({ error: "Venta no encontrada" });
//         res.json({ status: "success", data: sale });
//     } catch (error) {
//         console.error("Error al obtener venta:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // ── La propietaria acepta el pedido (desde el email o desde el panel) ──
// export const acceptSale = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const estimatedDelivery = req.query.delivery || null;

//         const sale = await saleService.getSaleById(id);
//         if (!sale) {
//             return res.status(404).send(pageHtml('❌ Pedido no encontrado', '#dc3545', 'No se encontró el pedido.', null));
//         }

//         if (sale.status !== 'pendiente') {
//             return res.send(pageHtml(
//                 'ℹ️ Pedido ya procesado', '#6c757d',
//                 `Este pedido ya fue procesado. Estado actual: <strong>${sale.status}</strong>`,
//                 id
//             ));
//         }

//         // Sin delivery → mostrar formulario para ingresarlo
//         if (!estimatedDelivery) {
//             return res.send(`
//                 <!DOCTYPE html><html><head><meta charset="UTF-8">
//                 <title>Aceptar Pedido ${sale.saleNumber}</title>
//                 <style>
//                     * { box-sizing: border-box; }
//                     body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
//                     .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 480px; width: 90%; }
//                     h2 { color: #333; margin-bottom: 5px; }
//                     .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; }
//                     .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 14px; }
//                     .info p { margin: 4px 0; }
//                     label { display: block; font-weight: bold; color: #555; margin-bottom: 8px; }
//                     input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 15px; margin-bottom: 8px; }
//                     input:focus { outline: none; border-color: #28a745; }
//                     .hint { font-size: 12px; color: #999; margin-bottom: 20px; }
//                     .btn { width: 100%; padding: 14px; background: #28a745; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
//                     .btn:hover { background: #218838; }
//                 </style></head>
//                 <body>
//                     <div class="card">
//                         <h2>✅ Aceptar Pedido</h2>
//                         <span class="badge">#${sale.saleNumber}</span>
//                         <div class="info">
//                             <p><strong>Cliente:</strong> ${sale.userName}</p>
//                             <p><strong>Email:</strong> ${sale.userEmail || '-'}</p>
//                             <p><strong>Teléfono:</strong> ${sale.userPhone || '-'}</p>
//                             <p><strong>Dirección:</strong> ${sale.userAddress || '-'}</p>
//                             <p><strong>Total:</strong> $${sale.total.toLocaleString('es-AR')}</p>
//                             <p><strong>Pago:</strong> ${sale.paymentMethod}</p>
//                             ${sale.notes ? `<p><strong>Notas:</strong> ${sale.notes}</p>` : ''}
//                         </div>
//                         <form action="/owner/sales/${id}/accept" method="GET">
//                             <label>Horario estimado de entrega</label>
//                             <input type="text" name="delivery" placeholder="ej: Hoy entre 14:00 y 16:00" required>
//                             <p class="hint">Este horario le llegará al cliente por email</p>
//                             <button type="submit" class="btn">Confirmar y notificar al cliente</button>
//                         </form>
//                     </div>
//                 </body></html>
//             `);
//         }

//         // Actualizar la venta
//         await saleService.updateSale(id, { status: 'completada', estimatedDelivery });

//         // Notificar al cliente
//         try {
//             await sendOrderAcceptedToClient({ ...sale, status: 'completada', estimatedDelivery });
//             console.log(`📧 Email de aceptación enviado a ${sale.userEmail}`);
//         } catch (emailError) {
//             console.error("⚠️ Error enviando email al cliente:", emailError.message);
//         }

//         return res.send(`
//             <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido Aceptado</title>
//             <style>
//                 body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
//                 .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; width: 90%; text-align: center; }
//                 .icon { font-size: 60px; margin-bottom: 15px; }
//                 h2 { color: #28a745; }
//                 .delivery { background: #e8f5e9; padding: 12px; border-radius: 8px; margin: 15px 0; font-weight: bold; color: #2e7d32; }
//                 a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2c3e50; color: white; text-decoration: none; border-radius: 8px; }
//             </style></head>
//             <body>
//                 <div class="card">
//                     <div class="icon">✅</div>
//                     <h2>Pedido aceptado</h2>
//                     <p>El pedido <strong>#${sale.saleNumber}</strong> de <strong>${sale.userName}</strong> fue marcado como completado.</p>
//                     <div class="delivery">🕐 Entrega: ${estimatedDelivery}</div>
//                     ${sale.userEmail
//                         ? `<p style="font-size:13px;color:#888;">Se notificó al cliente en <strong>${sale.userEmail}</strong></p>`
//                         : `<p style="font-size:13px;color:#888;">El cliente no tiene email registrado</p>`
//                     }
//                     <a href="/owner/sales">Ver todos los pedidos</a>
//                 </div>
//             </body></html>
//         `);

//     } catch (error) {
//         console.error("Error al aceptar venta:", error);
//         res.status(500).send("Error al procesar la aceptación");
//     }
// };

// // ── La propietaria rechaza el pedido ──
// export const rejectSale = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const sale = await saleService.getSaleById(id);
//         if (!sale) {
//             return res.status(404).send(pageHtml('❌ Pedido no encontrado', '#dc3545', 'No se encontró el pedido.', null));
//         }

//         if (sale.status !== 'pendiente') {
//             return res.send(pageHtml(
//                 'ℹ️ Pedido ya procesado', '#6c757d',
//                 `Este pedido ya fue procesado. Estado actual: <strong>${sale.status}</strong>`,
//                 id
//             ));
//         }

//         await saleService.updateSale(id, { status: 'cancelada' });

//         try {
//             await sendOrderRejectedToClient(sale);
//             console.log(`📧 Email de rechazo enviado a ${sale.userEmail}`);
//         } catch (emailError) {
//             console.error("⚠️ Error enviando email al cliente:", emailError.message);
//         }

//         return res.send(`
//             <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido Rechazado</title>
//             <style>
//                 body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
//                 .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; width: 90%; text-align: center; }
//                 .icon { font-size: 60px; margin-bottom: 15px; }
//                 h2 { color: #dc3545; }
//                 a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2c3e50; color: white; text-decoration: none; border-radius: 8px; }
//             </style></head>
//             <body>
//                 <div class="card">
//                     <div class="icon">❌</div>
//                     <h2>Pedido rechazado</h2>
//                     <p>El pedido <strong>#${sale.saleNumber}</strong> de <strong>${sale.userName}</strong> fue cancelado.</p>
//                     ${sale.userEmail
//                         ? `<p style="font-size:13px;color:#888;">Se notificó al cliente en <strong>${sale.userEmail}</strong></p>`
//                         : ''
//                     }
//                     <a href="/owner/sales">Ver todos los pedidos</a>
//                 </div>
//             </body></html>
//         `);

//     } catch (error) {
//         console.error("Error al rechazar venta:", error);
//         res.status(500).send("Error al procesar el rechazo");
//     }
// };

// // Helper para páginas de estado simples
// const pageHtml = (title, color, message, saleId) => `
//     <!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
//     <style>
//         body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
//         .card { background: white; padding: 40px; border-radius: 12px; text-align: center; max-width: 400px; width: 90%; }
//         h2 { color: ${color}; }
//         a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2c3e50; color: white; text-decoration: none; border-radius: 8px; }
//     </style></head>
//     <body>
//         <div class="card">
//             <h2>${title}</h2>
//             <p>${message}</p>
//             <a href="/owner/sales">Ver todos los pedidos</a>
//         </div>
//     </body></html>
// `;