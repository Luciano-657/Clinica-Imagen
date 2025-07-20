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


// Botón "Ver más"
document.querySelectorAll('.btn-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    const expandable = card.querySelector('.card-expandable');
    const isVisible = expandable.classList.contains('show');

    // Cerrar otras tarjetas abiertas
    document.querySelectorAll('.card-expandable.show').forEach(openExp => {
      if (openExp !== expandable) {
        openExp.classList.remove('show');
        openExp.closest('.card').querySelector('.btn-toggle').textContent = 'Ver más';
      }
    });

    // Alternar la tarjeta clickeada
    if (isVisible) {
      expandable.classList.remove('show');
      btn.textContent = 'Ver más';
    } else {
      expandable.classList.add('show');
      btn.textContent = 'Ver menos';
    }
  });
});

//Burbuja de whatsapp

document.getElementById("whatsapp-btn").addEventListener("click", function () {
    const phoneNumber = "598091484049";
    const message = "Hola, quiero agendar una cita.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
});