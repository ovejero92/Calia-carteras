import { db } from "../firebase/admin.js";
import admin from "../firebase/admin.js";
import * as orderService from "./order.service.js";

export const createSale = async (saleData, opts = {}) => {
    return orderService.createOrder(saleData, { source: opts.source || "sale.service" });
};

export const updateSale = async (id, saleData, options = {}) => {
    return orderService.updateOrder(id, saleData, {
        source: options.source || "sale.service",
        notifyClientAccept: options.notifyClientAccept === true,
    });
};

export const deleteSale = async (id) => {
    return orderService.deleteOrder(id);
};

const generateSaleNumber = async () => {
    try {
        const year = new Date().getFullYear();
        const snapshot = await db.collection("sales")
            .where("saleNumber", ">=", `V${year}0000`)
            .where("saleNumber", "<=", `V${year}9999`)
            .orderBy("saleNumber", "desc")
            .limit(1)
            .get();

        if (snapshot.empty) {
            return `V${year}0001`;
        }

        const lastNumber = snapshot.docs[0].data().saleNumber;
        const num = parseInt(lastNumber.substring(5)) + 1;
        return `V${year}${num.toString().padStart(4, "0")}`;
    } catch (error) {
        return `V${Date.now()}`;
    }
};

export const getSales = async (filters = {}) => {
    try {
        let query = db.collection("sales");
        let snapshot;
        if (filters.status) {
            snapshot = await query.where("status", "==", filters.status).limit(500).get();
        } else {
            snapshot = await query.limit(500).get();
        }

        if (snapshot.empty) {
            return [];
        }

        let sales = snapshot.docs.map(doc => {
            const data = doc.data();
            return orderService.normalizeOrderDoc(doc.id, data);
        });

        if (filters.paymentMethod && !filters.status) {
            sales = sales.filter(sale => sale.paymentMethod === filters.paymentMethod);
        }
        if (filters.lifecycle) {
            sales = sales.filter(sale => sale.orderLifecycle === filters.lifecycle);
        }
        if (filters.userId) {
            sales = sales.filter(sale => sale.userId === filters.userId);
        }
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            startDate.setHours(0, 0, 0, 0);
            sales = sales.filter(sale => {
                const saleDate = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
                return saleDate >= startDate;
            });
        }
        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            sales = sales.filter(sale => {
                const saleDate = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
                return saleDate <= endDate;
            });
        }

        if (filters.paymentMethod && filters.status) {
            sales = sales.filter(sale => sale.paymentMethod === filters.paymentMethod);
        }

        sales.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB - dateA;
        });

        return sales.slice(0, 100);
    } catch (error) {
        console.error("Error en getSales service:", error);
        throw error;
    }
};

export const getSaleById = async (id) => {
    return orderService.getOrderById(id);
};

/** Pedidos de un cliente (consulta indexada por userEmailLower cuando exista). */
export const getSalesByUserEmail = async (email) => {
    const raw = (email || "").trim().toLowerCase();
    if (!raw) return [];

    try {
        let snapshot = await db
            .collection("sales")
            .where("userEmailLower", "==", raw)
            .limit(100)
            .get();

        if (snapshot.empty) {
            snapshot = await db.collection("sales").where("userEmail", "==", email.trim()).limit(100).get();
        }

        if (snapshot.empty) {
            const snapAll = await db.collection("sales").limit(300).get();
            const docs = snapAll.docs.filter((d) => {
                const em = d.data().userEmail;
                return em && String(em).trim().toLowerCase() === raw;
            });
            return docs
                .map((doc) => orderService.normalizeOrderDoc(doc.id, doc.data()))
                .sort((a, b) => {
                    const da = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                    const db2 = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                    return db2 - da;
                });
        }

        const list = snapshot.docs.map((doc) => orderService.normalizeOrderDoc(doc.id, doc.data()));
        list.sort((a, b) => {
            const da = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const db2 = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return db2 - da;
        });
        return list;
    } catch (error) {
        console.error("Error en getSalesByUserEmail:", error);
        throw error;
    }
};

export const getSaleStats = async (startDate = null, endDate = null) => {
    try {
        let query = db.collection("sales").where("status", "==", "completada");

        const snapshot = await query.get();
        let sales = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
            };
        });

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            sales = sales.filter(sale => {
                const saleDate = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
                return saleDate >= start;
            });
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            sales = sales.filter(sale => {
                const saleDate = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
                return saleDate <= end;
            });
        }

        const totalSales = sales.length || 0;
        const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0) || 0;
        const totalItems = sales.reduce((sum, sale) => {
            if (!sale.items) return sum;
            return sum + sale.items.reduce((itemSum, item) => itemSum + (parseInt(item.quantity) || 0), 0);
        }, 0) || 0;

        const productSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        productId: item.productId,
                        productName: item.productName,
                        quantity: 0,
                        revenue: 0,
                    };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.subtotal;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
            .slice(0, 5);

        const paymentMethods = {};
        sales.forEach(sale => {
            let method = sale.paymentMethod || "otro";

            if (method === "tarjeta" && sale.cardType) {
                if (sale.cardType === "debito") {
                    method = "tarjeta_debito";
                } else if (sale.cardType === "credito") {
                    method = "tarjeta_credito";
                }
            }

            if (!paymentMethods[method]) {
                paymentMethods[method] = { count: 0, total: 0 };
            }
            paymentMethods[method].count += 1;
            paymentMethods[method].total += (parseFloat(sale.total) || 0);
        });

        return {
            totalSales: totalSales || 0,
            totalRevenue: totalRevenue || 0,
            totalItems: totalItems || 0,
            averageSale: totalSales > 0 ? (totalRevenue / totalSales) : 0,
            topProducts: topProducts || [],
            paymentMethods: paymentMethods || {},
        };
    } catch (error) {
        console.error("Error en getSaleStats service:", error);
        throw error;
    }
};

export const getUnreadCount = async () => {
    try {
        const snapshot = await db.collection("sales").where("isRead", "==", false).get();
        return snapshot.size;
    } catch (error) {
        console.error("Error en getUnreadCount service:", error);
        return 0;
    }
};

export const markSalesAsRead = async () => {
    try {
        const snapshot = await db.collection("sales").where("isRead", "==", false).get();
        if (snapshot.empty) return;

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
                isRead: true,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();
        console.log(`Marcadas ${snapshot.size} ventas como leídas`);
    } catch (error) {
        console.error("Error en markSalesAsRead service:", error);
    }
};

export { generateSaleNumber };
