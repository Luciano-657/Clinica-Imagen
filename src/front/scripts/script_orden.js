// Menu Hamburguesa
const header = document.getElementById("main-header");
const toggleBtn = document.getElementById("toggle-btn");
const closeBtn = document.getElementById("close-btn");
const overlay = document.getElementById("overlay");
const menuLinks = document.querySelectorAll("#main-nav a");

function openMenu() {
    header.classList.add("nav-open");
    overlay.classList.add("activo");
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll"); // también en <html>
}

function closeMenu() {
    header.classList.remove("nav-open");
    overlay.classList.remove("activo");
    document.body.classList.remove("no-scroll");
    document.documentElement.classList.remove("no-scroll");
}


toggleBtn.addEventListener("click", openMenu);
closeBtn.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);

menuLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
});


// ====== EFECTO SHRINK AL SCROLL ======
window.addEventListener("scroll", function() {
    if (window.scrollY > 50) {
        header.classList.add("shrink");
    } else {
        header.classList.remove("shrink");
    }
});

//Marcado de pagina de menu

const current = window.location.pathname.split("/").pop().toLowerCase();
const links = document.querySelectorAll("#main-nav a");

links.forEach(link => {
    const href = link.getAttribute("href").toLowerCase();
    if (href === current || (href === "index.html" && current === "")) {
    link.classList.add("active");
    }
});

//Marcado de pagina en footer

    window.addEventListener('DOMContentLoaded', () => {
        const currentPage = window.location.pathname.split('/').pop().split('.')[0];
        const links = document.querySelectorAll('.footer-link');

        links.forEach(link => {
            const page = link.dataset.page;
            if (page && page.toLowerCase() === currentPage.toLowerCase()) {
                link.classList.add('active');
            }
        });
    });

//Burbuja de whatsapp

document.getElementById("whatsapp-btn").addEventListener("click", function () {
    const phoneNumber = "598092745398";
    const message = "Hola, quiero agendar una cita.";
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
});

// Boton desplegable mobile

function toggleFooterSection(button) {
    const section = button.parentElement;
    const isActive = section.classList.contains("active");

  // Cerrar todas las demás
    document.querySelectorAll(".footer-section").forEach((s) => {
    s.classList.remove("active");
    });

  // Si no estaba activa, activarla
    if (!isActive) {
    section.classList.add("active");
    }
}

document.getElementById("form-orden").addEventListener("submit", async function(e) {
    e.preventDefault(); // Evita recargar la página

    const form = e.target;
    const formData = new FormData(form);
    const errorDiv = document.getElementById("formError"); // Un div donde mostramos errores

    errorDiv.textContent = ""; // Limpiar errores previos

    // Enviar formulario con fetch
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert("Orden ingresada correctamente");
            form.reset();
            if (typeof grecaptcha !== "undefined") grecaptcha.reset(); // Reinicia el captcha
        } else {
            // Mostrar mensaje de error sin recargar
            errorDiv.textContent = result.error || "Ocurrió un error, inténtalo de nuevo";
            if (typeof grecaptcha !== "undefined") grecaptcha.reset(); // Reinicia captcha si falló
        }
    } catch (err) {
        console.error(err);
        errorDiv.textContent = "Error de conexión, inténtalo nuevamente";
    }
});
