import { db } from "../firebase/admin.js";
import admin from "../firebase/admin.js";
import * as productService from "./product.service.js";

export const createSale = async (saleData) => {
    try {
        for (const item of saleData.items) {
            const product = await productService.getProductById(item.productId);
            if (!product) {
                throw new Error(`Producto ${item.productName} no encontrado`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para ${item.productName}. Stock disponible: ${product.stock}`);
            }
        }

        const newSale = {
            ...saleData,
            saleNumber: await generateSaleNumber(),
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const saleRef = await db.collection('sales').add(newSale);

        if (saleData.status === 'completada') {
            for (const item of saleData.items) {
                const product = await productService.getProductById(item.productId);
                const newStock = product.stock - item.quantity;
                await productService.updateProduct(item.productId, { stock: newStock });
            }
        }

        console.log("✅ Venta creada con ID:", saleRef.id);
        return { id: saleRef.id, ...newSale };
    } catch (error) {
        console.error("❌ Error en createSale service:", error);
        throw error;
    }
};

const generateSaleNumber = async () => {
    try {
        const year = new Date().getFullYear();
        const snapshot = await db.collection('sales')
            .where('saleNumber', '>=', `V${year}0000`)
            .where('saleNumber', '<=', `V${year}9999`)
            .orderBy('saleNumber', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return `V${year}0001`;
        }

        const lastNumber = snapshot.docs[0].data().saleNumber;
        const num = parseInt(lastNumber.substring(5)) + 1;
        return `V${year}${num.toString().padStart(4, '0')}`;
    } catch (error) {
        return `V${Date.now()}`;
    }
};

export const getSales = async (filters = {}) => {
    try {
        let query = db.collection('sales');
        let snapshot;
        if (filters.status) {
            snapshot = await query.where('status', '==', filters.status).limit(500).get();
        } else {
            snapshot = await query.limit(500).get();
        }

        if (snapshot.empty) {
            return [];
        }

        let sales = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt || new Date())
            };
        });

        if (filters.paymentMethod && !filters.status) {
            sales = sales.filter(sale => sale.paymentMethod === filters.paymentMethod);
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
            return dateB - dateA; // Descendente
        });

        return sales.slice(0, 100);
    } catch (error) {
        console.error("❌ Error en getSales service:", error);
        throw error;
    }
};

export const getSaleById = async (id) => {
    try {
        const doc = await db.collection('sales').doc(id).get();
        if (!doc.exists) {
            return null;
        }

        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
        };
    } catch (error) {
        console.error("❌ Error en getSaleById service:", error);
        throw error;
    }
};

export const updateSale = async (id, saleData) => {
    try {
        const existingSale = await getSaleById(id);
        if (!existingSale) {
            throw new Error('Venta no encontrada');
        }

        if (saleData.status && saleData.status !== existingSale.status) {
            if (existingSale.status === 'completada' && saleData.status !== 'completada') {
                for (const item of existingSale.items) {
                    const product = await productService.getProductById(item.productId);
                    await productService.updateProduct(item.productId, {
                        stock: product.stock + item.quantity
                    });
                }
            } else if (existingSale.status !== 'completada' && saleData.status === 'completada') {
                for (const item of existingSale.items) {
                    const product = await productService.getProductById(item.productId);
                    if (product.stock < item.quantity) {
                        throw new Error(`Stock insuficiente para ${item.productName}`);
                    }
                    await productService.updateProduct(item.productId, {
                        stock: product.stock - item.quantity
                    });
                }
            }
        }

        const updatedData = {
            ...saleData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('sales').doc(id).update(updatedData);
        console.log("✅ Venta actualizada:", id);
        return true;
    } catch (error) {
        console.error("❌ Error en updateSale service:", error);
        throw error;
    }
};

export const deleteSale = async (id) => {
    try {
        const sale = await getSaleById(id);
        if (!sale) {
            throw new Error('Venta no encontrada');
        }
        if (sale.status === 'completada') {
            for (const item of sale.items) {
                const product = await productService.getProductById(item.productId);
                await productService.updateProduct(item.productId, {
                    stock: product.stock + item.quantity
                });
            }
        }

        await db.collection('sales').doc(id).delete();
        console.log("✅ Venta eliminada:", id);
        return true;
    } catch (error) {
        console.error("❌ Error en deleteSale service:", error);
        throw error;
    }
};

export const getSaleStats = async (startDate = null, endDate = null) => {
    try {
        let query = db.collection('sales').where('status', '==', 'completada');

        const snapshot = await query.get();
        let sales = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date())
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
                        revenue: 0
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
            let method = sale.paymentMethod || 'otro';

            if (method === 'tarjeta' && sale.cardType) {
                if (sale.cardType === 'debito') {
                    method = 'tarjeta_debito';
                } else if (sale.cardType === 'credito') {
                    method = 'tarjeta_credito';
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
            paymentMethods: paymentMethods || {}
        };
    } catch (error) {
        console.error("❌ Error en getSaleStats service:", error);
        throw error;
    }
};
export const getUnreadCount = async () => {
    try {
        const snapshot = await db.collection('sales').where('isRead', '==', false).get();
        return snapshot.size;
    } catch (error) {
        console.error("❌ Error en getUnreadCount service:", error);
        return 0;
    }
};

export const markSalesAsRead = async () => {
    try {
        const snapshot = await db.collection('sales').where('isRead', '==', false).get();
        if (snapshot.empty) return;

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { 
                isRead: true, 
                updatedAt: admin.firestore.FieldValue.serverTimestamp() 
            });
        });

        await batch.commit();
        console.log(`✅ Marcadas ${snapshot.size} ventas como leídas`);
    } catch (error) {
        console.error("❌ Error en markSalesAsRead service:", error);
    }
};
