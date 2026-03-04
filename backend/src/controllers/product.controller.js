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
// import * as productService from "../services/product.service.js";
// import { productSchema } from "../schemas/product.schema.js";
// import path from "path";
// import fs from "fs";

// export const renderProducts = async (req, res) => {
//     try {
//         // Llamamos al service real
//         const productsList = await productService.getProducts();
        
//         res.render('owner/products', {
//             titulo: 'Gestión de Productos',
//             user: req.user,
//             products: productsList // Pasamos la lista real
//         });
//     } catch (error) {
//         console.error("❌ Error al renderizar productos:", error);
//         res.status(500).send("Error al cargar los productos de la base de datos.");
//     }
// };

// export const createProduct = async (req, res) => {
//     try {
//         // 1. Validar datos con Zod (vienen en req.body)
//         const result = productSchema.safeParse(req.body);

//         if (!result.success) {
//             // Si hay error de validación, borramos la foto que subió Multer para no ensuciar
//             if (req.file) fs.unlinkSync(req.file.path);
            
//             console.log("❌ Zod Error:", JSON.stringify(result.error.format(), null, 2));

//             const errorsList = result.error?.errors || [];
            
//             const errorMessages = errorsList.map(err => ({
//                 path: err.path[0],
//                 message: err.message
//             }));
//             return res.status(400).json({ errors: errorMessages });
//         }

//         // 2. Crear el objeto para Firestore
//         const newProduct = {
//             ...result.data, // Esto ya incluye characteristics como objeto
//             image: req.file ? `/uploads/products/${req.file.filename}` : "/img/default-bag.jpg",
//             createdAt: new Date()
//         };

//         // 3. Guardar en Firestore
//         await productService.saveProduct(newProduct);

//         res.status(201).json({ status: "success", message: "Producto creado" });

//     } catch (error) {
//         console.error("Error al crear:", error);
//         // Este catch atrapa el error del .map() y envía el mensaje que ves en el alerta
//         res.status(500).json({ error: error.message });
//     }
// };
// // Crear MUCHOS (Masivo)
// export const createBulkProducts = async (req, res) => {
//     try {
//         const { products } = req.body; // Esto ya es un array de objetos JS
        
//         // Opcional: Podrías validar cada uno con Zod aquí también si quisieras ser muy estricto

//         const promises = products.map(p => {
//             // Asumimos que el JSON viene con la estructura correcta.
//             // Le agregamos imagen default y fecha.
//             return productService.saveProduct({
//                 ...p,
//                 image: "/img/default-bag.jpg",
//                 createdAt: new Date()
//             });
//         });

//         await Promise.all(promises);
//         res.json({ status: "success" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// export const deleteProduct = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // 1. Buscar el producto para saber el nombre de la imagen
//         const product = await productService.getProductById(id);
//         if (!product) return res.status(404).json({ error: "Producto no encontrado" });

//         // 2. Borrar de Firestore
//         await productService.deleteProduct(id);

//         // 3. Borrar el archivo físico si no es la imagen por defecto
//         if (product.image && !product.image.includes("default-bag.jpg")) {
//             // Construimos la ruta absoluta al archivo
//             // OJO: product.image suele ser "/uploads/products/nombre.jpg"
//             // Tenemos que apuntar a "./public" + esa ruta
//             const imagePath = path.join(process.cwd(), "public", product.image);
            
//             if (fs.existsSync(imagePath)) {
//                 fs.unlinkSync(imagePath);
//                 console.log("🗑️ Archivo de imagen eliminado:", imagePath);
//             }
//         }

//         res.json({ status: "success", message: "Producto e imagen eliminados" });
//     } catch (error) {
//         console.error("Error al eliminar:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// export const updateProduct = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const existingProduct = await productService.getProductById(id);
//         if (!existingProduct) return res.status(404).json({ error: "No existe el producto" });

//         // Validar con Zod
//         const result = productSchema.safeParse(req.body);
//         if (!result.success) {
//             if (req.file) fs.unlinkSync(req.file.path);
//             return res.status(400).json({ errors: result.error.errors.map(e => ({ path: e.path[0], message: e.message })) });
//         }

//         const updatedData = { ...result.data };

//         // Lógica de imagen
//         if (req.file) {
//             // Si hay foto nueva, borramos la vieja (si no era la default)
//             if (existingProduct.image && !existingProduct.image.includes("default-bag.jpg")) {
//                 const oldPath = path.join(process.cwd(), "public", existingProduct.image);
//                 if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//             }
//             updatedData.image = `/uploads/products/${req.file.filename}`;
//         } else {
//             // Si no hay foto nueva, conservamos la actual
//             updatedData.image = existingProduct.image;
//         }

//         await productService.updateProduct(id, updatedData);
//         res.json({ status: "success", message: "Producto actualizado" });

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };