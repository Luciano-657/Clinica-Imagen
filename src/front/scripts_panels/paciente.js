document.addEventListener("DOMContentLoaded", () => {

    /* -------------------- Botones y secciones -------------------- */
    const sections = {
        perfil: document.getElementById("section-perfil"),
        citas: document.getElementById("section-citas"),
        facturas: document.getElementById("section-facturas"),
        historial: document.getElementById("section-historial"),
        "solicitar-cita": document.getElementById("section-solicitar-cita")
    };

    const buttons = {
        perfil: document.getElementById("btn-perfil"),
        citas: document.getElementById("btn-citas"),
        facturas: document.getElementById("btn-facturas"),
        historial: document.getElementById("btn-historial"),
        "solicitar-cita": document.getElementById("btn-solicitar-cita")
    };

    function showSection(name) {
        Object.values(sections).forEach(sec => sec?.classList.remove("active"));
        sections[name]?.classList.add("active");
    }

    Object.keys(buttons).forEach(key => {
        buttons[key]?.addEventListener("click", () => {
            showSection(key);
            if(key === "solicitar-cita") loadSucursales();
        });
    });

    /* -------------------- Cargar sucursales para el selector de cita -------------------- */
    function loadSucursales() {
        const sel = document.getElementById("sucursalSelect");
        if (!sel || sel.dataset.loaded === "1") return;

        fetch("/back/recepcionista/get_sucursales.php")
            .then(res => res.json())
            .then(data => {
                sel.innerHTML = "";
                if (!Array.isArray(data) || data.length === 0) {
                    sel.innerHTML = '<option value="">No hay sucursales disponibles</option>';
                    return;
                }
                sel.innerHTML = '<option value="">Seleccionar sucursal</option>';
                data.forEach(s => {
                    const val = s.id_sucursal ?? s.id ?? s.sucursal_id ?? "";
                    const text = s.nombre ?? s.sucursal ?? s.descripcion ?? ("Sucursal " + val);
                    if(val) {
                        const opt = document.createElement("option");
                        opt.value = val;
                        opt.textContent = text;
                        sel.appendChild(opt);
                    }
                });
                sel.dataset.loaded = "1";
            })
            .catch(() => sel.innerHTML = '<option value="">Error al cargar sucursales</option>');
    }

    /* -------------------- Envío de solicitud de cita online -------------------- */
    const requestCitaForm = document.getElementById('requestCitaForm');
    const requestCitaStatus = document.getElementById('requestCitaStatus');

    function toSqlDatetime(dtLocal) {
      // dtLocal: "YYYY-MM-DDTHH:MM" o "YYYY-MM-DDTHH:MM:SS"
      if (!dtLocal) return null;
      const s = dtLocal.replace('T', ' ');
      return s.length === 16 ? s + ':00' : s;
    }

    if (requestCitaForm) {
      requestCitaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (requestCitaStatus) {
          requestCitaStatus.style.color = '';
          requestCitaStatus.textContent = 'Enviando solicitud...';
        }

        const formData = new FormData(requestCitaForm);
        const id_sucursal = formData.get('id_sucursal') || '';
        const fecha_hora_preferida_raw = formData.get('fecha_hora_preferida') || '';
        const fecha_hora_preferida = toSqlDatetime(fecha_hora_preferida_raw);
        const motivo = (formData.get('motivo') || '').trim();
        // input opcional donde el paciente escribe el nombre del profesional
        const funcionario_nombre = (formData.get('profesional_preferencia') || '').trim();

        // validaciones mínimas
        if (!id_sucursal) {
          if (requestCitaStatus) { requestCitaStatus.style.color = 'red'; requestCitaStatus.textContent = 'Seleccione la sucursal.'; }
          return;
        }
        if (!fecha_hora_preferida) {
          if (requestCitaStatus) { requestCitaStatus.style.color = 'red'; requestCitaStatus.textContent = 'Seleccione fecha y hora preferida.'; }
          return;
        }

        const payload = {
          id_sucursal,
          fecha_hora_preferida,   // formato "YYYY-MM-DD HH:MM:SS"
          motivo,
          funcionario_nombre      // puede ser "" o null; el backend decide
        };

        try {
          const res = await fetch('/back/paciente/request_cita.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const text = await res.text();
          let data;
          try { data = JSON.parse(text); } catch {
            console.error('request_cita: respuesta no JSON:', text);
            if (requestCitaStatus) { requestCitaStatus.style.color = 'red'; requestCitaStatus.textContent = 'Respuesta inválida del servidor. Ver consola.'; }
            return;
          }

          if (data.success) {
            if (requestCitaStatus) { requestCitaStatus.style.color = 'green'; requestCitaStatus.textContent = data.message || 'Solicitud enviada correctamente.'; }
            requestCitaForm.reset();
          } else {
            if (requestCitaStatus) { requestCitaStatus.style.color = 'red'; requestCitaStatus.textContent = data.error || 'No se pudo enviar la solicitud.'; }
          }
        } catch (err) {
          console.error('Error enviando solicitud de cita:', err);
          if (requestCitaStatus) { requestCitaStatus.style.color = 'red'; requestCitaStatus.textContent = 'Error de red. Intente nuevamente.'; }
        }
      });
    }

    /* -------------------- Previsualización de foto -------------------- */
    const fotoInput = document.getElementById("fotoInput");
    const previewFoto = document.getElementById("previewFoto");
    const previewFotoSidebar = document.getElementById("previewFotoSidebar");

    fotoInput?.addEventListener("change", () => {
        const file = fotoInput.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = e => {
                previewFoto.src = e.target.result;
                if(previewFotoSidebar) previewFotoSidebar.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    /* -------------------- Toasts -------------------- */
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
        if(!container) return;
        container.innerHTML = "<p>Cargando...</p>";

        fetch(url)
            .then(res => res.json())
            .then(data => {
                container.innerHTML = "";
                if(!data || (data.success === false) || (!data.length && !data.historiales && !data.solicitudes)) {
                    container.innerHTML = `<div class="user-card"><p>${emptyMessage}</p></div>`;
                    return;
                }

                // Historiales aprobados
                if(containerId === "historialList") {
                    if(data.historiales?.length) {
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
                    } else container.innerHTML = `<div class="user-card"><p>No hay historiales aprobados.</p></div>`;
                }
                // Solicitudes de historial
                else if(containerId === "historialRequestsList") {
                    if(data.solicitudes?.length) {
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
                    } else container.innerHTML = `<div class="user-card"><p>No hay solicitudes de historial médico.</p></div>`;
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
            .catch(() => container.innerHTML = `<div class="user-card"><p>Error al cargar datos.</p></div>`);
    }

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
    ["citasList","facturasList","historialList","historialRequestsList"].forEach(id => {
        if(id === "citasList") fetchData("/back/paciente/get_citas.php", id, "No hay citas cargadas todavía.", mapCitas);
        else if(id === "facturasList") fetchData("/back/paciente/get_facturas.php", id, "No hay facturas cargadas todavía.", mapFacturas);
        else if(id === "historialList") fetchData("/back/paciente/get_historiales.php", id, "No hay historiales aprobados.", null);
        else fetchData("/back/paciente/get_historial_requests.php", id, "No hay solicitudes de historial médico.", null);
    });

    /* -------------------- Formulario de edición de perfil -------------------- */
    const editProfileForm = document.getElementById("editProfileForm");
    editProfileForm?.addEventListener("submit", e => {
        e.preventDefault();
        const formData = new FormData(editProfileForm);
        fetch("/back/paciente/update_profile.php", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                showToast(data.success, data.message);
                if(data.success && data.foto) {
                    const nuevaRuta = "/" + data.foto + "?t=" + new Date().getTime();
                    previewFoto.src = nuevaRuta;
                    if(previewFotoSidebar) previewFotoSidebar.src = nuevaRuta;
                }
            })
            .catch(() => showToast(false, "Error al actualizar perfil"));
    });

    /* -------------------- Formulario de solicitud de historial -------------------- */
    const requestForm = document.getElementById("requestHistorialForm");
    requestForm?.addEventListener("submit", e => {
        e.preventDefault();
        const formData = new FormData(requestForm);
        fetch("/back/paciente/request_historial.php", { method: "POST", body: formData })
            .then(res => res.json())
            .then (data => {
                showToast(data.success, data.message);
                if(data.success) {
                    requestForm.reset();
                    fetchData("/back/paciente/get_historial_requests.php", "historialRequestsList", "No hay solicitudes de historial médico.", null);
                }
            })
            .catch(() => showToast(false, "Error al enviar solicitud"));
    });

});
buttons["solicitar-cita"]?.addEventListener("click", () => {
    console.log("Botón de solicitar cita presionado"); // <--- prueba
    showSection("solicitar-cita");
    loadSucursales();
});
