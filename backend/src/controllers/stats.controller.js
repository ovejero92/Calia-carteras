import * as statsService from "../services/stats.service.js";
import * as saleService from "../services/sale.service.js";

const buildSalesRange = (query) => {
    const range = query.range || 'last30';
    let startDate = null;
    let endDate = null;
    let rangeLabel = '';

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (range === 'today') {
        startDate = todayStr;
        endDate = todayStr;
        rangeLabel = 'Hoy';
    } else if (range === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        endDate = todayStr;
        rangeLabel = 'Últimos 7 días';
    } else if (range === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        endDate = todayStr;
        rangeLabel = 'Últimos 30 días';
    } else if (range === 'custom') {
        if (query.startDate) startDate = query.startDate;
        if (query.endDate) endDate = query.endDate;
        rangeLabel = 'Período personalizado';
    } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        endDate = todayStr;
        rangeLabel = 'Últimos 30 días';
    }

    return { key: range, startDate, endDate, label: rangeLabel };
};

export const renderDashboard = async (req, res) => {
    try {
        const dashboardStats = await statsService.getDashboardStats();

        const salesRange = buildSalesRange(req.query);

        let salesSummary;
        try {
            salesSummary = await saleService.getSaleStats(salesRange.startDate, salesRange.endDate);
        } catch (err) {
            console.warn("⚠️ Error obteniendo resumen de ventas filtrado:", err.message);
            salesSummary = {
                totalSales: 0,
                totalRevenue: 0,
                totalItems: 0,
                averageSale: 0,
                topProducts: [],
                paymentMethods: {}
            };
        }

        res.render('owner/dashboard', {
            titulo: 'Panel de Control',
            user: req.user,
            stats: dashboardStats,
            salesSummary,
            salesRange
        });
    } catch (error) {
        console.error("❌ Error al renderizar dashboard:", error);
        const emptyStats = {
            products: { total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 },
            users: { total: 0, activos: 0, clientes: 0 },
            sales: { total: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} },
            recent: {
                last30Days: { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} },
                thisMonth: { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} },
                today: { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} }
            }
        };
        
        res.render('owner/dashboard', {
            titulo: 'Panel de Control',
            user: req.user,
            stats: emptyStats,
            salesSummary: {
                totalSales: 0,
                totalRevenue: 0,
                totalItems: 0,
                averageSale: 0,
                topProducts: [],
                paymentMethods: {}
            },
            salesRange: {
                key: 'last30',
                label: 'Últimos 30 días',
                startDate: null,
                endDate: null
            },
            error: "⚠️ Algunos datos no pudieron cargarse. Las funcionalidades principales siguen disponibles."
        });
    }
};

export const getStats = async (req, res) => {
    try {
        const stats = await statsService.getDashboardStats();
        res.json({ status: "success", data: stats });
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ error: error.message });
    }
};

export const exportDashboardCsv = async (req, res) => {
    try {
        const stats = await statsService.getDashboardStats();
        const salesRange = buildSalesRange(req.query);

        let salesSummary;
        try {
            salesSummary = await saleService.getSaleStats(salesRange.startDate, salesRange.endDate);
        } catch (err) {
            console.warn("⚠️ Error obteniendo resumen de ventas filtrado (CSV):", err.message);
            salesSummary = {
                totalSales: 0,
                totalRevenue: 0,
                totalItems: 0,
                averageSale: 0,
                topProducts: [],
                paymentMethods: {}
            };
        }

        const lines = [];

        const pushRow = (cols) => {
            lines.push(cols.map(col => {
                const str = String(col ?? '');
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(','));
        };

        pushRow(['Sección', 'Métrica', 'Valor']);

        pushRow(['Productos', 'Total productos', stats.products.total]);
        pushRow(['Productos', 'Stock bajo (≤5)', stats.products.lowStock]);
        pushRow(['Productos', 'Sin stock', stats.products.outOfStock]);
        pushRow(['Productos', 'Valor total inventario', stats.products.totalValue]);

        pushRow(['Usuarios', 'Total usuarios', stats.users.total]);
        pushRow(['Usuarios', 'Clientes activos', stats.users.activos]);
        pushRow(['Usuarios', 'Cantidad clientes (role=cliente)', stats.users.clientes]);

        pushRow(['Ventas (general)', 'Total ventas', stats.sales.total]);
        pushRow(['Ventas (general)', 'Ingresos totales', stats.sales.totalRevenue]);
        pushRow(['Ventas (general)', 'Productos vendidos', stats.sales.totalItems]);
        pushRow(['Ventas (general)', 'Promedio por venta', stats.sales.averageSale]);

        pushRow([]);
        pushRow(['Resumen de ventas filtrado', `Rango: ${salesRange.label}`, `${salesRange.startDate || ''} a ${salesRange.endDate || ''}`]);
        pushRow(['Resumen de ventas filtrado', 'Total ventas', salesSummary.totalSales]);
        pushRow(['Resumen de ventas filtrado', 'Ingresos totales', salesSummary.totalRevenue]);
        pushRow(['Resumen de ventas filtrado', 'Productos vendidos', salesSummary.totalItems]);
        pushRow(['Resumen de ventas filtrado', 'Promedio por venta', salesSummary.averageSale]);

        pushRow([]);
        pushRow(['Top 5 productos del período', 'Producto', 'Cantidad vendida', 'Ingresos']);
        (salesSummary.topProducts || []).forEach(p => {
            pushRow(['Top 5 productos del período', p.productName, p.quantity, p.revenue]);
        });

        pushRow([]);
        pushRow(['Métodos de pago (período)', 'Método', 'Cantidad ventas', 'Total']);
        const pm = salesSummary.paymentMethods || {};
        Object.keys(pm).forEach(key => {
            const label =
                key === 'efectivo' ? 'Efectivo' :
                key === 'transferencia' ? 'Transferencia' :
                key === 'tarjeta_debito' ? 'Tarjeta de débito' :
                key === 'tarjeta_credito' ? 'Tarjeta de crédito' :
                key === 'tarjeta' ? 'Tarjeta (sin detalle)' :
                key === 'otro' ? 'Otro' : key;
            pushRow(['Métodos de pago (período)', label, pm[key].count, pm[key].total]);
        });

        const csvContent = lines.join('\n');
        const fileName = `dashboard_metrics_${new Date().toISOString().slice(0, 10)}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(csvContent);
    } catch (error) {
        console.error("Error al exportar métricas del dashboard CSV:", error);
        res.status(500).send("Error al exportar las métricas.");
    }
};
