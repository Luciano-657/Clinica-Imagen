document.addEventListener("DOMContentLoaded", () => {

    loadUsers();
    loadSucursales();
    loadPersonas();
    loadFuncionarios(); // Cargar funcionarios al inicio

    /* -------------------- Secciones -------------------- */
    const sections = document.querySelectorAll(".section");
    const showSection = id => {
        sections.forEach(sec => sec.classList.remove("active"));
        document.getElementById(id)?.classList.add("active");
    };

    document.getElementById("btn-users")?.addEventListener("click", () => showSection("section-users"));
    document.getElementById("btn-add-user")?.addEventListener("click", () => showSection("section-add-user"));
    document.getElementById("btn-edit-profile")?.addEventListener("click", () => showSection("section-edit-profile"));
    document.getElementById("btn-add-funcionario")?.addEventListener("click", () => showSection("section-add-funcionario"));
    document.getElementById("btn-list-funcionarios")?.addEventListener("click", () => {
        showSection("section-list-funcionarios");
        loadFuncionarios();
    });
    document.getElementById("btn-add-sucursal")?.addEventListener("click", () => showSection("section-add-sucursal"));
    document.getElementById("btn-list-sucursales")?.addEventListener("click", () => {
        showSection("section-list-sucursales");
        renderSucursalesList();
    });

    /* -------------------- Previsualización fotos -------------------- */
    const previewMap = [
        {input:"#fotoInputAdd", preview:"#fotoPreviewAdd"},
        {input:"#fotoInputEdit", preview:"#fotoPreviewEdit"},
        {input:"#fotoInputFuncionario", preview:"#fotoPreviewFuncionario"}
    ];
    previewMap.forEach(({input, preview}) => {
        document.querySelector(input)?.addEventListener("change", e => {
            const file = e.target.files[0];
            if(file){
                const reader = new FileReader();
                reader.onload = ev => {
                    document.querySelector(preview).src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    });

    /* -------------------- Agregar Usuario -------------------- */
    document.getElementById("addUserForm")?.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const res = await fetch("../../back/admin/add_users.php", { method:"POST", body:formData });
            const result = await res.json();
            showMessage(result.message, result.success ? "success" : "error");
            if(result.success){
                e.target.reset();
                document.querySelector("#fotoPreviewAdd").src = "/front/assets/images/default_user.png";
                loadUsers();
                showSection("section-users");
            }
        } catch(err){
            console.error(err);
            showMessage("Error de conexión","error");
        }
    });

    /* -------------------- Agregar Funcionario -------------------- */
    document.getElementById("addFuncionarioForm")?.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const res = await fetch("../../back/admin/add_funcionario.php", { method:"POST", body:formData });
            const result = await res.json();
            showMessage(result.message, result.success ? "success" : "error");
            if(result.success){
                e.target.reset();
                document.querySelector("#fotoPreviewFuncionario").src = "/front/assets/images/default_user.png";
                loadFuncionarios();
            }
        } catch(err){
            console.error(err);
            showMessage("Error de conexión","error");
        }
    });

    /* -------------------- Editar perfil -------------------- */
    const editForm = document.getElementById("editProfileForm");
    editForm?.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(editForm);
        try {
            const res = await fetch("../../back/admin/edit_profile.php", { method:"POST", body:formData });
            const result = await res.json();
            showMessage(result.message, result.success ? "success" : "error");
            if(result.success && result.foto){
                const sidebarImg = document.querySelector("#sidebarFotoAdmin");
                const previewImg = document.querySelector("#fotoPreviewEdit");
                if(sidebarImg) sidebarImg.src = result.foto;
                if(previewImg) previewImg.src = result.foto;
            }
        } catch(err){
            console.error(err);
            showMessage("Error de conexión","error");
        }
    });

    /* -------------------- Agregar Sucursal -------------------- */
    document.getElementById("addSucursalForm")?.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const res = await fetch("../../back/admin/add_sucursal.php", { method:"POST", body:formData });
            const result = await res.json();
            showMessage(result.message, result.success ? "success" : "error");
            if(result.success){
                e.target.reset();
                loadSucursales();
            }
        } catch(err){
            console.error(err);
            showMessage("Error de conexión","error");
        }
    });

});

/* -------------------- Cargar usuarios -------------------- */
async function loadUsers(){
    try {
        const res = await fetch("../../back/admin/get_users.php");
        const users = await res.json();
        const container = document.getElementById("usersList");
        container.innerHTML = "";
        users.forEach(u => {
            if(u.rol === 'admin') return;
            const div = document.createElement("div");
            div.classList.add("user-card");
            div.innerHTML = `
                <img src="${u.foto || '/front/assets/images/default_user.png'}" alt="${u.nombre}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">
                <p><b>${u.nombre} ${u.apellido}</b> (${u.rol})</p>
                <p>${u.correo || 'No tiene correo'}</p>
                <button onclick="deleteUser(${u.id_persona})">Eliminar</button>
            `;
            container.appendChild(div);
        });
    } catch(err){
        console.error(err);
        showMessage("Error al cargar usuarios","error");
    }
}

/* -------------------- Cargar funcionarios -------------------- */
async function loadFuncionarios(){
    try {
        const res = await fetch("../../back/admin/get_personas.php");
        const data = await res.json();
        const container = document.getElementById("funcionariosList");
        container.innerHTML = "";
        if(data.success && data.data.length > 0){
            data.data.forEach(f => {
                const div = document.createElement("div");
                div.classList.add("user-card");
                div.innerHTML = `
                    <img src="/${f.foto || 'front/assets/images/default_user.png'}" 
                        alt="${f.nombre}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">
                    <p><b>${f.nombre} ${f.apellido}</b> (${f.tipo_funcionario})</p>
                    <p>Sucursal: ${f.sucursal}</p>
                    <p>Correo: ${f.email || '-'}</p>
                    <button onclick="deleteFuncionario(${f.id_funcionario})">Eliminar</button>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = "<p>No hay funcionarios registrados</p>";
        }
    } catch(err){
        console.error(err);
        showMessage("Error al cargar funcionarios","error");
    }
}

/* -------------------- Eliminar usuario -------------------- */
async function deleteUser(id){
    if(!confirm("¿Eliminar este usuario?")) return;
    try {
        const res = await fetch("../../back/admin/delete_user.php", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({id})
        });
        const result = await res.json();
        showMessage(result.message, result.success ? "success" : "error");
        if(result.success) loadUsers();
    } catch(err){
        console.error(err);
        showMessage("Error de conexión","error");
    }
}

/* -------------------- Eliminar funcionario -------------------- */
async function deleteFuncionario(id){
    if(!confirm("¿Eliminar este funcionario?")) return;
    try {
        const res = await fetch("../../back/admin/delete_funcionario.php", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({id})
        });
        const result = await res.json();
        showMessage(result.message, result.success ? "success" : "error");
        if(result.success) loadFuncionarios();
    } catch(err){
        console.error(err);
        showMessage("Error de conexión","error");
    }
}

/* -------------------- Mensajes flotantes -------------------- */
function showMessage(msg, type="success"){
    const container = document.querySelector(".toast-container") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast ${type} show`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function createToastContainer(){
    const container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
    return container;
}

/* -------------------- Cargar sucursales en selects y lista -------------------- */
let sucursalesCache = [];
async function loadSucursales(){
    try {
        const res = await fetch("../../back/admin/get_sucursales.php");
        const sucursales = await res.json();
        sucursalesCache = sucursales;

        const selects = [
            document.querySelector('select[name="sucursal_id"]'),
            document.querySelector('#sucursalSelectFuncionario')
        ];
        selects.forEach(sel => {
            if(sel){
                sel.innerHTML = `<option value="">Seleccione una sucursal</option>`;
                sucursales.forEach(s => sel.innerHTML += `<option value="${s.id_sucursal}">${s.nombre}</option>`);
            }
        });
    } catch(err){
        console.error(err);
        showMessage("Error al cargar sucursales","error");
    }
}

/* -------------------- Renderizar lista de sucursales -------------------- */
function renderSucursalesList(){
    const container = document.getElementById("sucursalesList");
    container.innerHTML = "";
    sucursalesCache.forEach(s => {
        const div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
            <h4>${s.nombre}</h4>
            <p>Dirección: ${s.direccion}</p>
            <p>Teléfono: ${s.telefono || '-'}</p>
            <p>Horario: ${s.horario_apertura} - ${s.horario_cierre}</p>
        `;
        container.appendChild(div);
    });
}

/* -------------------- Cargar personas disponibles para funcionario -------------------- */
async function loadPersonas(){
    try {
        const res = await fetch("../../back/admin/get_personas.php");
        const personas = await res.json();
        const select = document.querySelector('#addFuncionarioForm select[name="persona_id"]');
        if(select){
            select.innerHTML = `<option value="">Seleccione persona</option>`;
            personas.forEach(p => select.innerHTML += `<option value="${p.id_persona}">${p.nombre} ${p.apellido}</option>`);
        }
    } catch(err){
        console.error(err);
        showMessage("Error al cargar personas","error");
    }
}
