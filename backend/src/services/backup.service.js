import admin from "../firebase/admin.js";
import { db } from "../firebase/admin.js";
import * as productService from "./product.service.js";

function csvEscape(value) {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

async function buildSalesCsv() {
    if (!db) throw new Error("Firestore no disponible");
    const snapshot = await db.collection("sales").limit(5000).get();
    const header = ["id", "saleNumber", "createdAt", "userName", "userEmail", "status", "orderLifecycle", "total", "paymentMethod", "userAddress"];
    const rows = [header.join(",")];
    snapshot.docs.forEach((doc) => {
        const s = doc.data();
        const created = s.createdAt?.toDate ? s.createdAt.toDate().toISOString() : "";
        rows.push(
            [
                doc.id,
                s.saleNumber,
                created,
                s.userName,
                s.userEmail,
                s.status,
                s.orderLifecycle,
                s.total,
                s.paymentMethod,
                s.userAddress,
            ]
                .map(csvEscape)
                .join(",")
        );
    });
    return rows.join("\n");
}

async function buildStockCsv() {
    const products = await productService.getProducts();
    const header = ["id", "name", "stock", "price", "category"];
    const rows = [header.join(",")];
    for (const p of products) {
        rows.push([p.id, p.name, p.stock ?? 0, p.price ?? 0, p.category].map(csvEscape).join(","));
    }
    return rows.join("\n");
}

/**
 * Sube CSV de ventas y stock a Firebase Storage (bucket configurado en Admin SDK).
 */
export async function runBackupToStorage() {
    if (!db) {
        throw new Error("Firestore no disponible — backup omitido");
    }
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        throw new Error("Falta FIREBASE_STORAGE_BUCKET para backup en Storage");
    }

    const salesCsv = await buildSalesCsv();
    const stockCsv = await buildStockCsv();

    const prefix = (process.env.BACKUP_STORAGE_PREFIX || "backups/calia").replace(/\/$/, "");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    const bucket = admin.storage().bucket(bucketName);
    const salesPath = `${prefix}/ventas-${stamp}.csv`;
    const stockPath = `${prefix}/stock-${stamp}.csv`;

    await bucket.file(salesPath).save(Buffer.from(salesCsv, "utf8"), {
        contentType: "text/csv; charset=utf-8",
        resumable: false,
        metadata: { cacheControl: "no-cache" },
    });

    await bucket.file(stockPath).save(Buffer.from(stockCsv, "utf8"), {
        contentType: "text/csv; charset=utf-8",
        resumable: false,
        metadata: { cacheControl: "no-cache" },
    });

    return {
        bucket: bucketName,
        files: [salesPath, stockPath],
        at: new Date().toISOString(),
    };
}
