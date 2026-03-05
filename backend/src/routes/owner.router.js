import { Router } from "express";
import admin from "../firebase/admin.js";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";
import { renderProducts, createProduct, createBulkProducts, deleteProduct, updateProduct } from "../controllers/product.controller.js";
import { renderUsers, createUser, updateUser, deleteUser, getUserById } from "../controllers/user.controller.js";
import { renderSales, createSale, updateSale, deleteSale, getSaleById, acceptSale, rejectSale } from "../controllers/sale.controller.js";
import { renderDashboard, getStats } from "../controllers/stats.controller.js";
import { getUsage } from "../controllers/usage.controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

// ── Login ──
router.get('/login', (req, res) => {
    if (req.cookies.session) return res.redirect('/owner');
    res.render('login', {
        titulo: 'Login Propietario',
        firebaseConfig: JSON.stringify({
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
        }),
    });
});

router.post('/session', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: 'Falta token' });

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.email !== process.env.OWNER_EMAIL) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
        res.cookie('session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: false });
        return res.json({ status: 'success' });
    } catch (err) {
        return res.status(401).json({ error: 'Auth error', details: err.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('session');
    res.json({ status: 'ok' });
});

// ── Dashboard ──
router.get('/', verifyFirebaseToken, renderDashboard);
router.get('/stats', verifyFirebaseToken, getStats);
router.get('/usage', verifyFirebaseToken, getUsage);

// ── Productos ──
router.post('/products', upload.array('images', 5), verifyFirebaseToken, createProduct);
router.post('/products/bulk', verifyFirebaseToken, createBulkProducts);
router.get('/products', verifyFirebaseToken, renderProducts);
router.delete('/products/:id', verifyFirebaseToken, deleteProduct);
router.put('/products/:id', upload.array('images', 5), verifyFirebaseToken, updateProduct);

// ── Usuarios ──
router.get('/users', verifyFirebaseToken, renderUsers);
router.post('/users', verifyFirebaseToken, createUser);
router.get('/users/:id', verifyFirebaseToken, getUserById);
router.put('/users/:id', verifyFirebaseToken, updateUser);
router.delete('/users/:id', verifyFirebaseToken, deleteUser);

// ── Ventas ──
router.get('/sales', verifyFirebaseToken, renderSales);
router.post('/sales', verifyFirebaseToken, createSale);
router.get('/sales/:id', verifyFirebaseToken, getSaleById);
router.put('/sales/:id', verifyFirebaseToken, updateSale);
router.delete('/sales/:id', verifyFirebaseToken, deleteSale);

// ✅ Aceptar / Rechazar desde el email (sin verifyFirebaseToken — se accede desde el email)
router.get('/sales/:id/accept', acceptSale);
router.get('/sales/:id/reject', rejectSale);

export default router;