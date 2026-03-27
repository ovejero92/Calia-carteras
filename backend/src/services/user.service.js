import { db } from "../firebase/admin.js";
import admin from "../firebase/admin.js";

/**
 * Obtener todos los usuarios
 */
export const getUsers = async (filters = {}) => {
    try {
        let query = db.collection('users');
        let snapshot;

        if (filters.status) {
            snapshot = await query.where('status', '==', filters.status).limit(500).get();
        } else if (filters.role) {
            snapshot = await query.where('role', '==', filters.role).limit(500).get();
        } else {
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

        if (filters.status && filters.role) {
            users = users.filter(user => user.role === filters.role);
        }
        if (filters.role && filters.status) {
            users = users.filter(user => user.status === filters.status);
        }

        if (filters.name || filters.email) {
            users = users.filter(user => {
                const matchesName = !filters.name || 
                    (user.name?.toLowerCase() || '').includes(filters.name.toLowerCase());
                const matchesEmail = !filters.email || 
                    (user.email?.toLowerCase() || '').includes(filters.email.toLowerCase());
                return matchesName && matchesEmail;
            });
        }

        users.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB - dateA;
        });

        return users;
    } catch (error) {
        console.error("❌ Error en getUsers service:", error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const doc = await db.collection('users').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
        console.error("❌ Error en getUserById service:", error);
        throw error;
    }
};

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

export const createUser = async (userData) => {
    try {
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

export const updateUser = async (id, userData) => {
    try {
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

export const deleteUser = async (id) => {
    try {
        await db.collection('users').doc(id).delete();
        console.log("✅ Usuario eliminado:", id);
        return true;
    } catch (error) {
        console.error("❌ Error en deleteUser service:", error);
        throw error;
    }
};

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
