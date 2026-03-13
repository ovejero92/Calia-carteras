import { db } from "../firebase/admin.js";

const SETTINGS_COLLECTION = "settings";
const FRONT_DOC_ID = "front";

const defaultFrontSettings = {
    colors: {
        primary:         "#1d4ed8",
        background:      "#ffffff",
        text:            "#1f2937",
        heroBackground:  "#1e3a8a",
        saleBadge:       "#ef4444",
        navbarBg:        "#ffffff",
        navbarText:      "#1f2937",
        footerBg:        "#111827",
        footerText:      "#d1d5db",
        cardBg:          "#ffffff",
        cardText:        "#1f2937",
        cardPrice:       "#1d4ed8",
        cardBtnBg:       "#1d4ed8",
        cardBtnText:     "#ffffff",
        badgeNew:        "#16a34a",
        badgeSale:       "#ef4444",
        badgeBestSeller: "#d97706",
    },
    typography: {
        fontFamily:    "'Inter', sans-serif",
        fontSizeBase:  "md",
        fontSizeTitle: "md",
        fontSizePrice: "lg",
    },
    images: { heroBanner: "" },
    cardStyle: {
        shadow:    "md",
        radius:    "lg",
        showStock: true,
        layout:    "vertical",
        btnRadius: "md",
    },
    cardPresets: [],
    faqs: [],
};

export const getFrontSettings = async () => {
    if (!db) return defaultFrontSettings;
    try {
        const docRef = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            return {
                ...defaultFrontSettings,
                ...data,
                colors:    { ...defaultFrontSettings.colors,    ...(data.colors    || {}) },
                typography:{ ...defaultFrontSettings.typography, ...(data.typography|| {}) },
                images:    { ...defaultFrontSettings.images,    ...(data.images    || {}) },
                cardStyle: { ...defaultFrontSettings.cardStyle, ...(data.cardStyle || {}) },
                cardPresets: Array.isArray(data.cardPresets) ? data.cardPresets : [],
                faqs:        Array.isArray(data.faqs)        ? data.faqs        : [],
            };
        }
        return defaultFrontSettings;
    } catch (error) {
        console.error("Error al obtener la configuración del front:", error);
        throw new Error("No se pudo obtener la configuración.");
    }
};

export const updateFrontSettings = async (settingsData) => {
    if (!db) throw new Error("Firebase no está inicializado.");
    const docRef = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
    await docRef.set(settingsData, { merge: true });
    return true;
};

export const saveCardPreset = async (preset) => {
    if (!db) throw new Error("No se pudo guardar el preset.");
    const docRef = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
    const docSnap = await docRef.get();
    const data = docSnap.exists ? docSnap.data() : defaultFrontSettings;
    const currentPresets = Array.isArray(data.cardPresets) ? data.cardPresets : [];
    if (currentPresets.length >= 3) throw new Error("Ya tenés 3 presets guardados. Eliminá uno antes de agregar otro.");
    const newPresets = [...currentPresets, preset];
    await docRef.set({ cardPresets: newPresets }, { merge: true });
    return newPresets;
};

export const deleteCardPreset = async (index) => {
    if (!db) throw new Error("No se pudo eliminar el preset.");
    const docRef = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
    const docSnap = await docRef.get();
    const data = docSnap.exists ? docSnap.data() : defaultFrontSettings;
    const currentPresets = Array.isArray(data.cardPresets) ? data.cardPresets : [];
    const idx = parseInt(index, 10);
    if (isNaN(idx) || idx < 0 || idx >= currentPresets.length) throw new Error("Índice de preset inválido.");
    const newPresets = currentPresets.filter((_, i) => i !== idx);
    await docRef.set({ cardPresets: newPresets }, { merge: true });
    return newPresets;
};

// ── FAQs ──────────────────────────────────────────────────────────────────────
const getFaqs = async () => {
    if (!db) return [];
    const docRef = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
    const docSnap = await docRef.get();
    const data = docSnap.exists ? docSnap.data() : {};
    return Array.isArray(data.faqs) ? data.faqs : [];
};

export const saveFaq = async (faq) => {
    if (!db) throw new Error("Firebase no disponible.");
    const current = await getFaqs();
    const newFaqs = [...current, faq];
    await db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID).set({ faqs: newFaqs }, { merge: true });
    return newFaqs;
};

export const updateFaq = async (index, faq) => {
    if (!db) throw new Error("Firebase no disponible.");
    const current = await getFaqs();
    if (index < 0 || index >= current.length) throw new Error("Índice de FAQ inválido.");
    current[index] = faq;
    await db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID).set({ faqs: current }, { merge: true });
    return current;
};

export const deleteFaq = async (index) => {
    if (!db) throw new Error("Firebase no disponible.");
    const current = await getFaqs();
    if (index < 0 || index >= current.length) throw new Error("Índice de FAQ inválido.");
    const newFaqs = current.filter((_, i) => i !== index);
    await db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID).set({ faqs: newFaqs }, { merge: true });
    return newFaqs;
};

export const reorderFaqs = async (faqs) => {
    if (!db) throw new Error("Firebase no disponible.");
    await db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID).set({ faqs }, { merge: true });
    return faqs;
};
// import { db } from "../firebase/admin.js";

// const SETTINGS_COLLECTION = "settings";
// const FRONT_DOC_ID = "front";

// const defaultFrontSettings = {
//     colors: {
//         primary: "#1d4ed8",
//         background: "#ffffff",
//         text: "#1f2937",
//         heroBackground: "#1e3a8a",
//         saleBadge: "#ef4444",
//         navbarBg: "#ffffff",
//         navbarText: "#1f2937",
//         footerBg: "#111827",
//         footerText: "#d1d5db",
//         cardBg: "#ffffff",
//         cardText: "#1f2937",
//         cardPrice: "#1d4ed8",
//         cardBtnBg: "#1d4ed8",
//         cardBtnText: "#ffffff",
//     },
//     typography: {
//         fontFamily: "'Inter', sans-serif",
//         fontSizeBase: "md",
//         fontSizeTitle: "md",
//         fontSizePrice: "lg",
//     },
//     images: {
//         heroBanner: ""
//     },
//     cardStyle: {
//         shadow: "md",
//         radius: "lg",
//         showStock: true,
//         layout: "vertical",
//         btnRadius: "md",
//     },
//     cardPresets: []
// };

// export const getFrontSettings = async () => {
//     if (!db) return defaultFrontSettings;
//     try {
//         const docRef = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
//         const docSnap = await docRef.get();
//         if (docSnap.exists) {
//             const data = docSnap.data();
//             // Deep merge con defaults para que campos nuevos siempre existan
//             return {
//                 ...defaultFrontSettings,
//                 ...data,
//                 colors: { ...defaultFrontSettings.colors, ...(data.colors || {}) },
//                 typography: { ...defaultFrontSettings.typography, ...(data.typography || {}) },
//                 images: { ...defaultFrontSettings.images, ...(data.images || {}) },
//                 cardStyle: { ...defaultFrontSettings.cardStyle, ...(data.cardStyle || {}) },
//                 cardPresets: Array.isArray(data.cardPresets) ? data.cardPresets : [],
//             };
//         }
//         return defaultFrontSettings;
//     } catch (error) {
//         console.error("Error al obtener la configuración del front:", error);
//         throw new Error("No se pudo obtener la configuración.");
//     }
// };

// export const updateFrontSettings = async (settingsData) => {
//     if (!db) throw new Error("Firebase no está inicializado.");
//     try {
//         const docRef = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
//         await docRef.set(settingsData, { merge: true });
//         return true;
//     } catch (error) {
//         console.error("Error al actualizar la configuración del front:", error);
//         throw new Error("No se pudo actualizar la configuración.");
//     }
// };

// export const saveCardPreset = async (preset) => {
//     if (!db) throw new Error("No se pudo guardar el preset.");
//     try {
//         const docRef = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
//         const docSnap = await docRef.get();
//         const data = docSnap.exists ? docSnap.data() : defaultFrontSettings;
//         const currentPresets = Array.isArray(data.cardPresets) ? data.cardPresets : [];
//         if (currentPresets.length >= 3) {
//             throw new Error("Ya tenés 3 presets guardados. Eliminá uno antes de agregar otro.");
//         }
//         const newPresets = [...currentPresets, preset];
//         await docRef.set({ cardPresets: newPresets }, { merge: true });
//         return newPresets;
//     } catch (error) {
//         console.error("Error al guardar el preset:", error);
//         throw error;
//     }
// };

// export const deleteCardPreset = async (index) => {
//     if (!db) throw new Error("No se pudo eliminar el preset.");
//     try {
//         const docRef = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
//         const docSnap = await docRef.get();
//         const data = docSnap.exists ? docSnap.data() : defaultFrontSettings;
//         const currentPresets = Array.isArray(data.cardPresets) ? data.cardPresets : [];
//         const idx = parseInt(index, 10);
//         if (isNaN(idx) || idx < 0 || idx >= currentPresets.length) {
//             throw new Error("Índice de preset inválido.");
//         }
//         const newPresets = currentPresets.filter((_, i) => i !== idx);
//         await docRef.set({ cardPresets: newPresets }, { merge: true });
//         return newPresets;
//     } catch (error) {
//         console.error("Error al eliminar el preset:", error);
//         throw error;
//     }
// };