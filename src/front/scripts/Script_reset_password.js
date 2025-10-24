document.addEventListener('DOMContentLoaded', () => {
  const forgotForm = document.getElementById("forgotForm");
  const emailInput = document.getElementById("forgot-email");
  const emailError = document.getElementById("emailError");
  const mensaje = document.getElementById("mensaje");

  if (mensaje) mensaje.textContent = "";
  if (!forgotForm) return;

  // probar varias rutas hasta una que responda correctamente
  const endpointCandidates = [
    "../../back/auth/forgot_password.php", // desde pages/
    "/src/back/auth/forgot_password.php",
    "/back/auth/forgot_password.php",
    "/back/auth/forgot_password.php" // repetir por si el servidor mapea distinto
  ];

  async function postToEndpoint(body) {
    for (const ep of endpointCandidates) {
      try {
        const res = await fetch(ep, { method: "POST", body });
        const text = await res.text();
        // log para depuración
        console.debug("forgot_password try:", ep, "status:", res.status, "resp:", text.slice(0, 600));
        if (!res.ok) {
          // intentar siguiente candidato
          continue;
        }
        // intentar parsear JSON
        try {
          const data = JSON.parse(text);
          return { ok: true, data, endpoint: ep };
        } catch (err) {
          // respuesta no-JSON: devolver info para ver en consola
          return { ok: false, endpoint: ep, text };
        }
      } catch (err) {
        console.error("fetch error for", ep, err);
        // intentar siguiente candidato
        continue;
      }
    }
    return { ok: false, error: "No endpoint válido encontrado" };
  }

  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    emailError.textContent = "";
    mensaje.textContent = "";

    const email = (emailInput?.value || "").trim();
    if (!email) { emailError.textContent = "Ingresa un correo."; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailError.textContent = "Correo inválido."; return; }

    const btn = forgotForm.querySelector("button[type='submit']");
    if (btn) btn.disabled = true;
    mensaje.textContent = "Enviando...";

    try {
      const body = new URLSearchParams({ email });
      const result = await postToEndpoint(body);

      if (!result.ok) {
        console.error("forgot_password final error:", result);
        mensaje.style.color = "red";
        mensaje.textContent = result.error || "Respuesta no válida del servidor. Revisa la consola.";
        if (result.text) {
          // muestra parte del HTML/errores recibidos
          console.error("Servidor devolvió (no-JSON):", result.endpoint, result.text);
        }
        return;
      }

      const data = result.data;
      if (data.success) {
        mensaje.style.color = "green";
        mensaje.textContent = data.message || "Correo enviado. Revisa tu bandeja.";
        forgotForm.reset();
      } else {
        mensaje.style.color = "red";
        mensaje.textContent = data.error || "Error al enviar el correo.";
      }
    } catch (err) {
      console.error("forgot_password overall error:", err);
      mensaje.style.color = "red";
      mensaje.textContent = "Error de red. Intenta nuevamente.";
    } finally {
      if (btn) btn.disabled = false;
    }
  });
});