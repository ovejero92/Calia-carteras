# Configuración de Firebase para el Backend

## Problema Actual
El frontend no puede conectarse al backend porque faltan las variables de entorno de Firebase configuradas.

## Solución: Configurar Firebase

### Paso 1: Crear/Configurar proyecto de Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Firestore Database y Authentication

### Paso 2: Obtener las credenciales
Necesitas estas variables de entorno en un archivo `.env` en la carpeta `backend/`:

```env
# Puerto del servidor
PORT=3001

# Email del propietario/administrador (tu email)
OWNER_EMAIL=tu-email@ejemplo.com

# Configuración de Firebase (desde Configuración del proyecto > General)
FIREBASE_API_KEY=tu_api_key_aqui
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Service Account Key (JSON completo como una sola línea)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"tu-proyecto",...}
```

### Paso 3: Cómo obtener cada valor

#### Variables de configuración web:
1. En Firebase Console → Configuración del proyecto → General
2. Desplázate hasta "Tus apps"
3. Si no tienes una app web: haz clic en "</>" para crear una
4. Copia los valores del SDK de configuración

#### Service Account Key:
1. En Firebase Console → Configuración del proyecto → Cuentas de servicio
2. Haz clic en "Generar nueva clave privada"
3. Se descargará un archivo JSON
4. **IMPORTANTE**: Abre el archivo JSON y copia TODO su contenido
5. Pégalo como una sola línea en la variable `FIREBASE_SERVICE_ACCOUNT_KEY`

### Paso 4: Crear el archivo .env
1. Crea un archivo llamado `.env` en la carpeta `backend/`
2. Copia el contenido de arriba y completa con tus valores reales
3. Reinicia el servidor backend

### Paso 5: Crear las colecciones en Firestore
Una vez configurado Firebase, necesitas crear estas colecciones vacías en Firestore:
- `products` (ya existe)
- `users` (crear colección vacía)
- `sales` (crear colección vacía)

## Verificación
Después de configurar todo:
1. Reinicia el backend: `npm start` en la carpeta backend
2. El frontend debería poder conectarse y mostrar productos

## Solución Temporal (para testing)
Si quieres probar rápidamente sin configurar Firebase completo, puedes:
1. Comentar las líneas que usan Firebase en los servicios
2. Crear datos mock en memoria
3. Pero eventualmente necesitarás Firebase para persistencia real