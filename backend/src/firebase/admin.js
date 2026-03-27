import admin from "firebase-admin";

let serviceAccount;
let firebaseInitialized = false;

try {
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
  serviceAccount = JSON.parse(envKey);
  serviceAccount.private_key = serviceAccount.private_key
    .replace(/\\n/g, '\n')
    .replace(/^'|'$/g, '');
  }
} catch (error) {
  console.warn("⚠️ Firebase no configurado:", error.message);
  console.warn("🚀 Usando modo MOCK - Solo para testing");
}

if (serviceAccount && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    firebaseInitialized = true;
    console.log("🚀 Firebase Admin conectado con éxito");
  } catch (error) {
    console.error("❌ Error inicializando Firebase:", error.message);
    console.warn("🚀 Continuando en modo MOCK");
  }
} else {
  console.warn("🚀 Firebase no configurado - Modo MOCK activado");
}

export const db = firebaseInitialized ? admin.firestore() : null;
export const auth = firebaseInitialized ? admin.auth() : null;
export default admin;