document.addEventListener("DOMContentLoaded", () => {
    loadPacientes();
    loadFacturas();
    loadSelects();

    /* -------------------- Activar secciones -------------------- */
    const sections = document.querySelectorAll(".section");
    const buttons = {
        pacientes: document.getElementById("btn-pacientes"),
        addPaciente: document.getElementById("btn-add-paciente"),
        citas: document.getElementById("btn-citas"),
        facturacion: document.getElementById("btn-facturacion"),
        mensajes: document.getElementById("btn-mensajes"),
        editProfile: document.getElementById("btn-edit-profile")
    };

    const showSection = (id) => {
        sections.forEach(sec => sec.classList.remove("active"));
        const sec = document.getElementById(id);
        if (sec) sec.classList.add("active");
    };

    Object.entries(buttons).forEach(([key, btn]) => {
        if (btn) btn.addEventListener("click", () => showSection(`section-${key}`));
    });

    /* -------------------- Previsualización de foto -------------------- */
    const fotoInput = document.getElementById("fotoInput");
    const previewFoto = document.getElementById("previewFoto");

    if(fotoInput && previewFoto){
        fotoInput.addEventListener("change", () => {
            const file = fotoInput.files[0];
            if(file){
                previewFoto.src = URL.createObjectURL(file);
            }
        });
    }

    /* -------------------- Form editar perfil -------------------- */
    const editProfileForm = document.getElementById("editProfileForm");
    if(editProfileForm){
        editProfileForm.onsubmit = async (e)=>{
            e.preventDefault();
            const formData = new FormData(editProfileForm);

            try{
                const res = await fetch("/back/recepcionista/edit_profile.php", { method: "POST", body: formData });
                const result = await res.json();

                showMessage(result.mensaje || result.message, result.success?"success":"error");

                if(result.success && result.foto){
                    const img = document.querySelector(".user-photo img");
                    img.src = "/" + result.foto + "?t=" + new Date().getTime();
                    previewFoto.src = img.src;
                }
            }catch(err){
                console.error(err);
                showMessage("Error de conexión al actualizar perfil","error");
            }
        }
    }

    /* -------------------- Funciones de pacientes, facturas y selects -------------------- */
    async function loadPacientes() {
        try {
            const res = await fetch("/back/recepcionista/get_patients.php");
            const pacientes = await res.json();
            const container = document.getElementById("pacientesList");
            if (!container) return;
            container.innerHTML = "";
            pacientes.forEach(p => {
                const div = document.createElement("div");
                div.className = "user-card";
                const fotoPaciente = p.foto ? "/" + p.foto : "/front/assets/images/default_user.png";
                div.innerHTML = `<img src="${fotoPaciente}" alt="${p.nombre}" class="user-img">
                                <p><b>${p.nombre} ${p.apellido}</b></p><p>${p.email}</p>`;
                container.appendChild(div);
            });
        } catch (err) { console.error(err); showMessage("Error al cargar pacientes","error"); }
    }

    async function loadFacturas() {
        try {
            const res = await fetch("/back/recepcionista/get_facturas.php");
            const facturas = await res.json();
            const container = document.getElementById("facturasList");
            if (!container) return;
            container.innerHTML = "";
            facturas.forEach(f => {
                const div = document.createElement("div");
                div.className = "factura-card";
                div.innerHTML = `<p><b>Paciente:</b> ${f.paciente}</p><p><b>Monto:</b> $${f.monto_total}</p><p><b>Estado:</b> ${f.estado}</p>`;
                container.appendChild(div);
            });
        } catch (err) { console.error(err); showMessage("Error al cargar facturas","error"); }
    }

    async function loadSelects() {
        try {
            const fetchData = [
                { url: "/back/recepcionista/get_patients.php", select: "paciente_id", text: p => `${p.nombre} ${p.apellido}`, value: "id_persona" },
                { url: "/back/recepcionista/get_sucursales.php", select: "sucursal_id", text: s => s.nombre, value: "id_sucursal" },
                { url: "/back/recepcionista/get_funcionarios.php", select: "funcionario_id", text: f => `${f.nombre} ${f.apellido}`, value: "id_persona" }
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
        } catch (err) { console.error(err); showMessage("Error al cargar listas","error"); }
    }

    /* -------------------- Mensajes flotantes -------------------- */
    function getToastContainer() {
        let container = document.querySelector(".toast-container");
        if (!container) {
            container = document.createElement("div");
            container.className = "toast-container";
            document.body.appendChild(container);
        }
        return container;
    }

    function showMessage(message,type="success"){
        const container=getToastContainer();
        const msg=document.createElement("div");
        msg.className=`toast ${type}`;
        msg.textContent=message;
        container.appendChild(msg);
        setTimeout(()=>msg.classList.add("show"),50);
        setTimeout(()=>msg.classList.remove("show"),4000);
        setTimeout(()=>msg.remove(),4500);
    }
});
