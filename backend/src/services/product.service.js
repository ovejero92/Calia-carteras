import { db } from "../firebase/admin.js"; 

export const getProducts = async () => {
    try {
        console.log("🔍 Consultando Firestore...");
        const snapshot = await db.collection('products').get();
        
        if (snapshot.empty) {
            console.log("⚠️ No se encontraron productos.");
            return [];
        }

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`✅ Se encontraron ${products.length} productos.`);
        return products;
    } catch (error) {
        console.error("❌ Error en getProducts service:", error);
        throw error;
    }
};

export const saveProduct = async (productData) => {
    try {
        const docRef = await db.collection('products').add(productData);
        console.log("✅ Producto guardado con ID:", docRef.id);
        return { id: docRef.id, ...productData };
    } catch (error) {
        console.error("❌ Error en saveProduct service:", error);
        throw error;
    }
};

// Obtener un producto por ID
export const getProductById = async (id) => {
    const doc = await db.collection('products').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// Eliminar de Firestore
export const deleteProduct = async (id) => {
    return await db.collection('products').doc(id).delete();
};

// Actualizar producto
export const updateProduct = async (id, data) => {
    try {
        await db.collection('products').doc(id).update(data);
        return true;
    } catch (error) {
        console.error("❌ Error en updateProduct service:", error);
        throw error;
    }
};