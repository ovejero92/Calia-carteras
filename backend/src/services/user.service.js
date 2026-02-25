import { db } from "../firebase/admin.js";
import admin from "../firebase/admin.js";

/**
 * Obtener todos los usuarios
 */
export const getUsers = async (filters = {}) => {
    try {
        let query = db.collection('users');
        let snapshot;

        // Evitar índices compuestos: usar solo un filtro en la consulta
        // Los demás filtros se aplicarán en memoria
        if (filters.status) {
            // Si hay filtro de status, usar solo ese
            snapshot = await query.where('status', '==', filters.status).limit(500).get();
        } else if (filters.role) {
            // Si hay filtro de role pero no status, usar solo role
            snapshot = await query.where('role', '==', filters.role).limit(500).get();
        } else {
            // Si no hay filtros, obtener todos sin orderBy para evitar índices
            snapshot = await query.limit(500).get();
        }

        if (snapshot.empty) {
            return [];
        }

        let users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt || new Date())
            };
        });

        // Aplicar filtros adicionales en memoria para evitar índices compuestos
        if (filters.status && filters.role) {
            // Si había filtro de status en consulta, aplicar role en memoria
            users = users.filter(user => user.role === filters.role);
        }
        if (filters.role && filters.status) {
            // Si había filtro de role en consulta, aplicar status en memoria
            users = users.filter(user => user.status === filters.status);
        }

        // Filtro por nombre o email (búsqueda en memoria)
        if (filters.name || filters.email) {
            users = users.filter(user => {
                const matchesName = !filters.name || 
                    (user.name?.toLowerCase() || '').includes(filters.name.toLowerCase());
                const matchesEmail = !filters.email || 
                    (user.email?.toLowerCase() || '').includes(filters.email.toLowerCase());
                return matchesName && matchesEmail;
            });
        }

        // Ordenar por fecha en memoria (más reciente primero)
        users.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB - dateA; // Descendente (más reciente primero)
        });

        return users;
    } catch (error) {
        console.error("❌ Error en getUsers service:", error);
        throw error;
    }
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (id) => {
    try {
        const doc = await db.collection('users').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
        console.error("❌ Error en getUserById service:", error);
        throw error;
    }
};

/**
 * Obtener usuario por email
 */
export const getUserByEmail = async (email) => {
    try {
        const snapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error("❌ Error en getUserByEmail service:", error);
        throw error;
    }
};

/**
 * Crear un nuevo usuario
 */
export const createUser = async (userData) => {
    try {
        // Verificar si ya existe un usuario con ese email
        const existingUser = await getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('Ya existe un usuario con ese email');
        }

        const newUser = {
            ...userData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('users').add(newUser);
        console.log("✅ Usuario creado con ID:", docRef.id);
        return { id: docRef.id, ...userData };
    } catch (error) {
        console.error("❌ Error en createUser service:", error);
        throw error;
    }
};

/**
 * Actualizar un usuario
 */
export const updateUser = async (id, userData) => {
    try {
        // Si se actualiza el email, verificar que no exista otro usuario con ese email
        if (userData.email) {
            const existingUser = await getUserByEmail(userData.email);
            if (existingUser && existingUser.id !== id) {
                throw new Error('Ya existe otro usuario con ese email');
            }
        }

        const updatedData = {
            ...userData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(id).update(updatedData);
        console.log("✅ Usuario actualizado:", id);
        return true;
    } catch (error) {
        console.error("❌ Error en updateUser service:", error);
        throw error;
    }
};

/**
 * Eliminar un usuario (soft delete - cambiar status a inactivo)
 */
export const deleteUser = async (id) => {
    try {
        // En lugar de borrar físicamente, marcamos como inactivo
        await db.collection('users').doc(id).update({
            status: 'inactivo',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("✅ Usuario desactivado:", id);
        return true;
    } catch (error) {
        console.error("❌ Error en deleteUser service:", error);
        throw error;
    }
};

/**
 * Obtener estadísticas de usuarios
 */
export const getUserStats = async () => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => doc.data());

        const stats = {
            total: users.length,
            activos: users.filter(u => u.status === 'activo').length,
            inactivos: users.filter(u => u.status === 'inactivo').length,
            clientes: users.filter(u => u.role === 'cliente').length,
            admins: users.filter(u => u.role === 'admin').length
        };

        return stats;
    } catch (error) {
        console.error("❌ Error en getUserStats service:", error);
        throw error;
    }
};
