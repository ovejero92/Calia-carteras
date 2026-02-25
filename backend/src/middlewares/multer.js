import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Definir dónde se guardan las fotos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/uploads/products';
        // Si la carpeta no existe, la crea
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Le ponemos un nombre único: timestamp-nombreoriginal
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

// 2. Exportar el middleware
export const upload = multer({ storage });