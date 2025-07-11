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

const ubicaciones = [
    {
        depto: "Montevideo",
        nombre: "Sede Caudillos",
        direccion: "Bv. Artigas esq. Rivera 1443, oficina 121, Montevideo.",
        horario: "Lunes a viernes 8:00 a 20:00 hs | Sábados 9:00 a 14:00 hs.",
        tel: "2602 6631 - 092 745 398",
        iframe: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13088.65132494305!2d-56.1643708!3d-34.902363!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f816fc36ffd73%3A0x5de8f9c5d9606cbb!2sCl%C3%ADnica%20Imagen%20-%20Caudillos!5e0!3m2!1ses-419!2suy!4v1751911154512!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/eGMWTn4rD8V4qhcYA"
    },
    {
        depto: "Montevideo",
        nombre: "Sede Montevideo Shopping",
        direccion: "Luis A. de Herrera 1248, oficina 321, Montevideo.",
        horario: "Lunes a viernes 8:00 a 20:00 hs | Sábados 8:00 a 13:00 hs.",
        tel: "2602 6631 - 092 745 398",
        iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.080997526308!2d-56.137042099999995!3d-34.9044168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81534f580625%3A0xc50d17e4ea0d2c30!2sCl%C3%ADnica%20Imagen%20-%20Montevideo%20Shopping!5e0!3m2!1ses-419!2suy!4v1751911277525!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/QtDqLz9MiFcfHmgV9"
    },
    {
        depto: "Montevideo",
        nombre: "Sede Nuevo Centro",
        direccion: "Bv Artigas 3126, apto. 1103, Montevideo.",
        horario: "Lunes a viernes 8:00 a 20:00 hs | Sábados 9:00 a 14:00 hs.",
        tel: "2602 6631 - 092 745 398",
        iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3273.4715668656495!2d-56.1694909!3d-34.869503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81b5369165c9%3A0x2eefef48ac216a50!2sCl%C3%ADnica%20Imagen%20-%20Nuevo%20Centro!5e0!3m2!1ses-419!2suy!4v1751911347833!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/KKVNuuehKLhDy9g98"
    },
    {
        depto: "Canelones",
        nombre: "Sede Carrasco",
        direccion: "Portal de las Américas, loc. 109. Av. De las Américas.",
        horario: "Lunes a viernes 8:00 a 20:00 hs | Sábados 9:00 a 14:00 hs.",
        tel: "2602 6631 - 092 745 398",
        iframe: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13166.690808183283!2d-56.03660720660261!3d-34.8699041468995!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f8760f1d9d0e7%3A0x1cd2beb15cd5aba0!2sCl%C3%ADnica%20Imagen!5e0!3m2!1ses-419!2suy!4v1751911439755!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/Le7yK4ZEHeZstA3BA"
    },
    {
        depto: "Canelones",
        nombre: "Sede Lagomar",
        direccion: "Av. Giannattasio, 236, y Av. Secco García, Lagomar Norte.",
        horario: "Lunes a viernes 8:00 a 20:00 hs | Sábados 9:00 a 14:00 hs.",
        tel: "2602 6631 - 092 745 398",
        iframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3274.9975388539833!2d-55.9762626!3d-34.831154399999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f898071f54245%3A0x3fbfab18bdc71b47!2sCl%C3%ADnica%20Imagen%20Lagomar!5e0!3m2!1ses-419!2suy!4v1751911487301!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/na6H93wLR7Pj5Wkj8"
    },
    {
        depto: "Canelones",
        nombre: "Sede Atlántida",
        direccion: "Calle 22 esq. calle 7.",
        horario: "Lunes 8:00 a 14:00hs | Martes, jueves y viernes 8:00 a 16:00hs.",
        tel: "2602 6631 - 092 745 398",
        iframe: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13109.597827484533!2d-55.7592431!3d-34.7707179!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959ff558b271781d%3A0x45aad75153b9c309!2sCl%C3%ADnica%20Imagen%20%7C%20Sede%20Atl%C3%A1ntida!5e0!3m2!1ses-419!2suy!4v1751911528996!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/4mr2UsuWRb1s9U4n6"
    },
    {
        depto: "Colonia",
        nombre: "Sede Colonia",
        direccion: "Alberto Méndez 135 entre 18 de julio y Manuel de Lobo, Colonia del Sacramento.",
        horario: "Lunes a viernes 9:00 a 13:00 | 15:00 a 19:00 hs | Sábados 10:00 a 14:00 hs.",
        tel: "092 745 398",
        iframe: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d210510.53621700915!2d-58.1334995!3d-34.471762!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a3138147d26d81%3A0x25981c6f93f3f1f9!2sCl%C3%ADnica%20Imagen%20-%20Colonia!5e0!3m2!1ses-419!2suy!4v1751911575939!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/mctgJgzJAXoETj4w8"
    },
    {
        depto: "San José",
        nombre: "Sede Libertad",
        direccion: "Gral. José Artigas 815, Libertad, San José.",
        horario: "Lunes 14:00 a 18:30 hs | Mar & Vie 9:00 a 12:00 | Mié 9:00 a 12:00 y 14:00 a 18:30 | Jue 17:00 a 20:00 hs.",
        tel: "092 390 847",
        iframe: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13131.678162948212!2d-56.6174497!3d-34.6314735!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a1950362462403%3A0x65fc11b7c33d2a4c!2sCl%C3%ADnica%20Imagen%20-%20Sede%20Libertad!5e0!3m2!1ses-419!2suy!4v1751911619097!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/JCS9DFi9gacMAfMm6"
    },
    {
        depto: "Maldonado",
        nombre: "Sede Punta del Este",
        direccion: "Avda. Roosevelt 1246 esq. Camacho, apt 1605, Maldonado.",
        horario: "Lunes & Viernes 12:00 a 20:00 | Mar a Jue 10:00 a 18:00 | Sáb 9:00 a 13:00 hs.",
        tel: "092 745 398",
        iframe: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13086.206330955636!2d-54.9576475!3d-34.9177011!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95751be4839f3525%3A0x8aca4722b762f18e!2sCl%C3%ADnica%20Imagen%20-%20Sede%20Punta%20del%20Este!5e0!3m2!1ses-419!2suy!4v1751911659557!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/oHULWSG4kT5fTfFQ6"
    },
    {
        depto: "Canelones",
        nombre: "Sede Las Piedras",
        direccion: "Gral. Leandro Gómez 618, Las Piedras, Canelones.",
        horario: "Lunes a viernes 8:30 a 12:30hs | 15:00 a 19:00hs | Sábados 8:00 a 14:00hs.",
        tel: "098 786 833",
        iframe: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13116.457339632494!2d-56.2149329!3d-34.7275123!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a1d3027ead3623%3A0x3f50cdeb558508bd!2sCl%C3%ADnica%20Imagen%20-%20Sede%20Las%20Piedras!5e0!3m2!1ses-419!2suy!4v1751911703159!5m2!1ses-419!2suy",
        mapLink: "https://maps.app.goo.gl/36w2Ji71P5gYwyQm8"
    }
];

function crearCard(ubi) {
    return `
    <div class="card">
        <i class="fa-solid fa-location-dot"></i>
        <h3>${ubi.nombre}</h3>
        <iframe src="${ubi.iframe}" loading="lazy"></iframe>
        <a href="${ubi.mapLink}" target="_blank" class="btn-map">Ver en Google Maps</a>
        <p><strong>Dirección:</strong> ${ubi.direccion}</p>
        <p><strong>Horario:</strong> ${ubi.horario}</p>
        <p><strong>Tel:</strong> ${ubi.tel}</p>
    </div>`;
}

function fillCarousel(id, data) {
    const container = document.getElementById(id);
    container.innerHTML = data.map(ubi => crearCard(ubi)).join('');
}

// Mostrar el modal con tarjetas filtradas
function mostrarModal(list) {
    const modal = document.getElementById('modal');
    const info = document.getElementById('modal-info');
    const res = document.getElementById('modal-results');

    if (list.length === 0) {
        info.textContent = 'No hay sedes en este departamento.';
        res.innerHTML = '';
    } else {
        info.textContent = `${list.length} sede(s) encontradas.`;
        res.innerHTML = list.map(ubi => crearCard(ubi)).join('');
    }
    modal.style.display = 'block';
}

// Botones de flecha en PC
function initArrowButtons() {
    const container = document.getElementById('carousel');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const cardWidth = container.querySelector('.card')?.offsetWidth || 300;
    const gap = 16;

    nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fillCarousel('carousel', ubicaciones);
    initArrowButtons();

    // Modal y filtro
    document.getElementById('departamentoSelect').addEventListener('change', e => {
        const sel = e.target.value;
        const filtradas = ubicaciones.filter(u => u.depto === sel);
        mostrarModal(filtradas);
    });

    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
    });

    window.addEventListener('click', ev => {
        if (ev.target === document.getElementById('modal')) {
            document.getElementById('modal').style.display = 'none';
        }
    });
});

document.getElementById("whatsapp-btn").addEventListener("click", function () {
    const phoneNumber = "598091484049";
    const message = "Hola, quiero agendar una cita.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
});

document.getElementById("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const mensaje = document.getElementById("form-message");
    const recaptchaResponse = grecaptcha.getResponse();

    if (recaptchaResponse.length === 0) {
        mensaje.textContent = "Por favor verifica que no eres un robot.";
        mensaje.style.color = "red";
        return;
    }

    mensaje.textContent = "Formulario enviado correctamente ✅";
    mensaje.style.color = "green";

    // Limpia los campos
    e.target.reset();
    grecaptcha.reset();
});
