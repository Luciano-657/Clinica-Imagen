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

const current = window.location.pathname.split("/").pop().toLowerCase();
const links = document.querySelectorAll("#main-nav a");

links.forEach(link => {
    const href = link.getAttribute("href").toLowerCase();
    if (href === current || (href === "index.html" && current === "")) {
    link.classList.add("active");
    }
});

//Burbuja de whatsapp

document.getElementById("whatsapp-btn").addEventListener("click", function () {
    const phoneNumber = "598092745398";
    const message = "Hola, quiero agendar una cita.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
});

//Carrusel de porque elegirnos

    function scrollCarousel(direction) {
        const carousel = document.getElementById('carousel');
        const scrollAmount = carousel.offsetWidth * 0.7; // 70% del ancho visible
        carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

//Carrusel de reseñas

const carrusel = document.getElementById("carrusel2");

    //  Duplicar contenido automáticamente para scroll continuo
    const duplicarContenido = () => {
        const original = [...carrusel.children];
        original.forEach(node => carrusel.appendChild(node.cloneNode(true)));
    };
    duplicarContenido();

    // ⏸ Pausar animación al interactuar
    const toggleAnimation = (state) => {
        carrusel.style.animationPlayState = state;
    };

    carrusel.addEventListener("mouseenter", () => toggleAnimation("paused"));
    carrusel.addEventListener("mouseleave", () => toggleAnimation("running"));
    carrusel.addEventListener("click", () => toggleAnimation("paused"));
    document.addEventListener("click", (e) => {
        if (!carrusel.contains(e.target)) {
            toggleAnimation("running");
        }
    });

    //  Pausar si sale de pantalla
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            carrusel.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
        });
    }, { threshold: 0.1 });
    observer.observe(carrusel);

// Animación on-scroll desde la izquierda de llamado laboral

document.addEventListener("DOMContentLoaded", function () {
    const tarjetaLlamado = document.querySelector('.llamado-card');

    if (!tarjetaLlamado) return;

    const llamadoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            tarjetaLlamado.classList.add('visible');
            observer.unobserve(entry.target);
        }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -20% 0px',
        threshold: 0.05
    });

    llamadoObserver.observe(tarjetaLlamado);
    });

document.addEventListener("DOMContentLoaded", function () {
    const elementosAnimados = document.querySelectorAll('.anim-left, .anim-right');

    if (!elementosAnimados.length) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -20% 0px',
        threshold: 0.05
    });

    elementosAnimados.forEach(el => observer.observe(el));
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