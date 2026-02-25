import * as statsService from "../services/stats.service.js";

/**
 * Renderizar dashboard con estadísticas
 */
export const renderDashboard = async (req, res) => {
    try {
        const dashboardStats = await statsService.getDashboardStats();

        res.render('owner/dashboard', {
            titulo: 'Panel de Control',
            user: req.user,
            stats: dashboardStats
        });
    } catch (error) {
        console.error("❌ Error al renderizar dashboard:", error);
        // Si hay error con índices de Firestore, renderizar dashboard con datos vacíos
        // para que el usuario pueda seguir trabajando
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
            error: "⚠️ Algunos datos no pudieron cargarse. Las funcionalidades principales siguen disponibles."
        });
    }
};

/**
 * Obtener estadísticas (API)
 */
export const getStats = async (req, res) => {
    try {
        const stats = await statsService.getDashboardStats();
        res.json({ status: "success", data: stats });
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ error: error.message });
    }
};
