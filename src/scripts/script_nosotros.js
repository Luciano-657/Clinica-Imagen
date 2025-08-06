//Menu Hamburguesa

const header = document.getElementById("main-header");
const toggleBtn = document.getElementById("toggle-btn");
const closeBtn = document.getElementById("close-btn");
const overlay = document.getElementById("overlay");
const menuLinks = document.querySelectorAll("#mobile-menu a");

function openMenu() {
    header.classList.add("nav-open");
    document.body.style.overflow = "hidden";
}

function closeMenu() {
    header.classList.remove("nav-open");
    document.body.style.overflow = "";
}

toggleBtn.addEventListener("click", openMenu);
closeBtn.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);

    menuLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
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

const tarjetas = document.querySelectorAll('.tarjeta');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let currentIndex = 0;

function mostrarTarjeta(index) {
    tarjetas.forEach((card, i) => {
        card.classList.remove('active');
        if (i === index) {
        card.classList.add('active');
        }
    });
}

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + tarjetas.length) % tarjetas.length;
    mostrarTarjeta(currentIndex);
});

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % tarjetas.length;
    mostrarTarjeta(currentIndex);
});

// Inicial
mostrarTarjeta(currentIndex);

const cards = document.querySelectorAll('.info-card');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
    if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // Solo se anima una vez
    }
    });
}, {
    threshold: 0.3
});

    cards.forEach(card => observer.observe(card));

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

 // Validación y manejo del formulario
    document.getElementById('consultaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Campos del formulario
    const nombre = this.nombre.value.trim();
    const correo = this.correo.value.trim();
    const asunto = this.asunto.value.trim();
    const mensaje = this.mensaje.value.trim();

    // Validar campos básicos
    if (!nombre || !correo || !asunto || !mensaje) {
        alert('Por favor completa todos los campos.');
        return;
    }

    // Validar reCAPTCHA
    if (grecaptcha.getResponse() === '') {
        alert('Por favor, verifica que no eres un robot.');
        return;
    }

    // Simulación de envío (aquí pondrías el fetch/ajax real)
    alert('Consulta enviada correctamente. ¡Gracias!');

    // Reiniciar formulario y reCAPTCHA
    this.reset();
    grecaptcha.reset();
});