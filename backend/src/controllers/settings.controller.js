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
                primary:         b.colorPrimary         || "#c8a4a0",
                background:      b.colorBackground      || "#ffffff",
                text:            b.colorText            || "#1a0f0d",
                heroBackground:  b.colorHeroBackground  || "#2d1f1a",
                saleBadge:       b.colorSaleBadge       || "#ef4444",
                navbarBg:        b.colorNavbarBg        || "#ffffff",
                navbarText:      b.colorNavbarText      || "#1a0f0d",
                footerBg:        b.colorFooterBg        || "#1a0f0d",
                footerText:      b.colorFooterText      || "#d4c4bc",
                cardBg:          b.colorCardBg          || "#ffffff",
                cardText:        b.colorCardText        || "#1a0f0d",
                cardPrice:       b.colorCardPrice       || "#c8a4a0",
                cardBtnBg:       b.colorCardBtnBg       || "#c8a4a0",
                cardBtnText:     b.colorCardBtnText     || "#ffffff",
                badgeNew:        b.colorBadgeNew        || "#16a34a",
                badgeSale:       b.colorBadgeSale       || "#ef4444",
                badgeBestSeller: b.colorBadgeBestSeller || "#d97706",
            },
            hero: {
                useGradient:    b.heroUseGradient === "on",
                gradientFrom:   b.heroGradientFrom   || "#2d1f1a",
                gradientTo:     b.heroGradientTo     || "#5c3429",
                gradientAngle:  parseInt(b.heroGradientAngle) || 145,
                title:          b.heroTitle    || "Calia",
                subtitle:       b.heroSubtitle || "Carteras de cuero diseñadas para acompañarte todos los días.",
                eyebrow:        b.heroEyebrow  || "Colección invierno 2026",
                ctaLabel:       b.heroCtaLabel || "Ver catálogo",
                overlayOpacity: parseInt(b.heroOverlayOpacity) || 50,
            },
            brand: {
                storeName: b.brandStoreName || "Calia",
                tagline:   b.brandTagline   || "Tu estilo, tu esencia.",
                whatsapp:  b.brandWhatsapp  || "",
                instagram: b.brandInstagram || "",
                facebook:  b.brandFacebook  || "",
                email:     b.brandEmail     || "",
                phone:     b.brandPhone     || "",
                address:   b.brandAddress   || "Buenos Aires, Argentina",
            },
            typography: {
                fontFamily:    b.fontFamily    || "'DM Sans', sans-serif",
                fontSizeBase:  b.fontSizeBase  || "md",
                fontSizeTitle: b.fontSizeTitle || "md",
                fontSizePrice: b.fontSizePrice || "lg",
            },
            images: {
                heroBanner: req.file ? req.file.path : (b.heroBannerExisting || ""),
            },
            cardStyle: {
                shadow:    b.cardShadow    || "md",
                radius:    b.cardRadius    || "lg",
                showStock: b.cardShowStock === "on",
                layout:    b.cardLayout    || "vertical",
                btnRadius: b.cardBtnRadius || "md",
            },
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
        const preset    = { name, shadow, radius, showStock: !!showStock, layout, btnRadius: btnRadius || "md" };
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