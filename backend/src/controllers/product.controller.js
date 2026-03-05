import * as productService from "../services/product.service.js";
import { productSchema } from "../schemas/product.schema.js";
import cloudinary from "../config/cloudinary.js";

// Helper para borrar imagen de Cloudinary
const deleteCloudinaryImage = async (imageUrl) => {
    if (!imageUrl || imageUrl.includes("default-bag.jpg")) return;

    try {
        const urlParts = imageUrl.split('/');
        const filename = urlParts.at(-1).split('.')[0];
        const folder = urlParts.at(-2);
        const publicId = `${folder}/${filename}`;

        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("⚠️ No se pudo borrar imagen de Cloudinary:", err.message);
    }
};

export const renderProducts = async (req, res) => {
    try {
        const productsList = await productService.getProducts();
        res.render('owner/products', {
            titulo: 'Gestión de Productos',
            user: req.user,
            products: productsList
        });
    } catch (error) {
        console.error("❌ Error al renderizar productos:", error);
        res.status(500).send("Error al cargar los productos.");
    }
};

export const createProduct = async (req, res) => {
    try {
        const result = productSchema.safeParse(req.body);

        if (!result.success) {
            // Si falla validación y se subieron imágenes, las borramos
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.path);
                }
            }

            return res.status(400).json({
                errors: result.error.errors.map(err => ({
                    path: err.path[0],
                    message: err.message
                }))
            });
        }

        // 🔥 NUEVA LÓGICA MULTI-IMAGEN
        const images = (req.files && req.files.length > 0)
            ? req.files.map(file => file.path)
            : ["/img/default-bag.jpg"];

        const newProduct = {
            ...result.data,
            images,                // Array de imágenes
            image: images[0],      // Primera imagen (compatibilidad)
            createdAt: new Date()
        };

        await productService.saveProduct(newProduct);

        res.status(201).json({ status: "success", message: "Producto creado" });

    } catch (error) {
        console.error("Error al crear:", error);
        res.status(500).json({ error: error.message });
    }
};

export const createBulkProducts = async (req, res) => {
    try {
        const { products } = req.body;

        const promises = products.map(p =>
            productService.saveProduct({
                ...p,
                images: p.images || [p.image || "/img/default-bag.jpg"],
                image: (p.images && p.images[0]) || p.image || "/img/default-bag.jpg",
                createdAt: new Date()
            })
        );

        await Promise.all(promises);

        res.json({ status: "success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        await productService.deleteProduct(id);

        // 🔥 BORRAR TODAS LAS IMÁGENES
        const imagesToDelete = product.images || [product.image];

        for (const img of imagesToDelete) {
            await deleteCloudinaryImage(img);
        }

        res.json({ status: "success", message: "Producto e imágenes eliminados" });

    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const existingProduct = await productService.getProductById(id);

        if (!existingProduct) {
            return res.status(404).json({ error: "No existe el producto" });
        }

        const result = productSchema.safeParse(req.body);

        if (!result.success) {
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.path);
                }
            }

            return res.status(400).json({
                errors: result.error.errors.map(e => ({
                    path: e.path[0],
                    message: e.message
                }))
            });
        }

        const updatedData = { ...result.data };

        // 🔥 NUEVA LÓGICA MULTI-IMAGEN
        if (req.files && req.files.length > 0) {

            // Borrar todas las imágenes viejas
            const oldImages = existingProduct.images || [existingProduct.image];

            for (const oldUrl of oldImages) {
                await deleteCloudinaryImage(oldUrl);
            }

            // Guardar nuevas
            updatedData.images = req.files.map(file => file.path);
            updatedData.image = updatedData.images[0];

        } else {
            // Si no suben nuevas imágenes, mantener las existentes
            updatedData.images = existingProduct.images || [existingProduct.image];
            updatedData.image = existingProduct.image;
        }

        await productService.updateProduct(id, updatedData);

        res.json({ status: "success", message: "Producto actualizado" });

    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ error: error.message });
    }
};
