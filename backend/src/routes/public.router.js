import { Router } from "express";
// import * as productService from "../services/product.service.js"; // Firebase version
import * as productService from "../services/product.service.mock.js"; // Mock version for testing
// import * as userService from "../services/user.service.js"; // Firebase version
import * as userService from "../services/user.service.mock.js"; // Mock version for testing
// import * as saleService from "../services/sale.service.js"; // Firebase version
import * as saleService from "../services/sale.service.mock.js"; // Mock version for testing
import { userSchema } from "../schemas/user.schema.js";
import { saleSchema } from "../schemas/sale.schema.js";

const router = Router();

// Ruta para obtener todos los productos (catálogo público)
router.get('/products', async (req, res) => {
    try {
        const products = await productService.getProducts();
        res.json({ status: "success", data: products });
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener un producto específico
router.get('/products/:id', async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json({ status: "success", data: product });
    } catch (error) {
        console.error("Error obteniendo producto:", error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para registrar un nuevo usuario cliente
router.post('/register', async (req, res) => {
    try {
        // Validar datos con Zod
        const result = userSchema.safeParse({
            ...req.body,
            role: 'cliente',
            status: 'activo'
        });

        if (!result.success) {
            const errorsList = result.error?.errors || [];
            const errorMessages = errorsList.map(err => ({
                path: err.path[0],
                message: err.message
            }));
            return res.status(400).json({ errors: errorMessages });
        }

        // Crear usuario
        const user = await userService.createUser(result.data);

        res.status(201).json({
            status: "success",
            message: "Usuario registrado exitosamente",
            data: user
        });
    } catch (error) {
        console.error("Error registrando usuario:", error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para crear una nueva venta (pedido)
router.post('/orders', async (req, res) => {
    try {
        // Validar datos con Zod
        const result = saleSchema.safeParse({
            ...req.body,
            status: 'pendiente' // Los pedidos comienzan como pendientes
        });

        if (!result.success) {
            const errorsList = result.error?.errors || [];
            const errorMessages = errorsList.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({ errors: errorMessages });
        }

        // Crear la venta
        const order = await saleService.createSale(result.data);

        res.status(201).json({
            status: "success",
            message: "Pedido creado exitosamente",
            data: order
        });
    } catch (error) {
        console.error("Error creando pedido:", error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener pedidos de un usuario (por email)
router.get('/orders', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Email es requerido" });
        }

        // Buscar usuario por email
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Obtener pedidos del usuario
        const orders = await saleService.getSales({ userId: user.id });

        res.json({
            status: "success",
            data: orders
        });
    } catch (error) {
        console.error("Error obteniendo pedidos:", error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener un pedido específico por ID
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await saleService.getSaleById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }

        res.json({
            status: "success",
            data: order
        });
    } catch (error) {
        console.error("Error obteniendo pedido:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;