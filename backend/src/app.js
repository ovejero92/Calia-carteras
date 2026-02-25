import express from "express"
import "dotenv/config"
import usersRouter from "./routes/users.router.js";
import ownerRouter from "./routes/owner.router.js";
import publicRouter from "./routes/public.router.js";
// import productsRouter from "./routes/products.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
// import swaggerUi from "swagger-ui-express";
// import { swaggerSpec } from "./docs/swagger.js";
import handlebars from "express-handlebars"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")));


// Seteando la handlebar para nuestro proyecto
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, 'views/partials'), // ESTA LÍNEA ES CLAVE
    helpers: {
        json: function (context) {
            return JSON.stringify(context);
        },
        eq: function (a, b) {
            return a === b;
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

app.use(cors())

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
// app.use((req,res,next) => {res.json({msj:"en mantenimiento"})})
// app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(['/users','/usuarios'],usersRouter)
app.use('/owner', ownerRouter)
app.use('/api', publicRouter) // Rutas públicas para el frontend
// app.use(['/products','/productos'], productsRouter)

app.get('/', (req, res) => res.redirect('/owner/login'));


app.use((req,res) => {
    res.status(404).json({error:"ruta no encontrada"})
})


const PORT = process.env.PORT || 3001
app.listen(PORT,()=>console.log(`http://localhost:${PORT}`))

// export default app;