import admin from "../firebase/admin.js";

export default async function verifyFirebaseToken(req, res, next) {
  const sessionCookie = req.cookies?.session || null;

  try {
    if (!sessionCookie) {
      // Si no hay cookie y quiere ver HTML, al login. Si es una petición de datos, error 401.
      if (req.accepts('html')) return res.redirect('/owner/login');
      return res.status(401).json({ error: 'No hay sesión activa' });
    }

    // 1. Verificar la cookie de sesión
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    
    // 2. SEGURIDAD: Solo permitir si el email es el del dueño
    // Asegúrate de tener OWNER_EMAIL=tu_email@gmail.com en tu .env
    if (decodedClaims.email !== process.env.OWNER_EMAIL) {
      console.error(`🚫 Acceso denegado para: ${decodedClaims.email}`);
      res.clearCookie('session');
      return res.status(403).send("<h1>403 - Acceso Prohibido</h1><p>No tienes permisos de administrador.</p>");
    }

    // 3. Si todo está bien, guardamos el usuario en el objeto request
    req.user = decodedClaims;
    next();

  } catch (err) {
    console.error("❌ Error verificando sesión:", err.message);
    res.clearCookie('session');
    if (req.accepts('html')) return res.redirect('/owner/login');
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}