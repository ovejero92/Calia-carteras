const app  = firebase.initializeApp(window.firebaseConfig);
    const auth = firebase.auth();

    const form    = document.getElementById('login-form');
    const msg     = document.getElementById('msg');
    const btn     = document.getElementById('btn-submit');
    const btnText = document.getElementById('btn-text');

    const setMsg = (text, type) => {
        msg.textContent = text;
        msg.className = type;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        btn.disabled = true;
        btnText.textContent = 'Verificando...';
        setMsg('', '');

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const idToken = await userCredential.user.getIdToken();

            const res = await fetch('/owner/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (!res.ok) throw new Error('Error al crear sesión en el servidor');

            setMsg('Bienvenida ✓', 'success');
            btnText.textContent = 'Redirigiendo...';
            setTimeout(() => { window.location.href = '/owner'; }, 600);

        } catch (err) {
            btn.disabled = false;
            btnText.textContent = 'Ingresar';

            const errorMap = {
                'auth/user-not-found':    'No existe una cuenta con ese email',
                'auth/wrong-password':    'Contraseña incorrecta',
                'auth/invalid-email':     'El email no es válido',
                'auth/too-many-requests': 'Demasiados intentos. Intentá más tarde',
                'auth/invalid-credential':'Email o contraseña incorrectos',
            };

            setMsg(errorMap[err.code] || 'Error al iniciar sesión', 'error');
            console.error(err);
        }
    });
