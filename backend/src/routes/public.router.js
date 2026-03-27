import { Router } from "express";
import * as productService from "../services/product.service.js";
import * as userService from "../services/user.service.js";
import * as saleService from "../services/sale.service.js";
import * as categoryService from "../services/category.service.js";
import { userSchema } from "../schemas/user.schema.js";
import { saleSchema } from "../schemas/sale.schema.js";
import { sendNewOrderToOwner } from "../services/email.service.js";
import { getPublicFrontSettings } from "../controllers/settings.controller.js";
import { getPublicCategories } from "../controllers/category.controller.js";

const router = Router();

// ── Settings ───────────────────────────────────────────────────────────────────
router.get('/settings/front', getPublicFrontSettings);

// ── Categorías (público) ───────────────────────────────────────────────────────
router.get('/categories', getPublicCategories);

// ── Productos ──────────────────────────────────────────────────────────────────
router.get('/products', async (req, res) => {
    try {
        const products = await productService.getProducts();

        // Filtros opcionales desde el front
        let result = products;
        if (req.query.category) {
            result = result.filter(p => p.category === req.query.category);
        }
        if (req.query.tag) {
            const tag = req.query.tag;
            if (tag === 'new')        result = result.filter(p => p.flags?.isNew);
            if (tag === 'sale')       result = result.filter(p => p.flags?.isSale);
            if (tag === 'bestseller') result = result.filter(p => p.flags?.isBestSeller);
        }

        res.json({ status: "success", data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ status: "success", data: product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Auth ───────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const result = userSchema.safeParse({ ...req.body, role: 'cliente', status: 'activo' });
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.errors.map(err => ({ path: err.path[0], message: err.message }))
            });
        }
        const existing = await userService.getUserByEmail(result.data.email);
        if (existing) return res.status(400).json({ error: "Ya existe un usuario con ese email" });
        const user = await userService.createUser(result.data);
        res.status(201).json({ status: "success", message: "Usuario registrado", data: user });
    } catch (error) {
        console.error("Error registrando usuario:", error);
        res.status(500).json({ error: error.message });
    }
});

// ── Pedidos ────────────────────────────────────────────────────────────────────
router.post('/orders', async (req, res) => {
    try {
        const result = saleSchema.safeParse({ ...req.body, status: 'pendiente' });
        if (!result.success) {
            return res.status(400).json({
                errors: result.error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))
            });
        }
        const order = await saleService.createSale(result.data);
        try {
            await sendNewOrderToOwner(order);
            console.log("📧 Email enviado a la propietaria");
        } catch (emailError) {
            console.error("⚠️ Error enviando email:", emailError.message);
        }
        res.status(201).json({ status: "success", message: "Pedido creado", data: order });
    } catch (error) {
        console.error("Error creando pedido:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/orders', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email es requerido" });
        const allOrders = await saleService.getSales({});
        const orders = allOrders.filter(o => o.userEmail?.toLowerCase() === email.toLowerCase());
        res.json({ status: "success", data: orders });
    } catch (error) {
        console.error("Error obteniendo pedidos:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/orders/:id', async (req, res) => {
    try {
        const order = await saleService.getSaleById(req.params.id);
        if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
        res.json({ status: "success", data: order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Productos relacionados ──────────────────────────────────────────────────────
router.get('/products/:id/related', async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        const all = await productService.getProducts();
        const related = all
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 8);
        res.json({ status: "success", data: related, meta: { category: product.category } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
