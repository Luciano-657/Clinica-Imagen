// ===== MENU HAMBURGUESA =====
const header = document.getElementById("main-header");
const toggleBtn = document.getElementById("toggle-btn");
const closeBtn = document.getElementById("close-btn");
const overlay = document.getElementById("overlay");
const menuLinks = document.querySelectorAll("#main-nav a");

function openMenu() {
    header.classList.add("nav-open");
    overlay?.classList.add("activo");
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
}

function closeMenu() {
    header.classList.remove("nav-open");
    overlay?.classList.remove("activo");
    document.body.classList.remove("no-scroll");
    document.documentElement.classList.remove("no-scroll");
}

toggleBtn.addEventListener("click", openMenu);
closeBtn.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

menuLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
});

// ===== EFECTO SHRINK AL SCROLL =====
window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("shrink");
    } else {
        header.classList.remove("shrink");
    }
});

// ===== MARCADO DE PÁGINA =====
const currentPage = window.location.pathname.split("/").pop().toLowerCase();
document.querySelectorAll("#main-nav a").forEach(link => {
    const href = link.getAttribute("href").toLowerCase();
    if (href === currentPage || (href === "index.html" && currentPage === "")) {
        link.classList.add("active");
    }
});
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.footer-link').forEach(link => {
        const page = link.dataset.page;
        if (page && page.toLowerCase() === currentPage.replace('.html','')) {
            link.classList.add('active');
        }
    });
});

// ========== MODAL TRATAMIENTOS ==========
const tratamientosData = {
  "ortodoncia": {
    titulo: "Ortodoncia",
    descripcion: "Corrige la alineación dental y mejora la mordida.",
    beneficios: ["Mejora estética facial", "Mordida funcional", "Higiene oral más fácil"],
    imagen: "../../front/assets/images/ortodoncia.jpg"
  },
  "ortopedia maxilar": {
    titulo: "Ortopedia Maxilar",
    descripcion: "Corrige problemas óseos en los niños.",
    beneficios: ["Guía el crecimiento óseo", "Previene tratamientos complejos a futuro"],
    imagen: "../../front/assets/images/ortopedia-Maxilar.jpg"
  },
  "implantes dentales": {
    titulo: "Implantes Dentales",
    descripcion: "Reemplaza dientes perdidos de forma fija.",
    beneficios: ["Funcionalidad", "Estética", "Evita pérdida ósea"],
    imagen: "../../front/assets/images/implantes-dentales.jpg"
  },
  "estética dental": {
    titulo: "Estética Dental",
    descripcion: "Mejora la apariencia de tu sonrisa.",
    beneficios: ["Sonrisa armónica", "Seguridad al sonreír", "Correcciones visibles"],
    imagen: "../../front/assets/images/estetica-dental.jpg"
  },
  "blanqueamiento dental": {
    titulo: "Blanqueamiento Dental",
    descripcion: "Ilumina y aclara tus dientes.",
    beneficios: ["Sonrisa más blanca", "Confianza", "Resultados rápidos"],
    imagen: "../../front/assets/images/blanqueamiento-dental.jpg"
  },
  "periodoncia": {
    titulo: "Periodoncia",
    descripcion: "Tratamiento de encías y tejidos de soporte.",
    beneficios: ["Encías sanas", "Prevención de pérdida dental"],
    imagen: "../../front/assets/images/peridoncia.jpg"
  },
  "prótesis dentales": {
    titulo: "Prótesis Dentales",
    descripcion: "Reemplazan piezas dentarias perdidas.",
    beneficios: ["Mejora masticación", "Habla", "Estética facial"],
    imagen: "../../front/assets/images/protesis-dental.jpg"
  },
  "endodoncia": {
    titulo: "Endodoncia",
    descripcion: "Tratamiento de conductos o nervios.",
    beneficios: ["Elimina dolor", "Conserva el diente natural"],
    imagen: "../../front/assets/images/endodoncia.jpg"
  },
  "cirugía bucal": {
    titulo: "Cirugía Bucal",
    descripcion: "Extracciones y procedimientos quirúrgicos.",
    beneficios: ["Remueve lesiones", "Cordales", "Mejora funcionalidad"],
    imagen: "../../front/assets/images/cirugia-bucal.jpg"
  },
  "odontopediatría": {
    titulo: "Odontopediatría",
    descripcion: "Odontología infantil preventiva y curativa.",
    beneficios: ["Controla crecimiento", "Educación temprana en salud bucal"],
    imagen: "../../front/assets/images/odontopediatria.jpg"
  },
  "bruxismo y placas": {
    titulo: "Bruxismo y Placas",
    descripcion: "Controla el rechinar de los dientes.",
    beneficios: ["Evita desgaste dental", "Relaja mandíbula", "Reduce dolor"],
    imagen: "../../front/assets/images/bruxismo-placas.jpg"
  },
  "rehabilitación oral": {
    titulo: "Rehabilitación Oral",
    descripcion: "Recupera funcionalidad oral completa.",
    beneficios: ["Funcionalidad total", "Estética integral"],
    imagen: "../../front/assets/images/rehabiltiacion-oral.jpg"
  },
  "radiología odontológica": {
    titulo: "Radiología Odontológica",
    descripcion: "Diagnóstico con imágenes dentales.",
    beneficios: ["Diagnóstico preciso", "Planificación adecuada"],
    imagen: "../../front/assets/images/radiografia-odontologica.jpg"
  },
  "diagnóstico y prevención": {
    titulo: "Diagnóstico y Prevención",
    descripcion: "Chequeos y cuidados para evitar enfermedades.",
    beneficios: ["Detección temprana", "Ahorro de tratamientos mayores"],
    imagen: "../../front/assets/images/prevencion.jpg"
  },
  "urgencias odontológicas": {
    titulo: "Urgencias Odontológicas",
    descripcion: "Atención inmediata ante emergencias dentales.",
    beneficios: ["Alivio rápido", "Control del daño", "Solución inmediata"],
    imagen: "../../front/assets/images/urgencia-odontologica.jpg"
  }
};

const modal = document.getElementById("modal-tratamiento");
const modalOverlay = document.getElementById("modal-overlay");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc-corta");
const modalBeneficios = document.getElementById("modal-beneficios");
const closeModalBtn = document.querySelector(".modal-close");
const nextBtn = document.getElementById("next-tratamiento");
const prevBtn = document.getElementById("prev-tratamiento");

let currentTratamientoKey = null;

function openModal(tratamientoNombre) {
  const key = tratamientoNombre.toLowerCase();
  const data = tratamientosData[key];
  if (!data) return;

  currentTratamientoKey = key;

  modalImg.src = data.imagen;
  modalTitle.textContent = data.titulo;
  modalDesc.textContent = data.descripcion;
  modalBeneficios.innerHTML = "";
  data.beneficios.forEach(b => {
    const li = document.createElement("li");
    li.textContent = b;
    modalBeneficios.appendChild(li);
  });

  modal.classList.add("show");
  modalOverlay.style.display = "block";
  document.body.classList.add("bloqueado");
}

function closeModal() {
  modal.classList.remove("show");
  modalOverlay.style.display = "none";
  document.body.classList.remove("bloqueado");
}

function navegarModal(direccion) {
  const keys = Object.keys(tratamientosData);
  let idx = keys.indexOf(currentTratamientoKey);
  idx = (idx + direccion + keys.length) % keys.length;
  openModal(keys[idx]);
}

document.querySelectorAll(".btn-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card-tratamiento");
    const nombre = card.querySelector("h3").textContent.trim().toLowerCase();
    openModal(nombre);
  });
});

closeModalBtn?.addEventListener("click", closeModal);
modalOverlay?.addEventListener("click", closeModal);
nextBtn?.addEventListener("click", () => navegarModal(1));
prevBtn?.addEventListener("click", () => navegarModal(-1));

// FILTRADO
document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const filtro = btn.dataset.filtro;
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".card-tratamiento").forEach(card => {
      const categoria = card.dataset.categoria;
      card.style.display = (filtro === "todos" || categoria === filtro) ? "flex" : "none";
    });
  });
});

// ===== WHATSAPP BUTTON =====
document.getElementById("whatsapp-btn")?.addEventListener("click", () => {
    const phoneNumber = "598092745398";
    const message = "Hola, quiero agendar una cita.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
});

// ===== FOOTER MOBILE TOGGLE =====
function toggleFooterSection(button) {
    const section = button.parentElement;
    const isActive = section.classList.contains("active");
    document.querySelectorAll(".footer-section").forEach(s => s.classList.remove("active"));
    if (!isActive) section.classList.add("active");
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