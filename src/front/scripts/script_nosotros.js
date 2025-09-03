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

// ========== FORMULARIO ==========
    document.getElementById("contact-form").addEventListener("submit", function(e) {
        let captcha = document.getElementById("captcha").value.trim();
        let captchaError = document.getElementById("captchaError");

        if (captcha !== "7") {
            e.preventDefault();
            captchaError.textContent = "Captcha incorrecto, inténtalo de nuevo.";
        } else {
            captchaError.textContent = "";
        }
    });