//Menu Hamburguesa
const header = document.getElementById("main-header");
const toggleBtn = document.getElementById("toggle-btn");
const closeBtn = document.getElementById("close-btn");
const overlay = document.getElementById("overlay");

toggleBtn.addEventListener("click", () => {
    header.classList.add("nav-open");
    document.body.style.overflow = "hidden";
});

function cerrarMenu() {
    header.classList.remove("nav-open");
    document.body.style.overflow = "";
}

closeBtn.addEventListener("click", cerrarMenu);
overlay.addEventListener("click", cerrarMenu);

window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
        cerrarMenu();
    }
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

// Animación on-scroll desde la izquierda (sin interferir con el carrusel)

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
        rootMargin: '0px 0px -20% 0px', // activa un poco antes de que esté completamente visible
        threshold: 0.05
    });

    llamadoObserver.observe(tarjetaLlamado);
    });
