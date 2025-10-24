document.addEventListener("DOMContentLoaded", () => {
    loadPacientes();
    loadFacturas();
    loadSelects();
    loadCitas();
    loadHistoriales();
    loadHistorialRequests();
    loadHistorialPaciente(); // <-- historiales del paciente
    // Añadir a la lista de funciones ejecutadas al cargar
    loadCitaRequests();
    // ---------------- render solicitudes de cita ----------------
    window.renderCitaRequests = function(requests = []) {
        const root = document.getElementById('citaRequestsList');
        if (!root) return;
        root.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'cita-reqs-grid';

        // poblar select de funcionarios del modal
        const funcSelect = document.getElementById('reassignFuncionario');
        if (funcSelect && Array.isArray(window.FUNCIONARIOS)) {
            funcSelect.innerHTML = '<option value="">-- Sin preferencia --</option>';
            window.FUNCIONARIOS.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id_funcionario || f.id || '';
                opt.textContent = (f.nombre || '') + ' ' + (f.apellido || '');
                funcSelect.appendChild(opt);
            });
        }

        requests.forEach(req => {
            const card = document.createElement('article');
            card.className = 'cita-request';
            // usar id_solicitud si viene desde el backend
            card.dataset.id = req.id_solicitud ?? req.id ?? req.request_id ?? '';

            const avatar = document.createElement('div');
            avatar.className = 'cr-avatar';
            const img = document.createElement('img');
            img.src = req.foto || '/front/assets/images/default_user.png';
            avatar.appendChild(img);

            const body = document.createElement('div');
            body.className = 'cr-body';

            // encabezado
            const top = document.createElement('div');
            top.className = 'cr-top';
            const nameBlock = document.createElement('div');
            nameBlock.innerHTML = `<div class="cr-name">${(req.paciente_nombre || req.nombre || 'Paciente')}</div>
                                   <div class="cr-small">${req.paciente_documento ? 'DNI: '+req.paciente_documento : ''}</div>`;
            const meta = document.createElement('div');
            meta.className = 'cr-meta';
            const when = document.createElement('div');
            when.innerHTML = `<span class="cr-badge">${(req.fecha_hora ? req.fecha_hora.replace(' ', ' · ') : '—')}</span>`;
            const status = document.createElement('div');
            status.className = 'cr-status pending';
            status.textContent = (req.estado || 'pendiente').toUpperCase();
            meta.appendChild(when); meta.appendChild(status);
            top.appendChild(nameBlock); top.appendChild(meta);

            const reason = document.createElement('div');
            reason.className = 'cr-reason';
            reason.textContent = req.motivo || req.notas || 'Sin motivo especificado.';

            // Mostrar preferencia del paciente si existe
            if (req.funcionario_nombre && req.funcionario_nombre.trim() !== '') {
                const pref = document.createElement('div');
                pref.className = 'cr-small cr-pref';
                pref.textContent = 'Preferencia: ' + req.funcionario_nombre;
                body.appendChild(pref);
            }

            // acciones ampliadas
            const footer = document.createElement('div');
            footer.className = 'cr-actions';
            const btnAuthorize = document.createElement('button');
            btnAuthorize.className = 'cr-btn authorize'; btnAuthorize.textContent = 'Autorizar';
            const btnConfirm = document.createElement('button');
            btnConfirm.className = 'cr-btn confirm'; btnConfirm.textContent = 'Confirmar';
            const btnReassign = document.createElement('button');
            btnReassign.className = 'cr-btn reassign'; btnReassign.textContent = 'Reasignar';
            const btnReject = document.createElement('button');
            btnReject.className = 'cr-btn decline'; btnReject.textContent = 'Rechazar';
            const btnCancel = document.createElement('button');
            btnCancel.className = 'cr-btn cancel'; btnCancel.textContent = 'Dar de baja';

            footer.append(btnAuthorize, btnConfirm, btnReassign, btnReject, btnCancel);

            body.append(top, reason, footer);
            card.append(avatar, body);
            grid.appendChild(card);

            // helper para enviar acción al backend
            async function sendAction(action, extra = {}) {
              try {
                const endpoint = '/back/recepcion/cita_action.php';
                const payload = Object.assign({ id: card.dataset.id, action }, extra);
                const res = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                  credentials: 'same-origin'
                });
                const text = await res.text();
                let data = {};
                try { data = JSON.parse(text); } catch (e) { console.error('Respuesta no-JSON', text); throw new Error('Respuesta inválida'); }
                if (!data.success) throw new Error(data.error || 'Error servidor');
                return data;
              } catch (err) {
                console.error('sendAction error', err);
                alert('Error: ' + (err.message || 'No se pudo completar la acción'));
                throw err;
              }
            }

            // acciones
            btnAuthorize.addEventListener('click', async () => {
              btnAuthorize.disabled = true;
              try {
                await sendAction('authorize');
                status.className = 'cr-status confirmed'; status.textContent = 'AUTORIZADA';
              } catch { btnAuthorize.disabled = false; }
            });

            btnConfirm.addEventListener('click', async () => {
              btnConfirm.disabled = true;
              try {
                await sendAction('confirm');
                status.className = 'cr-status confirmed'; status.textContent = 'CONFIRMADA';
              } catch { btnConfirm.disabled = false; }
            });

            // Reasignar -> abrir modal
            btnReassign.addEventListener('click', () => {
              const modal = document.getElementById('modalReassign');
              const fecha = document.getElementById('reassignFecha');
              const func = document.getElementById('reassignFuncionario');
              modal.style.display = 'flex';
              // usar el id correcto
              modal.dataset.targetId = card.dataset.id;
              // establecer valor inicial si la solicitud trae fecha
              if (req.fecha_hora) {
                const dt = req.fecha_hora.replace(' ', 'T').slice(0,16);
                fecha.value = dt;
              }
              // preseleccionar funcionario buscando por nombre (porque la tabla solicitud_cita no guarda funcionario_id)
              if (func) {
                // si hay un nombre preferido, buscar el id en window.FUNCIONARIOS
                if (req.funcionario_nombre && req.funcionario_nombre.trim() !== '') {
                  const wanted = req.funcionario_nombre.trim();
                  const match = (window.FUNCIONARIOS || []).find(f => {
                    const full = ((f.nombre || '') + ' ' + (f.apellido || '')).trim();
                    return full === wanted || (f.alias && f.alias === wanted);
                  });
                  if (match) func.value = match.id_funcionario ?? match.id ?? '';
                }
                // si de todos modos hay funcionario_id (no común) usarla como fallback
                else if (req.funcionario_id) {
                  func.value = req.funcionario_id;
                }
              }
            });

            // Rechazar -> abrir modal de motivo
            btnReject.addEventListener('click', () => {
              const modal = document.getElementById('modalReject');
              modal.style.display = 'flex';
              modal.dataset.targetId = card.dataset.id;
              document.getElementById('rejectReason').value = '';
            });

            // Dar de baja (cancelar) -> confirm prompt
            btnCancel.addEventListener('click', async () => {
              if (!confirm('¿Dar de baja esta solicitud?')) return;
              try {
                await sendAction('cancel');
                card.remove();
              } catch (err) { /* ya manejado en sendAction */ }
            });
          });

          root.appendChild(grid);
      };

    // modal handlers globales (rechazo y reasignar)
    document.addEventListener('click', (e) => {
      // cerrar modales al click fuera (simple)
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });

    // Rechazo
    const rejectCancel = document.getElementById('rejectCancel');
    const rejectSend = document.getElementById('rejectSend');
    if (rejectCancel) rejectCancel.addEventListener('click', () => document.getElementById('modalReject').style.display = 'none');
    if (rejectSend) rejectSend.addEventListener('click', async () => {
      const modal = document.getElementById('modalReject');
      const id = modal.dataset.targetId;
      const reason = document.getElementById('rejectReason').value.trim();
      if (!reason) return alert('Ingrese un motivo para el paciente.');
      try {
        await (async () => {
          const res = await fetch('/back/recepcion/cita_action.php', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ id, action: 'reject', reason }),
            credentials: 'same-origin'
          });
          const text = await res.text();
          const data = JSON.parse(text);
          if (!data.success) throw new Error(data.error || 'Error');
          return data;
        })();
        modal.style.display = 'none';
        // actualizar UI minimalmente: quitar o marcar rechazado
        const card = document.querySelector(`.cita-request[data-id="${id}"]`);
        if (card) {
          const st = card.querySelector('.cr-status');
          if (st) { st.className = 'cr-status pending'; st.textContent = 'RECHAZADA'; }
        }
      } catch (err) {
        alert('Error al rechazar: ' + (err.message || ''));
      }
    });

    // Reasignar
    const reassignCancel = document.getElementById('reassignCancel');
    const reassignSend = document.getElementById('reassignSend');
    if (reassignCancel) reassignCancel.addEventListener('click', () => document.getElementById('modalReassign').style.display = 'none');
    if (reassignSend) reassignSend.addEventListener('click', async () => {
      const modal = document.getElementById('modalReassign');
      const id = modal.dataset.targetId;
      const funcionario_id = document.getElementById('reassignFuncionario').value || null;
      const fecha_raw = document.getElementById('reassignFecha').value || null;
      if (!fecha_raw) return alert('Ingrese fecha y hora.');
      // Normalizar datetime-local a "YYYY-MM-DD HH:MM:SS"
      const fecha = fecha_raw.replace('T', ' ') + (fecha_raw.length === 16 ? ':00' : '');
      try {
        const res = await fetch('/back/recepcion/cita_action.php', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ id, action: 'reassign', new_funcionario_id: funcionario_id, new_fecha: fecha }),
          credentials: 'same-origin'
        });
        const text = await res.text();
        const data = JSON.parse(text);
        if (!data.success) throw new Error(data.error || 'Error');
        modal.style.display = 'none';
        // actualizar UI (mostrar nueva fecha / funcionario si llega en response)
        const card = document.querySelector(`.cita-request[data-id="${id}"]`);
        if (card && data.updated) {
          const when = card.querySelector('.cr-badge');
          if (when && data.updated.fecha_hora) when.textContent = data.updated.fecha_hora.replace(' ', ' · ');
          if (card.querySelector('.cr-small') && data.updated.funcionario_nombre) {
            // si existe preferencia mostrarla / actualizar
            const pref = card.querySelector('.cr-small');
            pref.textContent = 'Funcionario: ' + data.updated.funcionario_nombre;
          }
        }
      } catch (err) {
        alert('Error al reasignar: ' + (err.message || ''));
      }
    });

    /* -------------------- Activar secciones -------------------- */
    const sections = document.querySelectorAll(".section");
    const showSection = id => {
        sections.forEach(sec => sec.classList.remove("active"));
        const sec = document.getElementById(id);
        if (sec) sec.classList.add("active");
    };

    // helper para abrir target (acepta "#id" o "id")
    const openTarget = t => {
        if (!t) return;
        let id = String(t).trim();
        if (id.startsWith('#')) id = id.slice(1);
        showSection(id);
    };

    // 1) apoyo para botones que usan data-target="#section-..." (HTML añadido en recepcionista.php)
    document.querySelectorAll('[data-target]').forEach(btn => {
        btn.addEventListener('click', () => openTarget(btn.dataset.target));
    });

    // 2) compatibilidad con botones específicos por id (mapeo sencillo)
    const idButtonsMap = {
        "btn-pacientes": "section-pacientes",
        "btn-add-paciente": "section-add-paciente",
        "btn-citas": "section-citas",
        "btn-gestionar-citas": "section-citas",
        "btn-solicitudes-citas": "section-solicitudes-citas",
        "btn-facturacion": "section-facturacion",
        "btn-mensajes": "section-mensajes",
        "btn-edit-profile": "section-edit-profile",
        "btn-historial": "section-historial"
    };
    Object.entries(idButtonsMap).forEach(([btnId, target]) => {
        const b = document.getElementById(btnId);
        if (!b) return;
        b.addEventListener('click', () => showSection(target));
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

        if (!pacientes || pacientes.length === 0) {
            container.innerHTML = "<p>No hay pacientes registrados</p>";
            return;
        }

        pacientes.forEach(p => {
            const div = document.createElement("div");
            div.className = "user-card";

            // Determinar la foto, usando avatar por defecto si p.foto es nulo, vacío o whitespace
            const fotoPaciente = (p.foto && p.foto.trim() !== "") ? p.foto : '/front/assets/images/avatar.jpg';

            div.innerHTML = `
                <div class="user-img-wrapper">
                    <img src="${fotoPaciente}" alt="${p.nombre}" class="user-img"
                        onerror="this.onerror=null;this.src='/front/assets/images/avatar.jpg';">
                </div>
                <p><b>${p.nombre} ${p.apellido}</b></p>
                <p>${p.email}</p>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        showMessage("Error al cargar pacientes", "error");
    }
}
    
    /* -------------------- Form agregar paciente -------------------- */
    const addPacienteForm = document.getElementById("addPacienteForm");
    if (addPacienteForm) {
        addPacienteForm.addEventListener("submit", async e => {
            e.preventDefault(); // Evita recargar la página

            const formData = new FormData(addPacienteForm);

            try {
                const res = await fetch("/back/recepcionista/add_paciente.php", {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();

                if (data.success) {
                    alert("✅ Paciente agregado correctamente");
                    addPacienteForm.reset();
                    loadPacientes();
                } else {
                    alert("⚠️ Error: " + (data.error || "No se pudo agregar el paciente"));
                }
            } catch (err) {
                console.error(err);
                alert("❌ Error al conectar con el servidor");
            }
        });
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
    /* -------------------- Formulario agregar factura -------------------- */ 
    const addFacturaForm = document.getElementById("addFacturaForm"); 
    if (addFacturaForm) 
        { addFacturaForm.onsubmit = async e => 
            { e.preventDefault(); const formData = new FormData(addFacturaForm); 
                try { const res = await fetch("/back/recepcionista/add_factura.php", 
                    { method: "POST", body: formData }); 
                    const result = await res.json();
                    showMessage(result.message || result.mensaje, result.success ? "success" : "error"); 
                    if (result.success) { addFacturaForm.reset(); loadFacturas(); } } 
                    catch (err) { console.error(err); showMessage("Error al agregar factura", "error"); } }; }

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

    /* -------------------- Form agregar cita -------------------- */
    const addCitaForm = document.getElementById("addCitaForm");
    if (addCitaForm) {
        addCitaForm.addEventListener("submit", async e => {
            e.preventDefault(); // Evita que el form recargue la página

            // Convertir FormData a objeto normal
            const formData = Object.fromEntries(new FormData(addCitaForm));

            try {
                const res = await fetch("/back/recepcionista/add_cita.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData) // Mandar JSON al PHP
                });
                const data = await res.json();

                if (data.success) {
                    alert("✅ " + data.message);
                    addCitaForm.reset();
                    loadCitas(); // recargar lista
                } else {
                    alert("⚠️ " + data.message);
                }
            } catch (err) {
                console.error(err);
                alert("❌ Error de conexión con el servidor");
            }
        });
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
                { url: "/back/recepcionista/get_patients.php", select: "id_paciente", text: p => `${p.nombre} ${p.apellido}`, value: "id_paciente" },
                { url: "/back/recepcionista/get_sucursales.php", select: "id_sucursal", text: s => s.nombre, value: "id_sucursal" },
                { url: "/back/recepcionista/get_funcionarios.php", select: "id_funcionario", text: f => `${f.nombre} ${f.apellido}`, value: "id_funcionario" }
            ];
            for (let f of fetchData) {
                const res = await fetch(f.url);
                const data = await res.json();
                console.debug('loadSelects:', f.url, data); 
                const select = document.querySelector(`select[name='${f.select}']`);
                if (!select) continue;
                // Si no hay datos, no tocar el select (evita borrar opciones server-side)
                if (!Array.isArray(data) || data.length === 0) continue;
                select.innerHTML = "";
                data.forEach(item => {
                    const option = document.createElement("option");
                    // fallback por si el backend devuelve id_persona en vez de id_paciente/id_funcionario
                    const value = (item[f.value] !== undefined) ? item[f.value] : (item.id_persona ?? item.id_paciente ?? item.id_funcionario ?? '');
                    option.value = value;
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

    // Función para cargar solicitudes de cita
    async function loadCitaRequests() {
        const container = document.getElementById("citaRequestsList");
        if (!container) return;
        container.innerHTML = "<p>Cargando solicitudes...</p>";
        try {
            const res = await fetch("/back/recepcionista/get_cita_requests.php", { cache: "no-store" });
            const text = await res.text();
            // si el servidor devolvió HTML o warnings, lo mostramos en consola para depuración
            if (!res.ok) {
                console.error("get_cita_requests HTTP error", res.status, text);
                container.innerHTML = `<p class="error">Error servidor: ${res.status}</p>`;
                return;
            }
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                // respuesta no-JSON (ej: HTML de error, warnings, redirect a login)
                console.error("get_cita_requests: respuesta no JSON:", text);
                container.innerHTML = "<p class='error'>Respuesta inválida del servidor (ver consola)</p>";
                return;
            }
             container.innerHTML = "";
             if (!data.success) {
                 container.innerHTML = `<p class="error">${data.error || "Error al cargar solicitudes"}</p>`;
                 return;
             }
            const arr = Array.isArray(data.solicitudes) ? data.solicitudes : [];
            if (arr.length === 0) {
                container.innerHTML = "<p>No hay solicitudes pendientes</p>";
                return;
            }
            arr.forEach(s => {
                const card = document.createElement("div");
                card.className = "card solicitud-card";
                card.innerHTML = `
                    <p><strong>#${s.id_solicitud}</strong> - ${s.paciente_nombre} ${s.paciente_apellido}</p>
                    <p><strong>Sucursal:</strong> ${s.sucursal_nombre ?? 'No especificada'}</p>
                    <p><strong>Fecha preferida:</strong> ${s.fecha_hora ?? '-'}</p>
                    <p><strong>Motivo:</strong> ${s.notas ?? '-'}</p>
                    <p><strong>Preferencia:</strong> ${s.funcionario_nombre ?? '-'}</p>

                    <div class="actions" style="margin-top:8px;">
                        <button class="btn acceptRequest" data-id="${s.id_solicitud}">Aceptar</button>
                        <button class="btn rejectRequest" data-id="${s.id_solicitud}">Rechazar</button>
                    </div>
                `;
                container.appendChild(card);
            });

            // attach events
            document.querySelectorAll(".acceptRequest").forEach(b => {
                b.addEventListener("click", async () => {
                    const id = b.dataset.id;
                    b.disabled = true;
                    try {
                        const res = await fetch("/back/recepcionista/respond_cita_request.php", {
                            method: "POST",
                            credentials: "same-origin",               // <-- asegura enviar cookies/sesión
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id_solicitud: id, accion: "aceptar" })
                        });
                        const text = await res.text();
                        // si devuelve JSON lo parseamos, si no mostramos el HTML para depuración
                        try {
                            const r = JSON.parse(text);
                            if (r.success) {
                                alert(r.message || "Solicitud aceptada");
                                loadCitaRequests();
                                loadCitas();
                            } else {
                                alert("Error: " + (r.error || r.message || "no se pudo aceptar"));
                                console.error("Respuesta JSON:", r);
                            }
                        } catch (err) {
                            console.error("Respuesta no JSON al aceptar:", text);
                            alert("Respuesta inválida del servidor (ver consola).");
                        }
                    } catch (err) {
                        console.error("Error de red al aceptar:", err);
                        alert("Error de red");
                    } finally {
                        b.disabled = false;
                    }
                });
            });

            document.querySelectorAll(".rejectRequest").forEach(b => {
                b.addEventListener("click", async () => {
                    const id = b.dataset.id;
                    if (!confirm("¿Rechazar esta solicitud?")) return;
                    b.disabled = true;
                    try {
                        const res = await fetch("/back/recepcionista/respond_cita_request.php", {
                            method: "POST",
                            credentials: "same-origin",               // <-- asegura enviar cookies/sesión
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id_solicitud: id, accion: "rechazar" })
                        });
                        const text = await res.text();
                        try {
                            const r = JSON.parse(text);
                            if (r.success) {
                                alert(r.message || "Solicitud rechazada");
                                loadCitaRequests();
                            } else {
                                alert("Error: " + (r.error || r.message || "no se pudo rechazar"));
                                console.error("Respuesta JSON:", r);
                            }
                        } catch (err) {
                            console.error("Respuesta no JSON al rechazar:", text);
                            alert("Respuesta inválida del servidor (ver consola).");
                        }
                    } catch (err) {
                        console.error("Error de red al rechazar:", err);
                        alert("Error de red");
                    } finally {
                        b.disabled = false;
                    }
                });
            });

        } catch (err) {
            console.error("loadCitaRequests:", err);
            container.innerHTML = "<p class='error'>Error al cargar solicitudes</p>";
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

    // Añadir llamada al cargar
    loadCitas();
    loadManageCitas(); // <-- nueva llamada

    /* -------------------- Gestionar Citas (editar / dar de baja) -------------------- */
    async function loadManageCitas() {
        const container = document.getElementById("manageCitasList");
        if (!container) return;
        container.innerHTML = "<p>Cargando...</p>";
        try {
            const res = await fetch("/back/recepcionista/get_citas.php", { cache: "no-store" });
            const data = await res.json();
            container.innerHTML = "";
            if (!data.success) { container.innerHTML = `<p class="error">${data.error||'Error'}</p>`; return; }
            if (!Array.isArray(data.citas) || data.citas.length === 0) { container.innerHTML = "<p>No hay citas programadas</p>"; return; }

            const table = document.createElement("table");
            table.className = "table-managed-citas";
            table.innerHTML = `<thead><tr><th>ID</th><th>Paciente</th><th>Funcionario</th><th>Sucursal</th><th>Inicio</th><th>Fin</th><th>Acciones</th></tr></thead><tbody></tbody>`;
            const tbody = table.querySelector("tbody");

            data.citas.forEach(c => {
                const tr = document.createElement("tr");
                tr.dataset.id = c.id_cita;
                tr.innerHTML = `
                    <td>${c.id_cita}</td>
                    <td>${(c.paciente_nombre || '')} ${(c.paciente_apellido || '')}</td>
                    <td>${c.funcionario_nombre || '-'}</td>
                    <td>${c.sucursal_nombre || '-'}</td>
                    <td>${c.fecha_hora_inicio || '-'}</td>
                    <td>${c.fecha_hora_fin || '-'}</td>
                    <td>
                      <button class="btn btn-sm editCita" data-id="${c.id_cita}">Editar</button>
                      <button class="btn btn-sm deleteCita" data-id="${c.id_cita}">Dar de baja</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            container.appendChild(table);

            // handlers
            container.querySelectorAll(".editCita").forEach(b => b.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                openEditCitaModal(id);
            }));
            container.querySelectorAll(".deleteCita").forEach(b => b.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                if (!confirm("¿Dar de baja esta cita?")) return;
                try {
                    const res = await fetch("/back/recepcionista/delete_cita.php", {
                        method: "POST",
                        headers: {"Content-Type":"application/json"},
                        credentials: "same-origin",
                        body: JSON.stringify({ id_cita: id })
                    });
                    const txt = await res.text();
                    const j = JSON.parse(txt);
                    if (j.success) {
                        alert(j.message || "Cita dada de baja");
                        loadManageCitas(); loadCitas();
                    } else {
                        alert("Error: " + (j.error || j.message || "no se pudo eliminar"));
                    }
                } catch (err) {
                    console.error(err); alert("Error de red");
                }
            }));

        } catch (err) {
            console.error("loadManageCitas:", err);
            container.innerHTML = "<p class='error'>Error cargando citas</p>";
        }
    }

    async function openEditCitaModal(id) {
        // obtener datos de la cita desde backend (o buscar en tabla ya cargada)
        try {
            const res = await fetch(`/back/recepcionista/get_cita.php?id_cita=${encodeURIComponent(id)}`, { cache: "no-store" });
            const data = await res.json();
            if (!data.success) { alert("Error al obtener cita"); return; }
            const c = data.cita;
            // popular modal
            document.getElementById("edit_id_cita").value = c.id_cita;
            document.getElementById("edit_paciente").value = (c.paciente_nombre||'') + ' ' + (c.paciente_apellido||'');
            if (document.getElementById("edit_id_funcionario")) document.getElementById("edit_id_funcionario").value = c.id_funcionario ?? '';
            if (document.getElementById("edit_id_sucursal")) document.getElementById("edit_id_sucursal").value = c.sucursal_id ?? '';
            // convertir fecha string "YYYY-MM-DD HH:MM:SS" a datetime-local value "YYYY-MM-DDTHH:MM"
            function toLocal(dt){ if(!dt) return ''; const d = dt.split('.')[0]; return d.replace(' ', 'T').slice(0,16); }
            document.getElementById("edit_fecha_inicio").value = toLocal(c.fecha_hora_inicio ?? c.fecha_inicio ?? c.fecha);
            document.getElementById("edit_fecha_fin").value = toLocal(c.fecha_hora_fin ?? '');
            document.getElementById("modalEditCita").style.display = "flex";
        } catch (err) {
        console.error(err); alert("Error obteniendo cita");
        }
    }

    // handle modal form
    const editCitaForm = document.getElementById("editCitaForm");
    if (editCitaForm) {
        document.getElementById("editCancel").addEventListener("click", () => document.getElementById("modalEditCita").style.display = "none");
        editCitaForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("edit_id_cita").value;
            const payload = {
                id_cita: id,
                id_funcionario: document.getElementById("edit_id_funcionario").value || null,
                id_sucursal: document.getElementById("edit_id_sucursal").value || null,
                fecha_hora_inicio: (document.getElementById("edit_fecha_inicio").value || '').replace('T',' ') + (document.getElementById("edit_fecha_inicio").value.length===16?':00':''),
                fecha_hora_fin: (document.getElementById("edit_fecha_fin").value || '').replace('T',' ') + (document.getElementById("edit_fecha_fin").value.length===16?':00':'')
            };
            try {
                const res = await fetch("/back/recepcionista/update_cita.php", {
                    method: "POST",
                    headers: {"Content-Type":"application/json"},
                    credentials: "same-origin",
                    body: JSON.stringify(payload)
                });
                const txt = await res.text();
                const j = JSON.parse(txt);
                if (j.success) {
                    alert(j.message || "Cita actualizada");
                    document.getElementById("modalEditCita").style.display = "none";
                    loadManageCitas(); loadCitas();
                } else {
                    alert("Error: " + (j.error || j.message || "no se pudo actualizar"));
                }
            } catch (err) {
                console.error(err); alert("Error de red");
            }
        });
    }
});
