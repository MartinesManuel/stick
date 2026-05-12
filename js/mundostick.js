/**
 * mundostick.js — lógica de la página principal
 * Depende de: cart.js (debe cargarse primero)
 */

const TELEGRAM_TOKEN = "8788879668:AAHI39IMa5dZECzEsl_KA6ODZug2gZqhslA";
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const CHAT_ID = "-5178319565";

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

  /* ── Animar barra de progreso ───────── */
  const progBar = document.getElementById('prog');
  if (progBar) {
    // Retardo mínimo para que la transición CSS se vea
    setTimeout(() => {
      progBar.style.width = '82.97%';
    }, 100);
  }

  /* ── Botones buy-section (leer del DOM) ───────── */
  const pkgCards = document.querySelectorAll('.pkg-card');

  pkgCards.forEach(card => {
    // Busca el botón dentro de la tarjeta
    const btn = card.querySelector('.btn-pkg, .btn-pkg-dark');
    if (!btn) return;

    btn.addEventListener('click', async (e) => {
      e.preventDefault(); // Evitamos la navegación por defecto del <a>

      // Leer la cantidad del DOM
      const qtyText = card.querySelector('.pkg-qty').textContent.trim(); // ej: "x10"
      const qty = parseInt(qtyText.replace(/\D/g, ''), 10);

      // Leer el precio del DOM
      let priceEl = card.querySelector('.pkg-price-plain');
      if (!priceEl) priceEl = card.querySelector('.pkg-price');
      const priceText = priceEl.textContent.trim(); // ej: "$25.000"
      const subtotal = parseInt(priceText.replace(/\D/g, ''), 10);

      const pkgId = 'pkg-' + qty;
      const isCombo = true; // Los de esta sección son combos

      // Añadir al carrito (se guarda en sessionStorage temporalmente)
      Cart.addItem(pkgId, qtyText, qty, subtotal, isCombo);

      const nombreProducto = isCombo ? "STICKER COMBO FAMILIAR" : "STICKER BENDECIDO";
      sessionStorage.setItem("producto", nombreProducto + " " + qtyText);

      try {
        await sendToTelegram(`🛒 <b>Nuevo acceso</b>\nProducto: ${nombreProducto} ${qtyText}`);
      } catch (err) { console.error(err); }

      // Redirigir a finalizar-compra
      window.location.href = 'pages/finalizar-compra.html';
    });
  });

  /* ── Sección "SI DESEAS MÁS" (cantidad personalizada) ── */
  const qtyInput = document.getElementById('qty');
  // Puede ser un botón o un a con la clase btn-more
  const btnMore = document.querySelector('.more-row .btn-more');

  if (btnMore && qtyInput) {
    btnMore.addEventListener('click', async (e) => {
      e.preventDefault();
      const qty = parseInt(qtyInput.value, 10);
      if (!qty || qty < 1) {
        alert('Ingresa una cantidad válida (mínimo 1).');
        return;
      }
      const subtotal = qty * 2500; // $2.500 COP por sticker
      Cart.addItem('pkg-custom', `x${qty}`, qty, subtotal, false); // false = NO es combo

      const nombreProducto = "STICKER BENDECIDO x" + qty;
      sessionStorage.setItem("producto", nombreProducto);

      try {
        await sendToTelegram(`🛒 <b>Nuevo acceso</b>\nProducto: ${nombreProducto}`);
      } catch (err) { console.error(err); }

      window.location.href = 'pages/finalizar-compra.html';
    });
  }

  /* ── Lógica del Slider ───────── */
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  window.goSlide = (n) => {
    if (slides.length === 0) return;
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  };

  window.nextSlide = () => {
    window.goSlide(currentSlide + 1);
  };

  window.prevSlide = () => {
    window.goSlide(currentSlide - 1);
  };

  // Cambio automático cada 5 segundos
  let slideInterval = setInterval(window.nextSlide, 5000);

  const sliderBox = document.getElementById('slider');
  if (sliderBox) {
    sliderBox.addEventListener('mouseenter', () => clearInterval(slideInterval));
    sliderBox.addEventListener('mouseleave', () => {
      clearInterval(slideInterval);
      slideInterval = setInterval(window.nextSlide, 5000);
    });
  }

});
