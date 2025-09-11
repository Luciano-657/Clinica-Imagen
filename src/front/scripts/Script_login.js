// -----------------
// Cambio de paneles
// -----------------
const registerButton = document.getElementById("register");
const loginButton = document.getElementById("login");
const container = document.getElementById("container");

registerButton?.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});
loginButton?.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

const mobileRegister = document.getElementById("show-register");
const mobileBack = document.getElementById("back-to-login");

mobileRegister?.addEventListener("click", () => {
    container.classList.add("mobile-register-active");
});
mobileBack?.addEventListener("click", () => {
    container.classList.remove("mobile-register-active");
});

// -----------------
// Mostrar/Ocultar contraseña
// -----------------
document.querySelectorAll('.password-container').forEach(container => {
    const input = container.querySelector('input[type="password"], input[type="text"]');
    const btn = container.querySelector('.toggle-pass');
    const icon = btn.querySelector('i');

    btn.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

// -----------------
// Mensajes
// -----------------
const mensajeDiv = document.getElementById('mensaje');
let mensajeTimeout;

function mostrarMensaje(texto, tipo='info', duracion=3000) {
    if (!mensajeDiv) return;
    mensajeDiv.innerText = texto;
    mensajeDiv.className = 'mensaje ' + tipo;
    mensajeDiv.style.opacity = '1';
    clearTimeout(mensajeTimeout);

    mensajeTimeout = setTimeout(() => {
        mensajeDiv.style.opacity = '0';
    }, duracion);
}

// -----------------
// LOGIN
// -----------------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-pass").value.trim();

    if (!email || !password) {
        mostrarMensaje('Faltan datos', 'error');
        return;
    }

    try {
        // Ruta relativa correcta al login.php
        const response = await fetch("../../back/auth/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success && result.user) {
            mostrarMensaje(`¡Hola, ${result.user.nombre}! Bienvenido 👋`, 'exito', 1500);

            // Redirigir según rol
            setTimeout(() => {
                switch(result.user.rol) {
                    case 'admin':
                        window.location.href = "../panels/admin.php";
                        break;
                    case 'recepcionista':
                        window.location.href = "../panels/recepcionista.php";
                        break;
                    case 'paciente':
                        window.location.href = "../panels/paciente.php";
                        break;
                    default:
                        window.location.href = "../pages/index.html";
                }
            }, 1500);

        } else {
            mostrarMensaje(result.error || 'Correo o contraseña incorrectos', 'error', 3000);
        }

    } catch (error) {
        console.error("Error en el fetch:", error);
        mostrarMensaje("Error de conexión con el servidor", 'error', 3000);
    }
});

// -----------------
// REGISTRO
// -----------------
const registerForm = document.getElementById('registerForm');
registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-pass').value.trim();

    if (!nombre || !email || !password) {
        mostrarMensaje('Faltan datos para registrarse', 'error');
        return;
    }

    try {
        const response = await fetch("../../back/auth/register.php", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();

        if (data.success) {
            mostrarMensaje(`¡Hola, ${nombre}! Tu cuenta fue creada. Bienvenido 🎉`, 'exito', 1500);

            // Autollenar login con los datos recién registrados
            setTimeout(() => {
                document.getElementById('login-email').value = email;
                document.getElementById('login-pass').value = password;

                container.classList.remove("right-panel-active");
                container.classList.remove("mobile-register-active");
            }, 1500);

        } else {
            mostrarMensaje(data.error || 'Error al registrar', 'error', 3000);
        }
    } catch (err) {
        console.error(err);
        mostrarMensaje('Error de conexión', 'error', 3000);
    }
});
