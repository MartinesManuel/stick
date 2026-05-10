/**
 * carrito.js — lógica de la página del carrito
 * Depende de: cart.js (debe cargarse primero)
 */

document.addEventListener('DOMContentLoaded', () => {
  const items = Cart.getItems();
  const mainEl = document.querySelector('.main-content');

  /* Si el carrito está vacío, mostramos el estado vacío (ya existe en el HTML) */
  if (items.length === 0) {
    document.getElementById('cart-filled').style.display = 'none';
    document.getElementById('cart-empty').style.display  = 'flex';
    return;
  }

  /* Hay items — ocultamos el estado vacío y renderizamos la tabla */
  document.getElementById('cart-empty').style.display  = 'none';
  document.getElementById('cart-filled').style.display = 'block';

  const tbody    = document.getElementById('cart-tbody');
  const subtotal = document.getElementById('cart-subtotal');
  const total    = document.getElementById('cart-total');
  const btnChk   = document.getElementById('btn-checkout');

  /* Renderiza filas */
  tbody.innerHTML = '';
  items.forEach(item => {
    const name = item.isCombo ? 'STICKER COMBO FAMILIAR' : 'STICKER BENDECIDO';
    const unitPrice = item.subtotal / item.qty;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${name}</strong><br>
        <small>Paquete ${item.pkg}</small>
      </td>
      <td style="text-align:center">${item.qty}</td>
      <td style="text-align:right">$${Cart.fmt(unitPrice)}</td>
      <td style="text-align:right">$${Cart.fmt(item.subtotal)}</td>
      <td style="text-align:center">
        <button class="btn-remove" data-id="${item.id}" title="Eliminar">✕</button>
      </td>`;
    tbody.appendChild(tr);
  });

  /* Totales */
  const tot = Cart.totalPrice();
  subtotal.textContent = `$${Cart.fmt(tot)}`;
  total.textContent    = `$${Cart.fmt(tot)}`;

  /* Eliminar item */
  tbody.addEventListener('click', e => {
    const btn = e.target.closest('.btn-remove');
    if (!btn) return;
    Cart.removeItem(btn.dataset.id);
    location.reload();
  });

  /* Ir a finalizar compra */
  if (btnChk) {
    btnChk.addEventListener('click', () => {
      window.location.href = 'finalizar-compra.html';
    });
  }
});
