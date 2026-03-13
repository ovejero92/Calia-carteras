import * as categoryService from "../services/category.service.js";

// ── Panel admin ───────────────────────────────────────────────────────────────
export const renderCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        res.render("owner/categories", {
            titulo: "Categorías",
            user: req.user,
            categories,
        });
    } catch (err) {
        console.error("Error al renderizar categorías:", err);
        res.status(500).send("Error al cargar categorías.");
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) return res.status(400).json({ error: "Nombre y slug son requeridos." });
        const cleanSlug = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const category = await categoryService.createCategory({ name: name.trim(), slug: cleanSlug });
        res.status(201).json({ status: "success", data: category });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;
        const updates = {};
        if (name) updates.name = name.trim();
        if (slug) updates.slug = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        await categoryService.updateCategory(id, updates);
        res.json({ status: "success" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── API pública ───────────────────────────────────────────────────────────────
export const getPublicCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        res.json({ status: "success", data: categories });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};