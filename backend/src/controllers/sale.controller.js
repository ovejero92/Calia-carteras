import * as saleService from "../services/sale.service.js";
import * as productService from "../services/product.service.js";
import * as userService from "../services/user.service.js";
import { saleSchema, saleFilterSchema } from "../schemas/sale.schema.js";

/**
 * Renderizar vista de gestión de ventas
 */
export const renderSales = async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod;
        if (req.query.startDate) filters.startDate = req.query.startDate;
        if (req.query.endDate) filters.endDate = req.query.endDate;
        if (req.query.userId) filters.userId = req.query.userId;

        const salesList = await saleService.getSales(filters);
        
        // Obtener estadísticas con manejo de errores
        let stats;
        try {
            stats = await saleService.getSaleStats(
                req.query.startDate || null,
                req.query.endDate || null
            );
        } catch (error) {
            console.warn("⚠️ Error obteniendo estadísticas de ventas:", error.message);
            stats = { totalSales: 0, totalRevenue: 0, totalItems: 0, averageSale: 0, topProducts: [], paymentMethods: {} };
        }

        // Obtener productos para el modal de crear venta
        const products = await productService.getProducts();
        
        // Obtener usuarios con manejo de errores
        let users = [];
        try {
            users = await userService.getUsers({ status: 'activo' });
        } catch (error) {
            console.warn("⚠️ Error obteniendo usuarios:", error.message);
            users = [];
        }

        res.render('owner/sales', {
            titulo: 'Gestión de Ventas',
            user: req.user,
            sales: salesList,
            stats: stats,
            products: products,
            users: users,
            filters: filters
        });
    } catch (error) {
        console.error("❌ Error al renderizar ventas:", error);
        res.status(500).send("Error al cargar las ventas.");
    }
};

/**
 * Crear una nueva venta
 */
export const createSale = async (req, res) => {
    try {
        // Validar datos con Zod
        const result = saleSchema.safeParse(req.body);

        if (!result.success) {
            const errorsList = result.error?.errors || [];
            const errorMessages = errorsList.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({ errors: errorMessages });
        }

        // Crear la venta
        const sale = await saleService.createSale(result.data);

        res.status(201).json({ 
            status: "success", 
            message: "Venta creada exitosamente",
            data: sale
        });
    } catch (error) {
        console.error("Error al crear venta:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualizar una venta
 */
export const updateSale = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la venta existe
        const existingSale = await saleService.getSaleById(id);
        if (!existingSale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        // Validar datos parciales - solo permitimos actualizar status, paymentMethod y notes
        // No permitimos modificar items después de crear la venta (debería ser un ajuste aparte)
        const updateData = {};
        if (req.body.status && ['pendiente', 'completada', 'cancelada'].includes(req.body.status)) {
            updateData.status = req.body.status;
        }
        if (req.body.paymentMethod && ['efectivo', 'transferencia', 'tarjeta', 'otro'].includes(req.body.paymentMethod)) {
            updateData.paymentMethod = req.body.paymentMethod;
        }
        if (req.body.notes !== undefined) {
            updateData.notes = req.body.notes;
        }

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

/**
 * Eliminar una venta
 */
export const deleteSale = async (req, res) => {
    try {
        const { id } = req.params;

        const existingSale = await saleService.getSaleById(id);
        if (!existingSale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        await saleService.deleteSale(id);

        res.json({ status: "success", message: "Venta eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar venta:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener una venta por ID (API)
 */
export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await saleService.getSaleById(id);

        if (!sale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        res.json({ status: "success", data: sale });
    } catch (error) {
        console.error("Error al obtener venta:", error);
        res.status(500).json({ error: error.message });
    }
};
