# Colecciones de Firestore - Sistema de Gestión de Carteras

Este documento explica qué colecciones necesitas crear en Firestore y cómo estructurar los datos.

## 📋 Colecciones Necesarias

Necesitas crear **3 colecciones** en Firestore:

1. **`products`** - Para productos/carteras (ya la tienes ✅)
2. **`users`** - Para clientes y usuarios del sistema
3. **`sales`** - Para ventas/órdenes

---

## 1. Colección: `products` ✅ (Ya existe)

### Estructura de un documento de producto:

```json
{
  "name": "Cartera Elegante Negra",
  "price": 25000,
  "stock": 10,
  "category": "cartera",
  "image": "/uploads/products/1766181268588-Bandolera.webp",
  "characteristics": {
    "Ancho": "27 cm",
    "Alto": "18 cm",
    "Marca": "Amphora",
    "Color": "Negro",
    "Género": "Mujer",
    "Tipo": "Cartera"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Campos:
- `name` (string): Nombre del producto
- `price` (number): Precio en pesos
- `stock` (number): Cantidad disponible
- `category` (string): Categoría (ej: "cartera", "accesorio")
- `image` (string): Ruta de la imagen
- `characteristics` (object): Características del producto
- `createdAt` (timestamp): Fecha de creación

---

## 2. Colección: `users` ⚠️ (Necesitas crearla)

### Cómo crear la colección:

1. Ve a Firebase Console → Firestore Database
2. Haz clic en "Start collection" o "+"
3. Nombre de la colección: `users`
4. **NO necesitas crear documentos manualmente** - se crean automáticamente cuando agregues usuarios desde el panel

### Estructura de un documento de usuario:

```json
{
  "name": "María González",
  "email": "maria@email.com",
  "phone": "+54 11 1234-5678",
  "address": "Av. Corrientes 1234, CABA",
  "role": "cliente",
  "status": "activo",
  "notes": "Cliente frecuente",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Campos:
- `name` (string): Nombre completo del cliente
- `email` (string): Email único del cliente
- `phone` (string, opcional): Teléfono
- `address` (string, opcional): Dirección
- `role` (string): "cliente" o "admin"
- `status` (string): "activo" o "inactivo"
- `notes` (string, opcional): Notas adicionales
- `createdAt` (timestamp): Fecha de creación
- `updatedAt` (timestamp): Fecha de última actualización

### Ejemplo de documento para crear manualmente (opcional):

Si quieres crear un usuario de prueba manualmente:

**Documento ID:** (Dejar automático o usar un ID personalizado)
```json
{
  "name": "Cliente de Prueba",
  "email": "cliente@test.com",
  "phone": "+54 11 1111-1111",
  "role": "cliente",
  "status": "activo",
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

---

## 3. Colección: `sales` ⚠️ (Necesitas crearla)

### Cómo crear la colección:

1. Ve a Firebase Console → Firestore Database
2. Haz clic en "Start collection" o "+"
3. Nombre de la colección: `sales`
4. **NO necesitas crear documentos manualmente** - se crean automáticamente cuando hagas una venta desde el panel

### Estructura de un documento de venta:

```json
{
  "saleNumber": "V20240001",
  "userId": "abc123xyz",  // ID del usuario (opcional si es venta anónima)
  "userName": "María González",
  "userEmail": "maria@email.com",
  "userPhone": "+54 11 1234-5678",
  "items": [
    {
      "productId": "producto_id_123",
      "productName": "Cartera Elegante Negra",
      "quantity": 2,
      "price": 25000,
      "subtotal": 50000
    },
    {
      "productId": "producto_id_456",
      "productName": "Bolso de Cuero",
      "quantity": 1,
      "price": 35000,
      "subtotal": 35000
    }
  ],
  "total": 85000,
  "paymentMethod": "efectivo",
  "status": "completada",
  "notes": "Venta en local",
  "createdAt": "2024-01-20T14:30:00Z",
  "updatedAt": "2024-01-20T14:30:00Z"
}
```

### Campos:
- `saleNumber` (string): Número único de venta (formato: V2024XXXX)
- `userId` (string, opcional): ID del usuario/cliente
- `userName` (string): Nombre del cliente
- `userEmail` (string, opcional): Email del cliente
- `userPhone` (string, opcional): Teléfono del cliente
- `items` (array): Array de productos vendidos
  - `productId` (string): ID del producto
  - `productName` (string): Nombre del producto
  - `quantity` (number): Cantidad vendida
  - `price` (number): Precio unitario
  - `subtotal` (number): Precio total del item (quantity × price)
- `total` (number): Total de la venta
- `paymentMethod` (string): "efectivo", "transferencia", "tarjeta", "otro"
- `status` (string): "pendiente", "completada", "cancelada"
- `notes` (string, opcional): Notas adicionales
- `createdAt` (timestamp): Fecha de creación
- `updatedAt` (timestamp): Fecha de última actualización

### Ejemplo de documento para crear manualmente (opcional):

Si quieres crear una venta de prueba manualmente:

**Documento ID:** (Dejar automático)
```json
{
  "saleNumber": "V20240001",
  "userName": "Cliente de Prueba",
  "userEmail": "cliente@test.com",
  "items": [
    {
      "productId": "tu_producto_id_aqui",
      "productName": "Cartera Elegante Negra",
      "quantity": 1,
      "price": 25000,
      "subtotal": 25000
    }
  ],
  "total": 25000,
  "paymentMethod": "efectivo",
  "status": "completada",
  "createdAt": "2024-01-20T12:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

---

## 📝 Notas Importantes

### ✅ No necesitas crear documentos manualmente

El sistema crea automáticamente los documentos cuando:
- **Usuarios**: Se crean desde el panel de administración (`/owner/users`)
- **Ventas**: Se crean desde el panel de ventas (`/owner/sales`)

### 🔥 Solo necesitas crear las colecciones vacías

1. Ve a Firebase Console
2. Firestore Database
3. Crea dos colecciones nuevas (si no existen):
   - `users` (colección vacía)
   - `sales` (colección vacía)

### ⚠️ Índices de Firestore

**NO necesitas crear índices manualmente** - El código está optimizado para evitar requerir índices compuestos. Las consultas se hacen de forma simple y el filtrado se hace en memoria cuando es necesario.

Si Firebase te pide crear un índice, puedes ignorarlo porque el código ya maneja esos casos con valores por defecto.

---

## 🚀 Pasos Rápidos

1. Abre Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto
3. Ve a **Firestore Database**
4. Haz clic en **"Start collection"** o el botón **"+"**
5. Crea estas dos colecciones (vacías):
   - Nombre: `users` → Clic en "Next" → "Save" (sin documentos)
   - Nombre: `sales` → Clic en "Next" → "Save" (sin documentos)

¡Listo! Ya puedes usar el sistema completo. Los documentos se crearán automáticamente cuando uses las funcionalidades del panel.
