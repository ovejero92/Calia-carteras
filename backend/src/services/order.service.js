import { db } from "../firebase/admin.js";
import admin from "../firebase/admin.js";
import { orderEvents } from "./order.events.js";
import "./order.listeners.js";

const COLLECTION = "sales";

export const ORDER_LIFECYCLE = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
};

const ALL_LIFECYCLES = new Set(Object.values(ORDER_LIFECYCLE));

export function deriveLegacyStatusFromLifecycle(lifecycle) {
    if (lifecycle === ORDER_LIFECYCLE.DELIVERED) return "completada";
    if (lifecycle === ORDER_LIFECYCLE.CANCELLED) return "cancelada";
    return "pendiente";
}

export function lifecycleFromLegacyStatus(status) {
    if (status === "completada") return ORDER_LIFECYCLE.DELIVERED;
    if (status === "cancelada") return ORDER_LIFECYCLE.CANCELLED;
    return ORDER_LIFECYCLE.PENDING;
}

function inferLifecycle(data) {
    if (data.orderLifecycle && ALL_LIFECYCLES.has(data.orderLifecycle)) return data.orderLifecycle;
    return lifecycleFromLegacyStatus(data.status || "pendiente");
}

function tsToDate(v) {
    if (!v) return new Date();
    if (v.toDate) return v.toDate();
    if (v instanceof Date) return v;
    return new Date(v);
}

export function normalizeOrderDoc(id, data) {
    if (!data) return null;
    const orderLifecycle = inferLifecycle(data);
    const status = data.status || deriveLegacyStatusFromLifecycle(orderLifecycle);
    return {
        id,
        ...data,
        orderLifecycle,
        status,
        createdAt: tsToDate(data.createdAt),
        updatedAt: tsToDate(data.updatedAt),
        statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
    };
}

async function readOrderRaw(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return normalizeOrderDoc(doc.id, doc.data());
}

function historyEntry({ orderLifecycle, status, source, note, estimatedDelivery }) {
    return {
        at: admin.firestore.FieldValue.serverTimestamp(),
        orderLifecycle,
        status,
        source: source || "system",
        note: note || null,
        estimatedDelivery: estimatedDelivery || null,
    };
}

async function generateSaleNumber() {
    try {
        const year = new Date().getFullYear();
        const snapshot = await db.collection(COLLECTION)
            .where("saleNumber", ">=", `V${year}0000`)
            .where("saleNumber", "<=", `V${year}9999`)
            .orderBy("saleNumber", "desc")
            .limit(1)
            .get();

        if (snapshot.empty) return `V${year}0001`;
        const lastNumber = snapshot.docs[0].data().saleNumber;
        const num = parseInt(lastNumber.substring(5), 10) + 1;
        return `V${year}${num.toString().padStart(4, "0")}`;
    } catch {
        return `V${Date.now()}`;
    }
}

function log(msg, extra = {}) {
    console.log(`[order.service] ${msg}`, Object.keys(extra).length ? extra : "");
}

/**
 * Crear pedido: validación de stock; descuenta solo si queda en completada/delivered.
 */
export async function createOrder(saleData, { source = "api" } = {}) {
    const saleNumber = await generateSaleNumber();
    const inputLifecycle = saleData.orderLifecycle;
    const orderLifecycle = inputLifecycle && ALL_LIFECYCLES.has(inputLifecycle)
        ? inputLifecycle
        : lifecycleFromLegacyStatus(saleData.status || "pendiente");
    const status = deriveLegacyStatusFromLifecycle(orderLifecycle);

    const emailNorm = saleData.userEmail ? String(saleData.userEmail).trim().toLowerCase() : null;

    const basePayload = {
        ...saleData,
        status,
        orderLifecycle,
        saleNumber,
        statusHistory: [],
        isRead: saleData.isRead === undefined ? false : saleData.isRead,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        ...(emailNorm ? { userEmailLower: emailNorm } : {}),
    };

    const shippingFee = Number(saleData.shippingFee ?? 0) || 0;

    const saleId = await db.runTransaction(async (tx) => {
        let computedItemsTotal = 0;
        const normalizedLines = [];

        for (const item of saleData.items) {
            const pref = db.collection("products").doc(item.productId);
            const psnap = await tx.get(pref);
            if (!psnap.exists) {
                throw new Error(`Producto ${item.productName} no encontrado`);
            }
            const pdata = psnap.data();
            const stock = pdata.stock ?? 0;
            if (stock < item.quantity) {
                throw new Error(`Stock insuficiente para ${item.productName}. Stock disponible: ${stock}`);
            }

            const listPrice = Number(pdata.price) || 0;
            const discountPct = Number(pdata.discount) || 0;
            const unit = discountPct > 0 ? listPrice * (1 - discountPct / 100) : listPrice;
            const subtotal = Math.round(unit * item.quantity * 100) / 100;
            computedItemsTotal += subtotal;
            normalizedLines.push({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: Math.round(unit * 100) / 100,
                subtotal,
            });
        }

        const roundedItems = Math.round(computedItemsTotal * 100) / 100;
        const expectedTotal = Math.round((roundedItems + shippingFee) * 100) / 100;
        const clientTotal = Number(saleData.total);
        if (!Number.isFinite(clientTotal) || Math.abs(clientTotal - expectedTotal) > 0.05) {
            throw new Error(
                `Total del pedido no coincide con los precios actuales (esperado ${expectedTotal.toFixed(2)}). Actualizá el carrito e intentá de nuevo.`
            );
        }

        const saleRef = db.collection(COLLECTION).doc();
        const hist = historyEntry({
            orderLifecycle,
            status,
            source,
            note: "order_created",
        });
        const payload = {
            ...basePayload,
            items: normalizedLines,
            total: expectedTotal,
            shippingFee,
            statusHistory: [hist],
        };
        tx.set(saleRef, payload);

        if (status === "completada") {
            for (const item of saleData.items) {
                const pref = db.collection("products").doc(item.productId);
                tx.update(pref, { stock: admin.firestore.FieldValue.increment(-item.quantity) });
            }
        }

        return saleRef.id;
    });

    log("createOrder", { id: saleId, orderLifecycle, status, source });
    const order = await readOrderRaw(saleId);
    orderEvents.emit("order:created", { order, source });
    return order;
}

function computeNextState(before, patch) {
    if (patch.orderLifecycle && ALL_LIFECYCLES.has(patch.orderLifecycle)) {
        const nextLifecycle = patch.orderLifecycle;
        const nextStatus = deriveLegacyStatusFromLifecycle(nextLifecycle);
        return { nextLifecycle, nextStatus };
    }
    if (patch.status && ["pendiente", "completada", "cancelada"].includes(patch.status)) {
        const nextLifecycle = lifecycleFromLegacyStatus(patch.status);
        const nextStatus = deriveLegacyStatusFromLifecycle(nextLifecycle);
        return { nextLifecycle, nextStatus };
    }
    return { nextLifecycle: before.orderLifecycle, nextStatus: before.status };
}

/**
 * Actualizar pedido con transacción segura de stock al pasar a delivered / revertir.
 */
export async function updateOrder(id, patch, { source = "admin", notifyClientAccept = false } = {}) {
    const metaOnly =
        !patch.status &&
        !patch.orderLifecycle &&
        (patch.isRead !== undefined || patch.notes !== undefined || patch.estimatedDelivery !== undefined || patch.paymentMethod !== undefined);

    if (metaOnly) {
        const ref = db.collection(COLLECTION).doc(id);
        const clean = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
        if (patch.isRead !== undefined) clean.isRead = patch.isRead;
        if (patch.notes !== undefined) clean.notes = patch.notes;
        if (patch.estimatedDelivery !== undefined) clean.estimatedDelivery = patch.estimatedDelivery;
        if (patch.paymentMethod !== undefined) clean.paymentMethod = patch.paymentMethod;
        await ref.update(clean);
        log("updateOrder_meta", { id, keys: Object.keys(clean) });
        return true;
    }

    let beforeSnap;
    let afterOrder;

    await db.runTransaction(async (tx) => {
        const ref = db.collection(COLLECTION).doc(id);
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error("Venta no encontrada");
        const raw = snap.data();
        beforeSnap = normalizeOrderDoc(id, raw);

        const { nextLifecycle, nextStatus } = computeNextState(beforeSnap, patch);

        const wasCompleted = beforeSnap.status === "completada";
        const willComplete = nextStatus === "completada";

        if (!wasCompleted && willComplete) {
            for (const item of beforeSnap.items) {
                const pref = db.collection("products").doc(item.productId);
                const psnap = await tx.get(pref);
                if (!psnap.exists) throw new Error(`Producto ${item.productName} no encontrado`);
                const stock = psnap.data().stock ?? 0;
                if (stock < item.quantity) {
                    throw new Error(`Stock insuficiente para ${item.productName}`);
                }
            }
        }

        if (wasCompleted && !willComplete) {
            for (const item of beforeSnap.items) {
                const pref = db.collection("products").doc(item.productId);
                tx.update(pref, { stock: admin.firestore.FieldValue.increment(item.quantity) });
            }
        }

        if (!wasCompleted && willComplete) {
            for (const item of beforeSnap.items) {
                const pref = db.collection("products").doc(item.productId);
                tx.update(pref, { stock: admin.firestore.FieldValue.increment(-item.quantity) });
            }
        }

        const prevHist = Array.isArray(raw.statusHistory) ? raw.statusHistory : [];
        const hist = historyEntry({
            orderLifecycle: nextLifecycle,
            status: nextStatus,
            source,
            note: patch.note || null,
            estimatedDelivery: patch.estimatedDelivery,
        });

        const updatePayload = {
            status: nextStatus,
            orderLifecycle: nextLifecycle,
            statusHistory: [...prevHist, hist],
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (patch.notes !== undefined) updatePayload.notes = patch.notes;
        if (patch.estimatedDelivery !== undefined) updatePayload.estimatedDelivery = patch.estimatedDelivery;
        if (patch.paymentMethod !== undefined) updatePayload.paymentMethod = patch.paymentMethod;

        tx.update(ref, updatePayload);
    });

    afterOrder = await readOrderRaw(id);
    const prevLc = beforeSnap.orderLifecycle;
    const nextLc = afterOrder.orderLifecycle;
    if (prevLc !== nextLc) {
        orderEvents.emit("order:lifecycle_changed", {
            before: beforeSnap,
            after: afterOrder,
            meta: { source, estimatedDelivery: patch.estimatedDelivery, notifyClientAccept },
        });
    }

    log("updateOrder", { id, prevLifecycle: prevLc, nextLifecycle: nextLc, source });
    return true;
}

export async function deleteOrder(id) {
    const before = await readOrderRaw(id);
    if (!before) throw new Error("Venta no encontrada");

    await db.runTransaction(async (tx) => {
        const ref = db.collection(COLLECTION).doc(id);
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error("Venta no encontrada");
        const data = snap.data();
        if (data.status === "completada") {
            const items = data.items || [];
            for (const item of items) {
                const pref = db.collection("products").doc(item.productId);
                tx.update(pref, { stock: admin.firestore.FieldValue.increment(item.quantity) });
            }
        }
        tx.delete(ref);
    });

    log("deleteOrder", { id });
    return true;
}

export async function getOrderById(id) {
    return readOrderRaw(id);
}
