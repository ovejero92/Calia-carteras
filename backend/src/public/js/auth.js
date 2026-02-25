// No pongas "import" aquí, ya que usas los scripts del CDN en el HTML
const app = firebase.initializeApp(window.firebaseConfig);
const auth = firebase.auth();

const form = document.getElementById('login-form');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    msg.textContent = 'Entrando...';

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const idToken = await userCredential.user.getIdToken();
        
        // Enviamos el token al servidor para crear la cookie de sesión
        const res = await fetch('/owner/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        if (!res.ok) throw new Error('Error al crear sesión en el servidor');
        
        // Si todo sale bien, vamos al dashboard
        window.location.href = '/owner'; 
    } catch (err) {
        msg.textContent = 'Error: ' + err.message;
        console.error(err);
    }
});