document.addEventListener("DOMContentLoaded", () => {

    /* -------------------- Botones y secciones -------------------- */
    const sections = {
        perfil: document.getElementById("section-perfil"),
        citas: document.getElementById("section-citas"),
        facturas: document.getElementById("section-facturas"),
        historial: document.getElementById("section-historial")
    };

    const buttons = {
        perfil: document.getElementById("btn-perfil"),
        citas: document.getElementById("btn-citas"),
        facturas: document.getElementById("btn-facturas"),
        historial: document.getElementById("btn-historial")
    };

    function showSection(name) {
        Object.values(sections).forEach(sec => sec.classList.remove("active"));
        if (sections[name]) sections[name].classList.add("active");
    }

    buttons.perfil.addEventListener("click", () => showSection("perfil"));
    buttons.citas.addEventListener("click", () => showSection("citas"));
    buttons.facturas.addEventListener("click", () => showSection("facturas"));
    buttons.historial.addEventListener("click", () => showSection("historial"));

    /* -------------------- Previsualización de foto -------------------- */
    const fotoInput = document.getElementById("fotoInput");
    const previewFoto = document.getElementById("previewFoto");
    const previewFotoSidebar = document.getElementById("previewFotoSidebar");

    if (fotoInput) {
        fotoInput.addEventListener("change", () => {
            const file = fotoInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    previewFoto.src = e.target.result;
                    if (previewFotoSidebar) previewFotoSidebar.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    /* -------------------- Mensajes flotantes -------------------- */
    function showToast(success, message) {
        const container = document.querySelector(".toast-container") || createToastContainer();
        const toast = document.createElement("div");
        toast.className = `toast ${success ? "success" : "error"}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 10);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => container.removeChild(toast), 400);
        }, 3000);
    }

    function createToastContainer() {
        const div = document.createElement("div");
        div.className = "toast-container";
        document.body.appendChild(div);
        return div;
    }

    /* -------------------- Función genérica de carga de datos -------------------- */
    function fetchData(url, containerId, emptyMessage, mapFn) {
        const container = document.getElementById(containerId);
        container.innerHTML = "<p>Cargando...</p>";

        fetch(url)
            .then(res => res.json())
            .then(data => {
                container.innerHTML = "";
                if (!data || (data.success === false) || !data.length && !data.historiales && !data.solicitudes) {
                    const div = document.createElement("div");
                    div.className = "user-card";
                    div.innerHTML = `<p>${emptyMessage}</p>`;
                    container.appendChild(div);
                    return;
                }

                // Historiales aprobados
                if (containerId === "historialList") {
                    if (data.historiales && data.historiales.length) {
                        data.historiales.forEach(h => {
                            h.registros.forEach(reg => {
                                const div = document.createElement("div");
                                div.className = "user-card";
                                div.innerHTML = `
                                    <p><b>Fecha:</b> ${reg.fecha}</p>
                                    <p><b>Tipo:</b> ${reg.tipo}</p>
                                    <p><b>Descripción:</b> ${reg.descripcion}</p>
                                    ${reg.observaciones ? `<p><b>Observaciones:</b> ${reg.observaciones}</p>` : ""}
                                    ${reg.tratamiento_prescrito ? `<p><b>Tratamiento:</b> ${reg.tratamiento_prescrito}</p>` : ""}
                                `;
                                container.appendChild(div);
                            });
                        });
                    } else {
                        container.innerHTML = `<div class="user-card"><p>No hay historiales aprobados.</p></div>`;
                    }
                }
                // Solicitudes de historial
                else if (containerId === "historialRequestsList") {
                    if (data.solicitudes && data.solicitudes.length) {
                        data.solicitudes.forEach(s => {
                            const div = document.createElement("div");
                            div.className = "user-card";
                            div.innerHTML = `
                                <p><b>Fecha de solicitud:</b> ${new Date(s.fecha_solicitud).toLocaleString()}</p>
                                <p><b>Motivo:</b> ${s.motivo || '-'}</p>
                                <p><b>Estado:</b> ${s.estado}</p>
                                ${s.fecha_respuesta ? `<p><b>Respondido:</b> ${new Date(s.fecha_respuesta).toLocaleString()}</p>` : ''}
                            `;
                            container.appendChild(div);
                        });
                    } else {
                        container.innerHTML = `<div class="user-card"><p>No hay solicitudes de historial médico.</p></div>`;
                    }
                }
                // Citas y facturas
                else {
                    data.forEach(item => {
                        const div = document.createElement("div");
                        div.className = containerId === "citasList" ? "cita-card" : "user-card";
                        div.innerHTML = mapFn(item);
                        container.appendChild(div);
                    });
                }
            })
            .catch(() => {
                container.innerHTML = `<div class="user-card"><p>Error al cargar datos.</p></div>`;
            });
    }

    /* -------------------- Mapas de datos -------------------- */
    const mapCitas = c => `
        <p><b>Doctor:</b> ${c.doctor_nombre} ${c.doctor_apellido}</p>
        <p><b>Lugar:</b> ${c.sucursal}</p>
        <p><b>Inicio:</b> ${c.fecha_hora_inicio ? new Date(c.fecha_hora_inicio).toLocaleString() : ''}</p>
        <p><b>Estado:</b> ${c.estado}</p>
        ${c.notas ? `<p><b>Notas:</b> ${c.notas}</p>` : ''}
    `;

    const mapFacturas = f => `
        <p><b>Fecha:</b> ${f.fecha_emision}</p>
        <p><b>Monto:</b> $${f.monto_total}</p>
        <p><b>Estado:</b> ${f.estado}</p>
    `;

    /* -------------------- Inicializar datos -------------------- */
    function initData() {
        fetchData("/back/paciente/get_citas.php", "citasList", "No hay citas cargadas todavía.", mapCitas);
        fetchData("/back/paciente/get_facturas.php", "facturasList", "No hay facturas cargadas todavía.", mapFacturas);
        fetchData("/back/paciente/get_historiales.php", "historialList", "No hay historiales aprobados.", null);
        fetchData("/back/paciente/get_historial_requests.php", "historialRequestsList", "No hay solicitudes de historial médico.", null);
    }
    initData();

    /* -------------------- Formulario de edición de perfil -------------------- */
    const editProfileForm = document.getElementById("editProfileForm");
    if (editProfileForm) {
        editProfileForm.addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(editProfileForm);
            fetch("/back/paciente/update_profile.php", { method: "POST", body: formData })
                .then(res => res.json())
                .then(data => {
                    showToast(data.success, data.message);
                    if (data.success && data.foto) {
                        const nuevaRuta = "/" + data.foto + "?t=" + new Date().getTime();
                        previewFoto.src = nuevaRuta;
                        if (previewFotoSidebar) previewFotoSidebar.src = nuevaRuta;
                    }
                    initData();
                })
                .catch(() => showToast(false, "Error al actualizar perfil"));
        });
    }

    /* -------------------- Formulario de solicitud de historial -------------------- */
    const requestForm = document.getElementById("requestHistorialForm");
    if (requestForm) {
        requestForm.addEventListener("submit", e => {
            e.preventDefault();
            const formData = new FormData(requestForm);
            fetch("/back/paciente/request_historial.php", { method: "POST", body: formData })
                .then(res => res.json())
                .then(data => {
                    showToast(data.success, data.message);
                    if (data.success) {
                        requestForm.reset();
                        fetchData("/back/paciente/get_historial_requests.php", "historialRequestsList", "No hay solicitudes de historial médico.", null);
                    }
                })
                .catch(() => showToast(false, "Error al enviar solicitud"));
        });
    }

});
