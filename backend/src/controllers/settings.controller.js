import * as settingsService from "../services/settings.service.js";

export const renderFrontSettings = async (req, res) => {
    try {
        const settings = await settingsService.getFrontSettings();
        res.render('owner/front', { titulo: 'Diseño Web', user: req.user, settings });
    } catch (error) {
        console.error("❌ Error al renderizar settings del front:", error);
        res.status(500).send("Error al cargar la configuración.");
    }
};

export const updateFrontSettings = async (req, res) => {
    try {
        const b = req.body;
        const settingsData = {
            colors: {
                primary:         b.colorPrimary         || "#1d4ed8",
                background:      b.colorBackground      || "#ffffff",
                text:            b.colorText            || "#1f2937",
                heroBackground:  b.colorHeroBackground  || "#1e3a8a",
                saleBadge:       b.colorSaleBadge       || "#ef4444",
                navbarBg:        b.colorNavbarBg        || "#ffffff",
                navbarText:      b.colorNavbarText      || "#1f2937",
                footerBg:        b.colorFooterBg        || "#111827",
                footerText:      b.colorFooterText      || "#d1d5db",
                cardBg:          b.colorCardBg          || "#ffffff",
                cardText:        b.colorCardText        || "#1f2937",
                cardPrice:       b.colorCardPrice       || "#1d4ed8",
                cardBtnBg:       b.colorCardBtnBg       || "#1d4ed8",
                cardBtnText:     b.colorCardBtnText     || "#ffffff",
                badgeNew:        b.colorBadgeNew        || "#16a34a",
                badgeSale:       b.colorBadgeSale       || "#ef4444",
                badgeBestSeller: b.colorBadgeBestSeller || "#d97706",
            },
            typography: {
                fontFamily:    b.fontFamily    || "'Inter', sans-serif",
                fontSizeBase:  b.fontSizeBase  || "md",
                fontSizeTitle: b.fontSizeTitle || "md",
                fontSizePrice: b.fontSizePrice || "lg",
            },
            images: { heroBanner: req.file ? req.file.path : (b.heroBannerExisting || "") },
            cardStyle: {
                shadow:    b.cardShadow    || "md",
                radius:    b.cardRadius    || "lg",
                showStock: b.cardShowStock === "on",
                layout:    b.cardLayout    || "vertical",
                btnRadius: b.cardBtnRadius || "md",
            }
        };
        await settingsService.updateFrontSettings(settingsData);
        res.redirect('/owner/front');
    } catch (error) {
        console.error("Error al actualizar configuración:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getPublicFrontSettings = async (req, res) => {
    try {
        const settings = await settingsService.getFrontSettings();
        res.json({ status: "success", data: settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const saveCardPreset = async (req, res) => {
    try {
        const { name, shadow, radius, showStock, layout, btnRadius } = req.body;
        if (!name || !shadow || !radius || !layout) return res.status(400).json({ error: "Faltan campos del preset." });
        const preset = { name, shadow, radius, showStock: !!showStock, layout, btnRadius: btnRadius || "md" };
        const newPresets = await settingsService.saveCardPreset(preset);
        res.json({ status: "success", cardPresets: newPresets });
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const deleteCardPreset = async (req, res) => {
    try {
        const newPresets = await settingsService.deleteCardPreset(req.params.index);
        res.json({ status: "success", cardPresets: newPresets });
    } catch (error) { res.status(400).json({ error: error.message }); }
};

// ── FAQs ──────────────────────────────────────────────────────────────────────
export const saveFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) return res.status(400).json({ error: "Pregunta y respuesta son requeridas." });
        const faqs = await settingsService.saveFaq({ question: question.trim(), answer: answer.trim() });
        res.json({ status: "success", faqs });
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const updateFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) return res.status(400).json({ error: "Pregunta y respuesta son requeridas." });
        const faqs = await settingsService.updateFaq(parseInt(req.params.index), { question: question.trim(), answer: answer.trim() });
        res.json({ status: "success", faqs });
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const deleteFaq = async (req, res) => {
    try {
        const faqs = await settingsService.deleteFaq(parseInt(req.params.index));
        res.json({ status: "success", faqs });
    } catch (error) { res.status(400).json({ error: error.message }); }
};
// import * as settingsService from "../services/settings.service.js";

// export const renderFrontSettings = async (req, res) => {
//     try {
//         const settings = await settingsService.getFrontSettings();
//         res.render('owner/front', {
//             titulo: 'Diseño Web',
//             user: req.user,
//             settings: settings
//         });
//     } catch (error) {
//         console.error("❌ Error al renderizar settings del front:", error);
//         res.status(500).send("Error al cargar la configuración.");
//     }
// };

// export const updateFrontSettings = async (req, res) => {
//     try {
//         const b = req.body;
//         const settingsData = {
//             colors: {
//                 primary:        b.colorPrimary        || "#1d4ed8",
//                 background:     b.colorBackground     || "#ffffff",
//                 text:           b.colorText           || "#1f2937",
//                 heroBackground: b.colorHeroBackground || "#1e3a8a",
//                 saleBadge:      b.colorSaleBadge      || "#ef4444",
//                 navbarBg:       b.colorNavbarBg       || "#ffffff",
//                 navbarText:     b.colorNavbarText     || "#1f2937",
//                 footerBg:       b.colorFooterBg       || "#111827",
//                 footerText:     b.colorFooterText     || "#d1d5db",
//                 cardBg:         b.colorCardBg         || "#ffffff",
//                 cardText:       b.colorCardText       || "#1f2937",
//                 cardPrice:      b.colorCardPrice      || "#1d4ed8",
//                 cardBtnBg:      b.colorCardBtnBg      || "#1d4ed8",
//                 cardBtnText:    b.colorCardBtnText    || "#ffffff",
//             },
//             typography: {
//                 fontFamily:    b.fontFamily    || "'Inter', sans-serif",
//                 fontSizeBase:  b.fontSizeBase  || "md",
//                 fontSizeTitle: b.fontSizeTitle || "md",
//                 fontSizePrice: b.fontSizePrice || "lg",
//             },
//             images: {
//                 heroBanner: req.file ? req.file.path : (b.heroBannerExisting || "")
//             },
//             cardStyle: {
//                 shadow:    b.cardShadow    || "md",
//                 radius:    b.cardRadius    || "lg",
//                 showStock: b.cardShowStock === "on",
//                 layout:    b.cardLayout    || "vertical",
//                 btnRadius: b.cardBtnRadius || "md",
//             }
//         };

//         await settingsService.updateFrontSettings(settingsData);
//         res.redirect('/owner/front');
//     } catch (error) {
//         console.error("Error al actualizar configuración:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// export const getPublicFrontSettings = async (req, res) => {
//     try {
//         const settings = await settingsService.getFrontSettings();
//         res.json({ status: "success", data: settings });
//     } catch (error) {
//         console.error("Error al obtener configuración pública:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// export const saveCardPreset = async (req, res) => {
//     try {
//         const { name, shadow, radius, showStock, layout, btnRadius } = req.body;
//         if (!name || !shadow || !radius || !layout) {
//             return res.status(400).json({ error: "Faltan campos del preset." });
//         }
//         const preset = { name, shadow, radius, showStock: !!showStock, layout, btnRadius: btnRadius || "md" };
//         const newPresets = await settingsService.saveCardPreset(preset);
//         res.json({ status: "success", cardPresets: newPresets });
//     } catch (error) {
//         console.error("Error al guardar el preset:", error);
//         res.status(400).json({ error: error.message });
//     }
// };

// export const deleteCardPreset = async (req, res) => {
//     try {
//         const { index } = req.params;
//         const newPresets = await settingsService.deleteCardPreset(index);
//         res.json({ status: "success", cardPresets: newPresets });
//     } catch (error) {
//         console.error("Error al eliminar el preset:", error);
//         res.status(400).json({ error: error.message });
//     }
// };