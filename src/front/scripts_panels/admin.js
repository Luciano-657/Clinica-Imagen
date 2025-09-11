document.addEventListener("DOMContentLoaded", () => {
    loadUsers();

    /* -------------------- Activar secciones -------------------- */
    const sections = document.querySelectorAll(".section");
    const btnUsers = document.getElementById("btn-users");
    const btnAddUser = document.getElementById("btn-add-user");
    const btnEditProfile = document.getElementById("btn-edit-profile");

    function showSection(sectionId) {
        sections.forEach(sec => sec.classList.remove("active"));
        const sec = document.getElementById(sectionId);
        if (sec) sec.classList.add("active");
    }

    if (btnUsers) btnUsers.addEventListener("click", () => showSection("section-users"));
    if (btnAddUser) btnAddUser.addEventListener("click", () => showSection("section-add-user"));
    if (btnEditProfile) btnEditProfile.addEventListener("click", () => showSection("section-edit-profile"));

    /* -------------------- Previsualización de imagen al editar perfil -------------------- */
    const fotoInput = document.getElementById("fotoInput");
    const fotoPreview = document.getElementById("fotoPreview");

    if(fotoInput && fotoPreview){
        fotoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if(file){
                const reader = new FileReader();
                reader.onload = (ev) => {
                    fotoPreview.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    /* -------------------- Form editar perfil -------------------- */
    const editProfileForm = document.getElementById("editProfileForm");
    if (editProfileForm) {
        editProfileForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(editProfileForm);

            try {
                const res = await fetch("/back/admin/edit_profile.php", {
                    method: "POST",
                    body: formData,
                });

                const result = await res.json();

                showMessage(result.mensaje || result.message, result.success ? "success" : "error");

                if (result.success && result.foto) {
                    const img = document.querySelector(".admin-photo img");
                    img.src = "/" + result.foto + "?t=" + new Date().getTime();
                    fotoPreview.src = img.src;
                }
            } catch (err) {
                console.error(err);
                showMessage("Error de conexión al actualizar perfil", "error");
            }
        };
    }

    /* -------------------- Cargar usuarios -------------------- */
    async function loadUsers() {
        try {
            const res = await fetch("/back/admin/get_users.php");
            const users = await res.json();

            const container = document.getElementById("usersList");
            if (!container) return;

            container.innerHTML = "";
            users.forEach((u) => {
                const div = document.createElement("div");
                div.classList.add("user-card");
                const fotoUsuario = u.foto ? "/" + u.foto : "/front/assets/images/default_user.png";
                div.innerHTML = `
                    <img src="${fotoUsuario}" alt="Foto de ${u.nombre}" class="user-img">
                    <p><b>${u.nombre} ${u.apellido}</b> (${u.rol})</p>
                    <p>${u.email}</p>
                    <button onclick="deleteUser(${u.id})">Eliminar</button>
                `;
                container.appendChild(div);
            });
        } catch (err) {
            console.error(err);
            showMessage("Error al cargar usuarios", "error");
        }
    }

    /* -------------------- Eliminar usuario -------------------- */
    window.deleteUser = async function(id) {
        if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

        try {
            const res = await fetch("/back/admin/delete_user.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const result = await res.json();
            showMessage(result.mensaje || result.message, result.success ? "success" : "error");
            if (result.success) loadUsers();
        } catch (err) {
            console.error(err);
            showMessage("Error de conexión al eliminar usuario", "error");
        }
    };

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

    function showMessage(message, type = "success") {
        const container = getToastContainer();
        const msg = document.createElement("div");
        msg.className = `toast ${type}`;
        msg.textContent = message;
        container.appendChild(msg);

        setTimeout(() => msg.classList.add("show"), 50);
        setTimeout(() => msg.classList.remove("show"), 4000);
        setTimeout(() => msg.remove(), 4500);
    }
});
