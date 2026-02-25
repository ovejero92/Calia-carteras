import * as productService from "./product.service.js";
import * as userService from "./user.service.js";
import * as saleService from "./sale.service.js";

/**
 * Obtener estadísticas generales del dashboard
 */
export const getDashboardStats = async () => {
    try {
        // Obtener productos y usuarios (estos no deberían tener problemas)
        const [products, users] = await Promise.all([
            productService.getProducts(),
            userService.getUsers()
        ]);

        // Obtener estadísticas de ventas con manejo de errores separado
        let salesStats;
        try {
            salesStats = await saleService.getSaleStats();
        } catch (error) {
            console.warn("⚠️ Error obteniendo estadísticas de ventas (posible falta de índice):", error.message);
            // Si hay error con índices, usar valores por defecto
            salesStats = { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} };
        }

        // Estadísticas de productos
        const productStats = {
            total: products.length || 0,
            lowStock: products.filter(p => (p.stock || 0) <= 5).length || 0,
            outOfStock: products.filter(p => (p.stock || 0) === 0).length || 0,
            totalValue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0) || 0
        };

        // Estadísticas de usuarios
        const userStats = {
            total: users.length || 0,
            activos: users.filter(u => u.status === 'activo').length || 0,
            clientes: users.filter(u => u.role === 'cliente').length || 0
        };

        // Estadísticas de ventas (últimos 30 días) con manejo de errores
        let recentSalesStats, monthSalesStats, todaySalesStats;
        const emptyStats = { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} };
        
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            recentSalesStats = await saleService.getSaleStats(
                thirtyDaysAgo.toISOString().split('T')[0],
                new Date().toISOString().split('T')[0]
            );
        } catch (error) {
            console.warn("⚠️ Error obteniendo ventas últimos 30 días:", error.message);
            recentSalesStats = emptyStats;
        }

        try {
            // Ventas del mes actual
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            monthSalesStats = await saleService.getSaleStats(
                startOfMonth.toISOString().split('T')[0],
                now.toISOString().split('T')[0]
            );
        } catch (error) {
            console.warn("⚠️ Error obteniendo ventas del mes:", error.message);
            monthSalesStats = emptyStats;
        }

        try {
            // Ventas de hoy
            const today = new Date().toISOString().split('T')[0];
            todaySalesStats = await saleService.getSaleStats(today, today);
        } catch (error) {
            console.warn("⚠️ Error obteniendo ventas de hoy:", error.message);
            todaySalesStats = emptyStats;
        }

        return {
            products: productStats || { total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 },
            users: userStats || { total: 0, activos: 0, clientes: 0 },
            sales: {
                total: salesStats?.totalSales || 0,
                totalRevenue: salesStats?.totalRevenue || 0,
                totalItems: salesStats?.totalItems || 0,
                averageSale: salesStats?.averageSale || 0,
                topProducts: salesStats?.topProducts || [],
                paymentMethods: salesStats?.paymentMethods || {}
            },
            recent: {
                last30Days: recentSalesStats || { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} },
                thisMonth: monthSalesStats || { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} },
                today: todaySalesStats || { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} }
            }
        };
    } catch (error) {
        console.error("❌ Error en getDashboardStats service:", error);
        throw error;
    }
};
