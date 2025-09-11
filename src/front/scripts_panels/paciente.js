document.addEventListener("DOMContentLoaded", () => {

    // -------------------------
    // Manejo de secciones
    // -------------------------
    const botones = document.querySelectorAll(".sidebar-nav button");
    const secciones = document.querySelectorAll(".section");

    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.id.replace("btn-", "section-");
            secciones.forEach(sec => sec.classList.remove("active"));
            const seccionActiva = document.getElementById(target);
            if(seccionActiva) seccionActiva.classList.add("active");
        });
    });

    // -------------------------
    // Previsualización de la foto
    // -------------------------
    const fotoInput = document.getElementById("fotoInput");
    const previewFoto = document.getElementById("previewFoto");

    if(fotoInput && previewFoto){
        fotoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if(file){
                const reader = new FileReader();
                reader.onload = function(ev){
                    previewFoto.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // -------------------------
    // Formulario de perfil
    // -------------------------
    const editProfileForm = document.getElementById("editProfileForm");
    if(editProfileForm){
        editProfileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(editProfileForm);

            fetch("../../back/paciente/update_profile.php", {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                showToast(data.message, data.success);
                // Actualizar foto en la interfaz si se cargó nueva
                if(data.success && data.foto){
                    const img = document.getElementById("previewFoto");
                    if(img) img.src = "/" + data.foto + "?t=" + new Date().getTime();
                }
            })
            .catch(err => showToast("Error al guardar cambios", false));
        });
    }

    // -------------------------
    // Función Toast
    // -------------------------
    function showToast(message, success=true){
        const container = document.querySelector(".toast-container") || createToastContainer();
        const toast = document.createElement("div");
        toast.className = `toast ${success ? "success" : "error"}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(()=>{ toast.classList.add("show"); }, 50);
        setTimeout(()=>{ 
            toast.classList.remove("show"); 
            setTimeout(()=> toast.remove(), 400);
        }, 3000);
    }

    function createToastContainer(){
        const container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
        return container;
    }

});
