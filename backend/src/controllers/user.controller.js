import * as userService from "../services/user.service.js";
import { userSchema, userSearchSchema } from "../schemas/user.schema.js";

/**
 * Renderizar vista de gestión de usuarios
 */
export const renderUsers = async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.role) filters.role = req.query.role;
        if (req.query.name) filters.name = req.query.name;
        if (req.query.email) filters.email = req.query.email;

        const usersList = await userService.getUsers(filters);
        const stats = await userService.getUserStats();

        res.render('owner/users', {
            titulo: 'Gestión de Usuarios',
            user: req.user,
            users: usersList,
            stats: stats,
            filters: filters
        });
    } catch (error) {
        console.error("❌ Error al renderizar usuarios:", error);
        res.status(500).send("Error al cargar los usuarios.");
    }
};

/**
 * Crear un nuevo usuario
 */
export const createUser = async (req, res) => {
    try {
        // Validar datos con Zod
        const result = userSchema.safeParse(req.body);

        if (!result.success) {
            const errorsList = result.error?.errors || [];
            const errorMessages = errorsList.map(err => ({
                path: err.path[0],
                message: err.message
            }));
            return res.status(400).json({ errors: errorMessages });
        }

        // Crear usuario
        await userService.createUser(result.data);

        res.status(201).json({ status: "success", message: "Usuario creado exitosamente" });
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar datos con Zod
        const result = userSchema.safeParse(req.body);

        if (!result.success) {
            const errorsList = result.error?.errors || [];
            const errorMessages = errorsList.map(err => ({
                path: err.path[0],
                message: err.message
            }));
            return res.status(400).json({ errors: errorMessages });
        }

        // Verificar que el usuario existe
        const existingUser = await userService.getUserById(id);
        if (!existingUser) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        await userService.updateUser(id, result.data);

        res.json({ status: "success", message: "Usuario actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Eliminar (desactivar) un usuario
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const existingUser = await userService.getUserById(id);
        if (!existingUser) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        await userService.deleteUser(id);

        res.json({ status: "success", message: "Usuario desactivado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener un usuario por ID (API)
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ status: "success", data: user });
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ error: error.message });
    }
};
