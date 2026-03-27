import cloudinary from "../config/cloudinary.js";
import { db } from "../firebase/admin.js";

const LIMITS = {
    cloudinary: {
        credits: 25,
        label: "Cloudinary · se resetea cada mes"
    },
    firestore: {
        storageMB: 1024,
        reads: 50000,
        writes: 20000,
        label: "Firestore · plan Spark gratuito"
    }
};

export const getUsage = async (req, res) => {
    try {
        let cloudinaryUsage = { photos: 0, credits: 25, creditsUsed: 0 };
        try {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'products/',
                max_results: 500
            });
            cloudinaryUsage.photos = result.resources.length;

            const usageResult = await cloudinary.api.usage();
            cloudinaryUsage.creditsUsed = usageResult.credits?.usage || 0;
            cloudinaryUsage.credits = usageResult.credits?.limit || 25;
        } catch (e) {
            console.error("⚠️ Error consultando Cloudinary:", e.message);
        }

        let firestoreUsage = { products: 0, users: 0, sales: 0, totalDocs: 0 };
        try {
            const [productsSnap, usersSnap, salesSnap] = await Promise.all([
                db.collection('products').count().get(),
                db.collection('users').count().get(),
                db.collection('sales').count().get(),
            ]);
            firestoreUsage.products = productsSnap.data().count;
            firestoreUsage.users    = usersSnap.data().count;
            firestoreUsage.sales    = salesSnap.data().count;
            firestoreUsage.totalDocs = firestoreUsage.products + firestoreUsage.users + firestoreUsage.sales;
        } catch (e) {
            console.error("⚠️ Error consultando Firestore counts:", e.message);
        }

        res.json({
            status: "success",
            data: {
                cloudinary: {
                    photos: cloudinaryUsage.photos,
                    creditsUsed: parseFloat(cloudinaryUsage.creditsUsed.toFixed(2)),
                    creditsLimit: cloudinaryUsage.credits,
                    percentUsed: Math.min(100, Math.round((cloudinaryUsage.creditsUsed / cloudinaryUsage.credits) * 100)),
                    label: LIMITS.cloudinary.label
                },
                firestore: {
                    products: firestoreUsage.products,
                    users: firestoreUsage.users,
                    sales: firestoreUsage.sales,
                    totalDocs: firestoreUsage.totalDocs,
                    docsLimit: 1000000,
                    percentDocs: Math.min(100, Math.round((firestoreUsage.totalDocs / 1000000) * 100)),
                    readsLimit: LIMITS.firestore.reads,
                    writesLimit: LIMITS.firestore.writes,
                    label: LIMITS.firestore.label
                }
            }
        });

    } catch (error) {
        console.error("❌ Error en getUsage:", error);
        res.status(500).json({ error: error.message });
    }
};