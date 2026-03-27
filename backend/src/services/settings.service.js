import { db } from "../firebase/admin.js";

const SETTINGS_COLLECTION = "settings";
const FRONT_DOC_ID = "front";

const defaultFrontSettings = {
    colors: {
        primary:         "#c8a4a0",
        background:      "#ffffff",
        text:            "#1a0f0d",
        heroBackground:  "#2d1f1a",
        saleBadge:       "#ef4444",
        navbarBg:        "#ffffff",
        navbarText:      "#1a0f0d",
        footerBg:        "#1a0f0d",
        footerText:      "#d4c4bc",
        cardBg:          "#ffffff",
        cardText:        "#1a0f0d",
        cardPrice:       "#c8a4a0",
        cardBtnBg:       "#c8a4a0",
        cardBtnText:     "#ffffff",
        badgeNew:        "#16a34a",
        badgeSale:       "#ef4444",
        badgeBestSeller: "#d97706",
    },
    hero: {
        useGradient:    false,
        gradientFrom:   "#2d1f1a",
        gradientTo:     "#5c3429",
        gradientAngle:  145,
        title:          "Calia",
        subtitle:       "Carteras de cuero diseñadas para acompañarte todos los días.",
        eyebrow:        "Colección invierno 2026",
        ctaLabel:       "Ver catálogo",
        overlayOpacity: 50,
    },
    brand: {
        storeName: "Calia",
        tagline:   "Tu estilo, tu esencia.",
        whatsapp:  "",
        instagram: "",
        facebook:  "",
        email:     "",
        phone:     "",
        address:   "Buenos Aires, Argentina",
    },
    typography: {
        fontFamily:    "'DM Sans', sans-serif",
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
        const docRef  = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            return {
                ...defaultFrontSettings,
                ...data,
                colors:    { ...defaultFrontSettings.colors,    ...(data.colors    || {}) },
                hero:      { ...defaultFrontSettings.hero,      ...(data.hero      || {}) },
                brand:     { ...defaultFrontSettings.brand,     ...(data.brand     || {}) },
                typography:{ ...defaultFrontSettings.typography, ...(data.typography || {}) },
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
    const docRef  = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
    const docSnap = await docRef.get();
    const data    = docSnap.exists ? docSnap.data() : defaultFrontSettings;
    const currentPresets = Array.isArray(data.cardPresets) ? data.cardPresets : [];
    if (currentPresets.length >= 3) throw new Error("Ya tenés 3 presets guardados. Eliminá uno antes de agregar otro.");
    const newPresets = [...currentPresets, preset];
    await docRef.set({ cardPresets: newPresets }, { merge: true });
    return newPresets;
};

export const deleteCardPreset = async (index) => {
    if (!db) throw new Error("No se pudo eliminar el preset.");
    const docRef  = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
    const docSnap = await docRef.get();
    const data    = docSnap.exists ? docSnap.data() : defaultFrontSettings;
    const currentPresets = Array.isArray(data.cardPresets) ? data.cardPresets : [];
    const idx = parseInt(index, 10);
    if (isNaN(idx) || idx < 0 || idx >= currentPresets.length) throw new Error("Índice de preset inválido.");
    const newPresets = currentPresets.filter((_, i) => i !== idx);
    await docRef.set({ cardPresets: newPresets }, { merge: true });
    return newPresets;
};

/* ── FAQs ── */
const getFaqs = async () => {
    if (!db) return [];
    const docRef  = db.collection(SETTINGS_COLLECTION).doc(FRONT_DOC_ID);
    const docSnap = await docRef.get();
    const data    = docSnap.exists ? docSnap.data() : {};
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