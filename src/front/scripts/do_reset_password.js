document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const form = document.getElementById('resetForm');
  const msg = document.getElementById('mensaje');

  if (!form) return;
  if (!msg) return;

  if (!token) {
    msg.style.color = 'red';
    msg.textContent = 'Token inválido o faltante.';
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('new-password').value.trim();
    const pw2 = document.getElementById('confirm-password').value.trim();
    if (pw.length < 6 || pw !== pw2) {
      msg.style.color = 'red';
      msg.textContent = 'Las contraseñas deben coincidir y tener al menos 6 caracteres.';
      return;
    }
    msg.style.color = '';
    msg.textContent = 'Enviando...';
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      const res = await fetch('../../back/auth/reset_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pw })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('reset_password: respuesta no JSON:', text);
        msg.style.color = 'red';
        msg.textContent = 'Respuesta inesperada del servidor. Ver consola.';
        return;
      }

      if (data.success) {
        msg.style.color = 'green';
        msg.textContent = data.message || 'Contraseña cambiada.';
        setTimeout(() => window.location.href = 'login.html', 1500);
      } else {
        msg.style.color = 'red';
        msg.textContent = data.error || 'Error al cambiar contraseña.';
      }
    } catch (err) {
      console.error('reset fetch error', err);
      msg.style.color = 'red';
      msg.textContent = 'Error de red.';
    } finally {
      if (btn) btn.disabled = false;
    }
  });
});