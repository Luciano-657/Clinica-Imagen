document.addEventListener("DOMContentLoaded", () => {
    loadPacientes();
    loadFacturas();
    loadSelects();
    loadCitas();
    loadHistoriales();
    loadHistorialRequests();
    loadHistorialPaciente(); // <-- historiales del paciente

    /* -------------------- Activar secciones -------------------- */
    const sections = document.querySelectorAll(".section");
    const buttons = {
        pacientes: document.getElementById("btn-pacientes"),
        addPaciente: document.getElementById("btn-add-paciente"),
        citas: document.getElementById("btn-citas"),
        facturacion: document.getElementById("btn-facturacion"),
        mensajes: document.getElementById("btn-mensajes"),
        editProfile: document.getElementById("btn-edit-profile"),
        historial: document.getElementById("btn-historial")
    };

    const sectionMap = {
        pacientes: "section-pacientes",
        addPaciente: "section-add-paciente",
        citas: "section-citas",
        facturacion: "section-facturacion",
        mensajes: "section-mensajes",
        editProfile: "section-edit-profile",
        historial: "section-historial"
    };

    const showSection = id => {
        sections.forEach(sec => sec.classList.remove("active"));
        const sec = document.getElementById(id);
        if (sec) sec.classList.add("active");
    };

    Object.entries(buttons).forEach(([key, btn]) => {
        if (btn) btn.addEventListener("click", () => showSection(sectionMap[key]));
    });

    /* -------------------- Previsualización de foto -------------------- */
    const fotoInput = document.getElementById("fotoInput");
    const previewFoto = document.getElementById("previewFoto");
    if (fotoInput && previewFoto) {
        fotoInput.addEventListener("change", () => {
            const file = fotoInput.files[0];
            if (file) previewFoto.src = URL.createObjectURL(file);
        });
    }

    /* -------------------- Form editar perfil -------------------- */
    const editProfileForm = document.getElementById("editProfileForm");
    if (editProfileForm) {
        editProfileForm.onsubmit = async e => {
            e.preventDefault();
            const formData = new FormData(editProfileForm);
            try {
                const res = await fetch("/back/recepcionista/edit_profile.php", { method: "POST", body: formData });
                const result = await res.json();
                showMessage(result.mensaje || result.message, result.success ? "success" : "error");
                if (result.success && result.foto) {
                    const img = document.querySelector(".user-photo img");
                    img.src = "/" + result.foto + "?t=" + new Date().getTime();
                    previewFoto.src = img.src;
                }
            } catch (err) {
                console.error(err);
                showMessage("Error de conexión al actualizar perfil", "error");
            }
        };
    }

    /* -------------------- Cargar pacientes -------------------- */
    async function loadPacientes() {
        try {
            const res = await fetch("/back/recepcionista/get_patients.php");
            const pacientes = await res.json();
            const container = document.getElementById("pacientesList");
            if (!container) return;
            container.innerHTML = "";
            if (pacientes.length === 0) {
                container.innerHTML = "<p>No hay pacientes registrados</p>";
                return;
            }
            pacientes.forEach(p => {
                const div = document.createElement("div");
                div.className = "user-card";
                const fotoPaciente = p.foto ? p.foto : '/front/assets/images/avatar.jpg';
                div.innerHTML = `
                    <div class="user-img-wrapper">
                        <img src="${fotoPaciente}" alt="${p.nombre}" class="user-img">
                    </div>
                    <p><b>${p.nombre} ${p.apellido}</b></p>
                    <p>${p.email}</p>
                `;
                container.appendChild(div);
            });
        } catch (err) {
            console.error(err);
            showMessage("Error al cargar pacientes","error");
        }
    }

    /* -------------------- Cargar facturas -------------------- */
    async function loadFacturas() {
        const container = document.getElementById("facturasList");
        if (!container) return;
        container.innerHTML = "<p>Cargando facturas...</p>";
        try {
            const res = await fetch("/back/recepcionista/get_facturas.php");
            const data = await res.json();
            container.innerHTML = "";
            if (!data.success) {
                container.innerHTML = `<p class="error">${data.error || "Error al cargar facturas"}</p>`;
                return;
            }
            const facturas = Array.isArray(data.facturas) ? data.facturas : [];
            if (facturas.length === 0) {
                container.innerHTML = "<p>No hay facturas registradas</p>";
                return;
            }
            facturas.forEach(f => {
                const div = document.createElement("div");
                div.className = "factura-card";
                div.innerHTML = `
                    <h4>Factura #${f.id_factura}</h4>
                    <p><b>Paciente:</b> ${f.nombre} ${f.apellido}</p>
                    <p><b>Monto:</b> $${parseFloat(f.monto_total).toFixed(2)}</p>
                    <p><b>Estado:</b> ${f.estado}</p>
                    <p><b>Fecha emisión:</b> ${f.fecha_emision}</p>
                `;
                container.appendChild(div);
            });
        } catch (err) {
            console.error("Error al cargar facturas:", err);
            container.innerHTML = `<p class="error">Error al cargar facturas</p>`;
        }
    }

    /* -------------------- Cargar citas -------------------- */
    async function loadCitas() {
        const container = document.getElementById("citasList");
        const selectCita = document.getElementById("citaSelect");
        if(!container || !selectCita) return;
        container.innerHTML = "<p>Cargando citas...</p>";
        selectCita.innerHTML = "<option value=''>Seleccione una cita</option>";

        try {
            const res = await fetch("/back/recepcionista/get_citas.php");
            const data = await res.json();
            container.innerHTML = "";
            if(!data.success){
                container.innerHTML = `<p class="error">${data.error || "Error al cargar citas"}</p>`;
                return;
            }
            if(data.citas.length === 0){
                container.innerHTML = "<p>No hay citas registradas</p>";
                return;
            }

            data.citas.forEach(c => {
                const div = document.createElement("div");
                div.className = "cita-card";
                div.innerHTML = `
                    <p><b>Paciente:</b> ${c.paciente_nombre} ${c.paciente_apellido}</p>
                    <p><b>Funcionario:</b> ${c.funcionario_nombre} ${c.funcionario_apellido}</p>
                    <p><b>Sucursal:</b> ${c.sucursal_nombre}</p>
                    <p><b>Fecha inicio:</b> ${c.fecha_hora_inicio}</p>
                    <p><b>Fecha fin:</b> ${c.fecha_hora_fin}</p>
                `;
                container.appendChild(div);

                const option = document.createElement("option");
                option.value = c.id_cita;
                option.textContent = `${c.paciente_nombre} ${c.paciente_apellido} - ${c.fecha_hora_inicio}`;
                option.dataset.paciente = c.paciente_nombre + " " + c.paciente_apellido;
                option.dataset.funcionario = c.funcionario_nombre + " " + c.funcionario_apellido;
                option.dataset.fecha_inicio = c.fecha_hora_inicio.split("T")[0];
                option.dataset.fecha_fin = c.fecha_hora_fin.split("T")[0];
                selectCita.appendChild(option);
            });

        } catch(err){
            console.error(err);
            container.innerHTML = `<p class="error">Error al cargar citas</p>`;
        }
    }

    /* -------------------- Autocompletar paciente/funcionario/fechas -------------------- */
    const citaSelect = document.getElementById("citaSelect");
    if (citaSelect) {
        citaSelect.addEventListener("change", e => {
            const option = e.target.selectedOptions[0];
            document.getElementById("pacienteNombre").value = option?.dataset.paciente || "";
            document.getElementById("funcionarioNombre").value = option?.dataset.funcionario || "";
            document.getElementById("fechaInicio").value = option?.dataset.fecha_inicio || "";
            document.getElementById("fechaFin").value = option?.dataset.fecha_fin || "";
        });
    }

    /* -------------------- Cargar selects dinámicos -------------------- */
    async function loadSelects() {
        try {
            const fetchData = [
                { url: "/back/recepcionista/get_patients.php", select: "paciente_id", text: p => `${p.nombre} ${p.apellido}`, value: "id_paciente" },
                { url: "/back/recepcionista/get_sucursales.php", select: "sucursal_id", text: s => s.nombre, value: "id_sucursal" },
                { url: "/back/recepcionista/get_funcionarios.php", select: "funcionario_id", text: f => `${f.nombre} ${f.apellido}`, value: "id_funcionario" }
            ];
            for (let f of fetchData) {
                const res = await fetch(f.url);
                const data = await res.json();
                const select = document.querySelector(`select[name='${f.select}']`);
                if (!select) continue;
                select.innerHTML = "";
                data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item[f.value];
                    option.textContent = f.text(item);
                    select.appendChild(option);
                });
            }
        } catch(err){
            console.error("Error cargando selects:", err);
        }
    }

    /* -------------------- Cargar historial como tarjetas -------------------- */
    async function loadHistoriales() {
        const container = document.getElementById("historialCardsContainer");
        if(!container) return;
        container.innerHTML = "<p>Cargando historiales...</p>";

        try {
            const res = await fetch("/back/recepcionista/get_historial.php");
            const data = await res.json();
            container.innerHTML = "";

            if (!data.success) {
                container.innerHTML = `<p class="error">${data.error || "Error al cargar historiales"}</p>`;
                return;
            }

            if (!data.registros || data.registros.length === 0) {
                container.innerHTML = "<p>No hay historiales clínicos registrados</p>";
                return;
            }

            data.registros.forEach(h => {
                const card = document.createElement("div");
                card.className = "user-card registro-card";

                let archivosHtml = "-";
                if (Array.isArray(h.archivos) && h.archivos.length > 0) {
                    archivosHtml = h.archivos.map(a => `<a href="${a.ruta_archivo}" target="_blank">${a.ruta_archivo.split('/').pop()}</a>`).join(", ");
                }

                card.innerHTML = `
                    <p><strong>ID:</strong> ${h.id_registro}</p>
                    <p><strong>Paciente:</strong> ${h.paciente_nombre} ${h.paciente_apellido}</p>
                    <p><strong>Funcionario:</strong> ${h.funcionario_nombre || "N/A"} ${h.funcionario_apellido || ""}</p>
                    <p><strong>Fecha:</strong> ${h.fecha || ""}</p>
                    <p><strong>Tipo:</strong> ${h.tipo}</p>
                    <p><strong>Descripción:</strong> ${h.descripcion}</p>
                    <p><strong>Observaciones:</strong> ${h.observaciones || "-"}</p>
                    <p><strong>Archivos:</strong> ${archivosHtml}</p>
                `;
                container.appendChild(card);
            });

        } catch(err){
            console.error(err);
            container.innerHTML = "<p>Error al cargar historiales</p>";
        }
    }

    /* -------------------- Cargar solicitudes de historial -------------------- */
    async function loadHistorialRequests() {
        const container = document.getElementById("historialRequestsList");
        if(!container) return;
        container.innerHTML = "<p>Cargando solicitudes...</p>";

        try {
            const res = await fetch("/back/recepcionista/get_historial_requests.php");
            const data = await res.json();
            container.innerHTML = "";

            if(!data.success){
                container.innerHTML = `<p class="error">${data.error || "Error al cargar solicitudes"}</p>`;
                return;
            }

            if(!data.solicitudes || data.solicitudes.length === 0){
                container.innerHTML = "<p>No hay solicitudes pendientes</p>";
                return;
            }

            data.solicitudes.forEach(s => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <p><b>Paciente:</b> ${s.paciente_nombre} ${s.paciente_apellido}</p>
                    <p><b>Fecha solicitud:</b> ${s.fecha_solicitud}</p>
                    <button class="btn respondRequestBtn" data-id="${s.id_solicitud}" data-estado="enviado">Aceptar</button>
                    <button class="btn respondRequestBtn" data-id="${s.id_solicitud}" data-estado="rechazado">Rechazar</button>
                `;
                container.appendChild(card);
            });

            // Eventos de botones
            document.querySelectorAll(".respondRequestBtn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    const estado = btn.dataset.estado;

                    try {
                        const res = await fetch("/back/recepcionista/respond_historial_request.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id_solicitud: id, estado })
                        });
                        const result = await res.json();

                        if(result.success){
                            alert("Solicitud actualizada correctamente");
                            // Recargar solicitudes y historiales
                            loadHistorialRequests();
                            loadHistoriales(); // si se aceptó, que aparezca en historiales
                        } else {
                            alert("Error: " + (result.error || "No se pudo actualizar la solicitud"));
                        }

                    } catch(err){
                        console.error(err);
                        alert("Error de conexión");
                    }
                });
            });

        } catch(err){
            console.error(err);
            container.innerHTML = "<p>Error cargando solicitudes</p>";
        }
    }

    /* -------------------- Form agregar historial -------------------- */
    const addHistorialForm = document.getElementById("addHistorialForm");
    if(addHistorialForm){
        addHistorialForm.addEventListener("submit", async e => {
            e.preventDefault();
            const formData = new FormData(addHistorialForm);
            try {
                const res = await fetch("/back/recepcionista/add_historial.php", {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                alert(data.success ? "Historial agregado correctamente" : "Error: " + data.error);
                if(data.success){
                    addHistorialForm.reset();
                    document.getElementById("pacienteNombre").value = "";
                    document.getElementById("funcionarioNombre").value = "";
                    document.getElementById("fechaInicio").value = "";
                    document.getElementById("fechaFin").value = "";
                    loadHistoriales();
                }
            } catch(err){
                console.error(err);
                alert("Error al agregar historial");
            }
        });
    }

    /* -------------------- Mensajes de alerta -------------------- */
    function showMessage(msg, type="info"){
        alert(msg);
    }

    /* -------------------- Cargar historiales visibles para el paciente -------------------- */
    async function loadHistorialPaciente() {
        const container = document.getElementById("historialPacienteList");
        if (!container) return;

        container.innerHTML = "<p>Cargando historiales...</p>";

        try {
            const res = await fetch("/back/paciente/get_historial_paciente.php");
            const data = await res.json();
            container.innerHTML = "";

            if (!data.success || !data.historiales || data.historiales.length === 0) {
                container.innerHTML = "<p>No hay historiales disponibles</p>";
                return;
            }

            data.historiales.forEach(h => {
                const card = document.createElement("div");
                card.className = "user-card registro-card";

                card.innerHTML = `
                    <p><strong>ID:</strong> ${h.id_registro}</p>
                    <p><strong>Funcionario:</strong> ${h.funcionario_nombre || "N/A"} ${h.funcionario_apellido || ""}</p>
                    <p><strong>Fecha:</strong> ${h.fecha}</p>
                    <p><strong>Tipo:</strong> ${h.tipo}</p>
                    <p><strong>Descripción:</strong> ${h.descripcion}</p>
                    <p><strong>Observaciones:</strong> ${h.observaciones || "-"}</p>
                `;
                container.appendChild(card);
            });

        } catch (err) {
            console.error(err);
            container.innerHTML = "<p>Error al cargar historiales</p>";
        }
    }
});
