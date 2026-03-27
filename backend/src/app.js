import express from "express"
import "dotenv/config"
import usersRouter from "./routes/users.router.js";
import ownerRouter from "./routes/owner.router.js";
import publicRouter from "./routes/public.router.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import handlebars from "express-handlebars"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.use(express.json())
app.use(cookieParser())


app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        json: function (context) {
            return JSON.stringify(context);
        },
        eq: function (a, b) {
            return a === b;
        },
        gt: function (a, b) {
            return a > b;
        },
        gte: function (a, b) {
            return a >= b;
        },
        formatDate: function (date) {
            if (!date) return '-';
            const d = new Date(date);
            return d.toLocaleDateString('es-AR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        percent: function (value, total) {
            if (!total || total === 0 || !value) return 0;
            return Math.round((parseFloat(value) / parseFloat(total)) * 100);
        },
        formatCurrency: function (value) {
            if (!value) return '0.00';
            return parseFloat(value).toFixed(2);
        },
        formatNumber: function (value) {
            if (!value && value !== 0) return '0';
            return parseFloat(value).toLocaleString('es-AR');
        },
        default: function (value, defaultValue) {
            return value || defaultValue || '-';
        }
    }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars')

app.use(cors({
    origin: function (origin, callback) {
        const allowed = [
            'http://localhost:5173',
            'http://localhost:3001',
            'https://calia-carteras.vercel.app',
            'https://calia-carteras-production.up.railway.app',
            process.env.FRONTEND_URL
        ];
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(['/users', '/usuarios'], usersRouter)
app.use('/owner', ownerRouter)
app.use('/api', publicRouter) // Rutas públicas para el frontend

app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/', (req, res) => res.redirect('/owner/login'));

app.use((req, res) => {
    res.status(404).json({ error: "ruta no encontrada" })
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`http://localhost:${PORT}`))