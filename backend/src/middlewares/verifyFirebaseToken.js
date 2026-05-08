import admin from "../firebase/admin.js";

export default async function verifyFirebaseToken(req, res, next) {
  const sessionCookie = req.cookies?.session || null;

  try {
    if (!sessionCookie) {
      if (req.accepts('html')) return res.redirect('/owner/login');
      return res.status(401).json({ error: 'No hay sesión activa' });
    }

    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    const ownerUid = process.env.OWNER_UID?.trim();
    const emailOk = decodedClaims.email === process.env.OWNER_EMAIL;
    const uidOk = !ownerUid || decodedClaims.uid === ownerUid;

    if (!emailOk || !uidOk) {
      console.error(`🚫 Acceso denegado: ${decodedClaims.email} (${decodedClaims.uid})`);
      res.clearCookie('session');
      if (req.accepts('html')) return res.status(403).send("<h1>403 - Acceso Prohibido</h1><p>No tienes permisos de administrador.</p>");
      return res.status(403).json({ error: 'No autorizado' });
    }

    req.user = decodedClaims;
    next();

  } catch (err) {
    console.error("❌ Error verificando sesión:", err.message);
    res.clearCookie('session');
    if (req.accepts('html')) return res.redirect('/owner/login');
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}