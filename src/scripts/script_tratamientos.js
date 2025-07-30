// Menu hamburguesa
const header = document.getElementById("main-header");
const toggleBtn = document.getElementById("toggle-btn");
const closeBtn = document.getElementById("close-btn");
const overlay = document.getElementById("overlay");

function openMenu() {
  header.classList.add("nav-open");
  overlay.classList.add("activo");
  document.body.classList.add("bloqueado");
}

function closeMenu() {
  header.classList.remove("nav-open");
  overlay.classList.remove("activo");
  document.body.classList.remove("bloqueado");
}

toggleBtn?.addEventListener("click", openMenu);
closeBtn?.addEventListener("click", closeMenu);
overlay?.addEventListener("click", closeMenu);

document.querySelectorAll("#main-nav a").forEach(link => {
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


document.querySelectorAll('.card').forEach(card => {
  const btnToggle = card.querySelector('.btn-toggle');
  const expandable = card.querySelector('.card-expandable');
  const btnClose = card.querySelector('.btn-close');

  btnToggle.addEventListener('click', () => {
    // Cerrar otras tarjetas
    document.querySelectorAll('.card-expandable.show').forEach(open => {
      if (open !== expandable) {
        open.classList.remove('show');
      }
    });
    expandable.classList.add('show');
  });

  btnClose.addEventListener('click', () => {
    expandable.classList.remove('show');
  });
});


//Burbuja de whatsapp

document.getElementById("whatsapp-btn").addEventListener("click", function () {
    const phoneNumber = "598092745398";
    const message = "Hola, quiero agendar una cita.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
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