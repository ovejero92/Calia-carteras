import { db } from "../firebase/admin.js";

const COLLECTION = "categories";

const defaultCategories = [
    { name: "Carteras", slug: "carteras", order: 0 },
    { name: "Mochilas", slug: "mochilas", order: 1 },
    { name: "Monederos", slug: "monederos", order: 2 },
    { name: "Accesorios", slug: "accesorios", order: 3 },
];

export const getCategories = async () => {
    if (!db) return defaultCategories.map((c, i) => ({ ...c, id: `default-${i}` }));
    try {
        const snapshot = await db.collection(COLLECTION).orderBy("order").get();
        if (snapshot.empty) return defaultCategories.map((c, i) => ({ ...c, id: `default-${i}` }));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
        console.error("Error obteniendo categorías:", err.message);
        return [];
    }
};

export const getCategoryBySlug = async (slug) => {
    if (!db) return null;
    const snapshot = await db.collection(COLLECTION).where("slug", "==", slug).limit(1).get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const createCategory = async (data) => {
    if (!db) throw new Error("Firebase no disponible");
    const existing = await getCategoryBySlug(data.slug);
    if (existing) throw new Error("Ya existe una categoría con ese slug");
    const snapshot = await db.collection(COLLECTION).get();
    const order = snapshot.size;
    const docRef = await db.collection(COLLECTION).add({ ...data, order, createdAt: new Date() });
    return { id: docRef.id, ...data, order };
};

export const updateCategory = async (id, data) => {
    if (!db) throw new Error("Firebase no disponible");
    await db.collection(COLLECTION).doc(id).update(data);
    return true;
};

export const deleteCategory = async (id) => {
    if (!db) throw new Error("Firebase no disponible");
    await db.collection(COLLECTION).doc(id).delete();
    return true;
};