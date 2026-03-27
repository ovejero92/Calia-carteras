import { z } from 'zod';

const characteristicsSchema = z.object({
    Ancho: z.string().optional(),
    Alto: z.string().optional(), 
    Marca: z.string().min(1, "La marca es obligatoria"),
    Color: z.string().min(1, "El color es obligatorio"),
    Género: z.string().optional(),
    Tipo: z.string().optional(),
});

export const productSchema = z.object({
    name: z.string().min(3),
    price: z.coerce.number().positive(), 
    stock: z.coerce.number().int().nonnegative(),
    category: z.string().min(1),
    characteristics: z.preprocess((val) => {
        try { return typeof val === 'string' ? JSON.parse(val) : val; }
        catch (e) { return val; }
    }, z.any())
});