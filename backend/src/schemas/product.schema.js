import { z } from 'zod';

// 1. Definimos el sub-esquema para el mapa de características
const characteristicsSchema = z.object({
    Ancho: z.string().optional(),
    Alto: z.string().optional(), // Usé "Alto" en vez de "height" para consistencia en español
    Marca: z.string().min(1, "La marca es obligatoria"),
    Color: z.string().min(1, "El color es obligatorio"),
    Género: z.string().optional(),
    Tipo: z.string().optional(),
});

// 2. El esquema principal del producto
export const productSchema = z.object({
    name: z.string().min(3),
    price: z.coerce.number().positive(), // El coerce transforma "20610" en 20610
    stock: z.coerce.number().int().nonnegative(),
    category: z.string().min(1),
    characteristics: z.preprocess((val) => {
        try { return typeof val === 'string' ? JSON.parse(val) : val; }
        catch (e) { return val; }
    }, z.any())
});