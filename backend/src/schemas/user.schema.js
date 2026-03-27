import { z } from 'zod';

export const userSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(['cliente', 'admin'], { errorMap: () => ({ message: "Rol debe ser 'cliente' o 'admin'" }) }),
    status: z.enum(['activo', 'inactivo'], { errorMap: () => ({ message: "Estado debe ser 'activo' o 'inactivo'" }) }).default('activo'),
    notes: z.string().optional()
});

export const userSearchSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.enum(['cliente', 'admin']).optional(),
    status: z.enum(['activo', 'inactivo']).optional()
});
