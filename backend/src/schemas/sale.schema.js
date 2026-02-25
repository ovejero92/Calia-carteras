import { z } from 'zod';

// Esquema para un item de venta
const saleItemSchema = z.object({
    productId: z.string().min(1, "ID del producto es requerido"),
    productName: z.string().min(1, "Nombre del producto es requerido"),
    quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
    price: z.coerce.number().positive("El precio debe ser mayor a 0"),
    subtotal: z.coerce.number().positive("El subtotal debe ser mayor a 0")
});

// Esquema principal de venta
export const saleSchema = z.object({
    userId: z.string().optional(), // Cliente puede ser anónimo
    userName: z.string().min(2, "Nombre del cliente es requerido"),
    userEmail: z.string().email("Email inválido").optional(),
    userPhone: z.string().optional(),
    items: z.array(saleItemSchema).min(1, "Debe haber al menos un producto en la venta"),
    total: z.coerce.number().positive("El total debe ser mayor a 0"),
    paymentMethod: z.enum(['efectivo', 'transferencia', 'tarjeta', 'otro'], {
        errorMap: () => ({ message: "Método de pago inválido" })
    }),
    status: z.enum(['pendiente', 'completada', 'cancelada'], {
        errorMap: () => ({ message: "Estado inválido" })
    }).default('completada'),
    notes: z.string().optional()
});

// Esquema para filtrar ventas
export const saleFilterSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['pendiente', 'completada', 'cancelada']).optional(),
    paymentMethod: z.enum(['efectivo', 'transferencia', 'tarjeta', 'otro']).optional(),
    userId: z.string().optional()
});
