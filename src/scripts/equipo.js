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

function getQueryParam(param) {
const urlParams = new URLSearchParams(window.location.search);
return urlParams.get(param);
}

const perfiles = {
    javier: {
    nombre: "Dr. Javier de Lima Moreno",
    imagen: "src/images/javier.JPG",
    secciones: [
        {
            titulo: "Formación Académica",
            contenido: `
            <p>Título de Master en Imagenología.</p>
            <p>Doctor en Odontología (12 de agosto del 2003).</p>
            <p>N° Caja Profesional 80122. Nº Hab. MSP 18909.</p>
            <p>Facultad de Odontología. Universidad de la República.</p>
            `
        },
        {
            titulo: "Postgrados",
            contenido: `
            <ul>
            <li>Master en Ciencias Odontológicas, UFRGS (2013).</li>
            <li>Postgrado en Cirugía Buco Maxilo Facial, AOU (2007).</li>
            <li>Postgrado en Cirugía e Implantes, UdelaR (2004-2005).</li>
            </ul>
            `
        },
        {
            titulo: "Cargos en la Universidad",
            contenido: `
            <ul>
            <li>Titular del Servicio de Prótesis Buco-Maxilo-Facial. UdelaR.</li>
            <li>Titular del Servicio en Hospital Emilio Pensa, ASSE.</li>
            <li>Miembro del Dpto. de Implantología Oral y Maxilo Facial, UdelaR.</li>
            </ul>
            `
        },
        {
            titulo: "Docencia",
            contenido: `
            <ul>
            <li>Grado 2 - Servicio de Prótesis Buco-Maxilo-Facial (Pregrado).</li>
            <li>Co-dictante de cursos de Graduados y Postgraduados (2006 a la fecha).</li>
            </ul>
            `
        },
        {
            titulo: "Investigaciones y Proyectos",
            contenido: `
            <ul>
            <li>Red de investigación sobre conservación dentaria en pacientes oncológicos.</li>
            <li>Comparación de tomógrafos, estudios en tejidos dentarios irradiados.</li>
            <li>Creación de prótesis en impresoras 3D, y más.</li>
            </ul>
            `
        },
        {
            titulo: "Publicaciones Destacadas",
            contenido: `
            <ul>
            <li>Descentralización de la atención protésica en Uruguay (2013).</li>
            <li>Implante craneano con prototipado rápido (2011).</li>
            <li>Colaboraciones internacionales (México, Oral Journal, etc.).</li>
            </ul>
            `
        },
        {
            titulo: "Actividad Profesional",
            contenido: `
            <p>Consultorio particular desde 2004 - Clínica Médica Odontológica, Atlántida, Canelones.</p>
            <p>Dictante en múltiples congresos nacionales e internacionales (Uruguay, México, Cuba, EE.UU., etc.).</p>
            `
        },
        {
            titulo: "Otros Méritos",
            contenido: `
            <ul>
            <li>Presidente y past-president de la Sociedad Latinoamericana de Rehabilitación de la Cara.</li>
            <li>Profesor externo en universidades mexicanas.</li>
            <li>Desarrollo de software libre InVesalius para imágenes 3D.</li>
            </ul>
            `
        }
        ]
    },

    laura: {
        nombre: "Dra. Laura Duque",
        imagen: "src/images/laura.jpg",
        secciones: [
        {
            titulo: "Formación Académica",
            contenido: `
            <p>Doctora en Odontología, otorgado el 27 de Mayo del 2002.</p>
            <p>Facultad de Odontología de la Universidad de la República.</p>
            `
        },
        {
            titulo: "Formación Complementaria",
            contenido: `
            <ul>
                <li>Pasantía en Odontología Restauradora Integral - Escuela de Graduados - UdelaR - Mayo 2014.</li>
                <li>Curso de Ortodoncia en adultos I.E.S.S. Ortodoncia (2009-2010).</li>
                <li>Seminario de introducción a Ortodoncia y ATM - Diciembre 2002.</li>
                <li>Pasantía en Servicios de Urgencia - Facultad de Odontología - Mayo 2001.</li>
            </ul>
            `
        },
        {
            titulo: "Actividades Académicas y Jornadas",
            contenido: `
            <ul>
                <li>Jornadas de Odontología Hospitalaria CASMU (2001).</li>
                <li>Aplicación en Radiología - Facultad de Odontología - Marzo 2001.</li>
                <li>Participación en ENIFO 1998 y 2000 - UdelaR.</li>
                <li>Jornadas URUGUAYAS de Endodoncia - 1997.</li>
                <li>II Encuentro Latinoamericano de Estudiantes - Córdoba (1994).</li>
            </ul>
            `
        }
        ]
    },

    sabrina: {
        nombre: "Dra. Sabrina Nieves",
        imagen: "src/images/sabrina.jpg",
        secciones: [
        {
            titulo: "Formación Académica",
            contenido: `
            <p>Doctora en Odontología - Facultad de Odontología - UdelaR - Enero 2014.</p>
            `
        },
        {
            titulo: "Experiencia Laboral",
            contenido: `
            <ul>
                <li>Área de Patología Molecular - Grado 1 (2013).</li>
                <li>Ayudante en Cátedra de Odontopediatría (2014).</li>
                <li>Atención en Policlínicas Comunitarias - Policlínica Giraldez (2014).</li>
            </ul>
            `
        },
        {
            titulo: "Cursos y Congresos",
            contenido: `
            <ul>
                <li>Congreso de Estética - IM (2010).</li>
                <li>ENIFO - IM (2010).</li>
                <li>VIII reunión SUIO (2013).</li>
                <li>Seminario Ortodoncia Clínica y Desprogramación Mandibular (2014).</li>
                <li>Curso sobre niños a nivel comunitario (2014).</li>
                <li>Oclusión y Trastornos Temporomandibulares (2015).</li>
                <li>Uso de Láser en Odontología (2015).</li>
            </ul>
            `
        },
        {
            titulo: "Publicaciones",
            contenido: `
            <ul>
                <li>Odontoestomatología (2014): Citoqueratinas 14 y 19.</li>
                <li>Oral Surgery (2015): MSH2 y MLH1 en ameloblastomas.</li>
                <li>Odontoestomatología (2015): Análisis inmunohistoquímico CK14 y CK19.</li>
            </ul>
            `
        }
        ]
    },

    rosina: {
        nombre: "Rosina Canavero",
        imagen: "src/images/rosina.jpg",
        secciones: [
        {
            titulo: "Secretaría y Coordinación de Estudios",
            contenido: `
            <ul>
                <li>Secretariado Ejecutivo - Instituto Crandon (1988-1990).</li>
                <li>Inglés - Alianza Cultural Uruguay - EE.UU. (Nivel intermedio).</li>
                <li>Informática - Outlook, Excel, PowerPoint, Open Office.</li>
            </ul>
            `
        },
        {
            titulo: "Formación Complementaria",
            contenido: `
            <ul>
                <li>Curso Wedding Planner - Prof. Irene Viera Hiriart.</li>
                <li>Curso Ceremonial, Protocolo y Etiqueta - Círculo de la Prensa.</li>
            </ul>
            `
        },
        {
            titulo: "Experiencia Laboral",
            contenido: `
            <ul>
                <li>Organizadora de eventos - Carlos Gutierrez S.A. (2014-2017).</li>
                <li>Arturo Pardié Negocios Agropecuarios (2010-2014).</li>
            </ul>
            `
        }
        ]
    }
    };

function renderPerfil(personaId) {
    const perfil = perfiles[personaId];
    if (!perfil) {
        document.getElementById("perfil").innerHTML = "<p>Perfil no encontrado.</p>";
        return;
    }

    let html = `
        <section class="header-perfil">
        <a href="Nosotros.html"><i class="fa-solid fa-arrow-rotate-left"></i> Regresar</a>
        <img src="${perfil.imagen}" alt="${perfil.nombre}" class="perfil-img">
        <h1>${perfil.nombre}</h1>
        </section>
    `;

    perfil.secciones.forEach(seccion => {
        html += `
        <section class="bloque">
            <h2>${seccion.titulo}</h2>
            <div class="contenido">${seccion.contenido}</div>
        </section>
        `;
    });

    document.getElementById("perfil").innerHTML = html;
    }

const persona = getQueryParam("persona");
renderPerfil(persona);


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