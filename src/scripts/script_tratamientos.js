// ========== MENÚ HAMBURGUESA ==========
const header = document.getElementById("main-header");
const toggleBtn = document.getElementById("toggle-btn");
const closeBtn = document.getElementById("close-btn");
const navOverlay = document.getElementById("overlay");

function openMenu() {
  header.classList.add("nav-open");
  navOverlay.classList.add("activo");
  document.body.classList.add("bloqueado");
}

function closeMenu() {
  header.classList.remove("nav-open");
  navOverlay.classList.remove("activo");
  document.body.classList.remove("bloqueado");
}

toggleBtn?.addEventListener("click", openMenu);
closeBtn?.addEventListener("click", closeMenu);
navOverlay?.addEventListener("click", closeMenu);

document.querySelectorAll("#main-nav a").forEach(link => {
  link.addEventListener("click", closeMenu);
});

// ========== MENÚ ACTIVO ==========
const current = window.location.pathname.split("/").pop().toLowerCase();
document.querySelectorAll("#main-nav a").forEach(link => {
  const href = link.getAttribute("href").toLowerCase();
  if (href === current || (href === "index.html" && current === "")) {
    link.classList.add("active");
  }
});

// ========== FOOTER ACTIVO ==========
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

// ========== MODAL TRATAMIENTOS ==========
const tratamientosData = {
  ortodoncia: {
    titulo: "Ortodoncia",
    descripcion: "Corrige la alineación dental y mejora la mordida.",
    beneficios: ["Mejora estética facial", "Mordida funcional", "Higiene oral más fácil"],
    imagen: '../../src/images/tratamientos_imagenes/ortodoncia.jpg'
  },
  ortopedia: {
    titulo: "Ortopedia Maxilar",
    descripcion: "Corrige problemas óseos en los niños.",
    beneficios: ["Guía el crecimiento óseo", "Previene tratamientos complejos a futuro"],
    imagen: '../../src/images/tratamientos_imagenes/ortopedia-Maxilar.jpg'
  },
  implantes: {
    titulo: "Implantes Dentales",
    descripcion: "Reemplaza dientes perdidos de forma fija.",
    beneficios: ["Funcionalidad", "Estética", "Evita pérdida ósea"],
    imagen: '../../src/images/tratamientos_imagenes/implantes-dentales.jpg'
  },
  estetica: {
    titulo: "Estética Dental",
    descripcion: "Mejora la apariencia de tu sonrisa.",
    beneficios: ["Sonrisa armónica", "Seguridad al sonreír", "Correcciones visibles"],
    imagen: '../../src/images/tratamientos_imagenes/estetica-dental.jpg'
  },
  blanqueamiento: {
    titulo: "Blanqueamiento Dental",
    descripcion: "Ilumina y aclara tus dientes.",
    beneficios: ["Sonrisa más blanca", "Confianza", "Resultados rápidos"],
    imagen: '../../src/images/tratamientos_imagenes/blanqueamiento-dental.jpg'
  },
  periodoncia: {
    titulo: "Periodoncia",
    descripcion: "Tratamiento de encías y tejidos de soporte.",
    beneficios: ["Encías sanas", "Prevención de pérdida dental"],
    imagen: '../../src/images/tratamientos_imagenes/peridoncia.jpg'
  },
  protesis: {
    titulo: "Prótesis Dentales",
    descripcion: "Reemplazan piezas dentarias perdidas.",
    beneficios: ["Mejora masticación", "Habla", "Estética facial"],
    imagen: '../../src/images/tratamientos_imagenes/protesis-dental.jpg'
  },
  endodoncia: {
    titulo: "Endodoncia",
    descripcion: "Tratamiento de conductos o nervios.",
    beneficios: ["Elimina dolor", "Conserva el diente natural"],
    imagen: '../../src/images/tratamientos_imagenes/endodoncia.jpg'
  },
  cirugia: {
    titulo: "Cirugía Bucal",
    descripcion: "Extracciones y procedimientos quirúrgicos.",
    beneficios: ["Remueve lesiones", "Cordales", "Mejora funcionalidad"],
    imagen: '../../src/images/tratamientos_imagenes/cirugia-bucal.jpg'
  },
  odontopediatria: {
    titulo: "Odontopediatría",
    descripcion: "Odontología infantil preventiva y curativa.",
    beneficios: ["Controla crecimiento", "Educación temprana en salud bucal"],
    imagen: '../../src/images/tratamientos_imagenes/odontopediatria.jpg'
  },
  bruxismo: {
    titulo: "Bruxismo y Placas",
    descripcion: "Controla el rechinar de los dientes.",
    beneficios: ["Evita desgaste dental", "Relaja mandíbula", "Reduce dolor"],
    imagen: '../../src/images/tratamientos_imagenes/bruxismo-placas.jpg'
  },
  rehabilitacion: {
    titulo: "Rehabilitación Oral",
    descripcion: "Recupera funcionalidad oral completa.",
    beneficios: ["Funcionalidad total", "Estética integral"],
    imagen: '../../src/images/tratamientos_imagenes/rehabiltiacion-oral.jpg'
  },
  radiologia: {
    titulo: "Radiología Odontológica",
    descripcion: "Diagnóstico con imágenes dentales.",
    beneficios: ["Diagnóstico preciso", "Planificación adecuada"],
    imagen: '../../src/images/tratamientos_imagenes/radiografia-odontologica.jpg'
  },
  prevencion: {
    titulo: "Diagnóstico y Prevención",
    descripcion: "Chequeos y cuidados para evitar enfermedades.",
    beneficios: ["Detección temprana", "Ahorro de tratamientos mayores"],
    imagen: '../../src/images/tratamientos_imagenes/prevencion.jpg'
  },
  urgencias: {
    titulo: "Urgencias Odontológicas",
    descripcion: "Atención inmediata ante emergencias dentales.",
    beneficios: ["Alivio rápido", "Control del daño", "Solución inmediata"],
    imagen: '../../src/images/tratamientos_imagenes/ortodoncia.jpg'
  }
};

const tratamientosOrden = Object.keys(tratamientosData);
let currentIndex = 0;

const modal = document.getElementById("modal-tratamiento");
const modalOverlay = document.getElementById("modal-overlay");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc-corta");
const modalBeneficios = document.getElementById("modal-beneficios");
const closeModalBtn = document.querySelector(".modal-close");
const nextBtn = document.getElementById("next-tratamiento");
const prevBtn = document.getElementById("prev-tratamiento");

function cargarTratamiento(id) {
  const data = tratamientosData[id];
  if (!data) return;

  modalImg.src = data.imagen;
  modalTitle.textContent = data.titulo;
  modalDesc.textContent = data.descripcion;
  modalBeneficios.innerHTML = "";
  data.beneficios.forEach(b => {
    const li = document.createElement("li");
    li.textContent = b;
    modalBeneficios.appendChild(li);
  });
}

function openModal(id) {
  currentIndex = tratamientosOrden.indexOf(id);
  cargarTratamiento(id);
  document.body.classList.add("bloqueado");
  modalOverlay.style.display = "block";
  modal.classList.add("show");
}

function closeModal() {
  modalOverlay.style.display = "none";
  modal.classList.remove("show");
  document.body.classList.remove("bloqueado");
}

function navegar(direccion) {
  currentIndex = (currentIndex + direccion + tratamientosOrden.length) % tratamientosOrden.length;
  cargarTratamiento(tratamientosOrden[currentIndex]);
}

if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (nextBtn) nextBtn.addEventListener("click", () => navegar(1));
if (prevBtn) prevBtn.addEventListener("click", () => navegar(-1));

const safeKeys = {
  "ortodoncia": "ortodoncia",
  "ortopedia maxilar": "ortopedia",
  "implantes dentales": "implantes",
  "estética dental": "estetica",
  "blanqueamiento dental": "blanqueamiento",
  "periodoncia": "periodoncia",
  "prótesis dentales": "protesis",
  "endodoncia": "endodoncia",
  "cirugía bucal": "cirugia",
  "odontopediatría": "odontopediatria",
  "bruxismo y placas": "bruxismo",
  "rehabilitación oral": "rehabilitacion",
  "radiología odontológica": "radiologia",
  "diagnóstico y prevención": "prevencion",
  "urgencias odontológicas": "urgencias"
};

document.querySelectorAll(".card").forEach(card => {
  const btn = card.querySelector(".btn-toggle");
  const rawTitle = card.querySelector("h2").textContent.trim().toLowerCase();
  const id = safeKeys[rawTitle];
  if (id && tratamientosData[id]) {
    btn.addEventListener("click", () => openModal(id));
  }
});

// ========== WHATSAPP ==========
document.getElementById("whatsapp-btn")?.addEventListener("click", function () {
  const phoneNumber = "598092745398";
  const message = "Hola, quiero agendar una cita.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});

// ========== FOOTER DESPLEGABLE ==========
function toggleFooterSection(button) {
  const section = button.parentElement;
  const isActive = section.classList.contains("active");

  document.querySelectorAll(".footer-section").forEach(s => s.classList.remove("active"));
  if (!isActive) {
    section.classList.add("active");
  }
}

// ========== FORMULARIO ==========
document.getElementById('consultaForm')?.addEventListener('submit', function(e) {
  e.preventDefault();

  const nombre = this.nombre.value.trim();
  const correo = this.correo.value.trim();
  const asunto = this.asunto.value.trim();
  const mensaje = this.mensaje.value.trim();

  if (!nombre || !correo || !asunto || !mensaje) {
    alert('Por favor completa todos los campos.');
    return;
  }

  if (grecaptcha.getResponse() === '') {
    alert('Por favor, verifica que no eres un robot.');
    return;
  }

  alert('Consulta enviada correctamente. ¡Gracias!');
  this.reset();
  grecaptcha.reset();
});
