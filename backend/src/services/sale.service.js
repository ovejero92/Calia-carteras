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

/**
 * Agregaciones para gráficos del dashboard (solo servidor; no envía ventas crudas al navegador).
 * Incluye hasta `maxDocs` ventas completadas (las más recientes por orden de lectura).
 */
export async function getSalesAnalyticsAggregation({ maxDocs = 1800, monthsBack = 14 } = {}) {
    const empty = {
        monthlyLabels: [],
        monthlyRevenue: [],
        monthlyCount: [],
        deliveryLabels: [],
        deliveryRevenue: [],
        topProducts: [],
        truncated: false,
        docCount: 0,
    };

    if (!db) return empty;

    try {
        const snapshot = await db.collection("sales").where("status", "==", "completada").limit(maxDocs).get();
        const byMonth = new Map();
        const byMonthCount = new Map();
        const byDelivery = new Map();
        const byProduct = new Map();
        let totalRev = 0;

        snapshot.docs.forEach((doc) => {
            const d = doc.data();
            const created = d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt || Date.now());
            const y = created.getFullYear();
            const m = created.getMonth() + 1;
            const mk = `${y}-${String(m).padStart(2, "0")}`;
            const total = parseFloat(d.total) || 0;
            totalRev += total;
            byMonth.set(mk, (byMonth.get(mk) || 0) + total);
            byMonthCount.set(mk, (byMonthCount.get(mk) || 0) + 1);

            let del = d.deliveryMethod;
            if (!del) {
                const addr = String(d.userAddress || "").toLowerCase();
                del = addr.includes("retiro") ? "retiro" : "envio";
            }
            byDelivery.set(del, (byDelivery.get(del) || 0) + total);

            (d.items || []).forEach((item) => {
                const pid = item.productId || item.id || "unknown";
                const cur = byProduct.get(pid) || {
                    productId: pid,
                    productName: item.productName || pid,
                    revenue: 0,
                    quantity: 0,
                };
                cur.revenue += parseFloat(item.subtotal) || 0;
                cur.quantity += parseInt(item.quantity, 10) || 0;
                byProduct.set(pid, cur);
            });
        });

        const now = new Date();
        const monthlyLabels = [];
        const monthlyRevenue = [];
        const monthlyCount = [];
        for (let i = monthsBack - 1; i >= 0; i--) {
            const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mk = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
            monthlyLabels.push(
                dt.toLocaleDateString("es-AR", { month: "short", year: "2-digit" })
            );
            monthlyRevenue.push(Math.round((byMonth.get(mk) || 0) * 100) / 100);
            monthlyCount.push(byMonthCount.get(mk) || 0);
        }

        const deliveryOrder = ["retiro", "envio"];
        const deliveryLabels = [];
        const deliveryRevenue = [];
        deliveryOrder.forEach((k) => {
            if (byDelivery.has(k)) {
                deliveryLabels.push(k === "retiro" ? "Retiro" : "Envío");
                deliveryRevenue.push(Math.round((byDelivery.get(k) || 0) * 100) / 100);
            }
        });
        byDelivery.forEach((v, k) => {
            if (!deliveryOrder.includes(k)) {
                deliveryLabels.push(String(k));
                deliveryRevenue.push(Math.round(v * 100) / 100);
            }
        });

        const topProducts = Array.from(byProduct.values())
            .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
            .slice(0, 8)
            .map((p) => ({
                name: p.productName,
                revenue: Math.round((p.revenue || 0) * 100) / 100,
                quantity: p.quantity || 0,
            }));

        return {
            monthlyLabels,
            monthlyRevenue,
            monthlyCount,
            deliveryLabels,
            deliveryRevenue,
            topProducts,
            truncated: snapshot.size >= maxDocs,
            docCount: snapshot.size,
            totalSampleRevenue: Math.round(totalRev * 100) / 100,
        };
    } catch (err) {
        console.error("getSalesAnalyticsAggregation:", err.message);
        return { ...empty, error: err.message };
    }
}

export { generateSaleNumber };
