/**
 * cart.js — Mundo Stick
 * Módulo central del carrito usando sessionStorage.
 * Se borra automáticamente al cerrar la pestaña/navegador.
 */

const Cart = (() => {
  const KEY          = 'ms_cart';
  const LAST_KEY     = 'ms_last_added';

  const load = () => JSON.parse(sessionStorage.getItem(KEY) || '[]');
  const save = items => sessionStorage.setItem(KEY, JSON.stringify(items));
  const fmt  = n => n.toLocaleString('es-CO');

  /**
   * Añade o acumula un item al carrito.
   * @param {string}  pkgId     "pkg-10" | "pkg-20" | "pkg-40" | "pkg-custom"
   * @param {string}  pkgLabel  "x10" | "x20" | "x40" | "x{n}"
   * @param {number}  qty       cantidad de stickers
   * @param {number}  subtotal  precio total del paquete en COP
   * @param {boolean} isCombo   true = COMBO FAMILIAR, false = STICKER BENDECIDO
   */
  function addItem(pkgId, pkgLabel, qty, subtotal, isCombo) {
    const items    = load();
    const existing = items.find(i => i.id === pkgId);

    if (existing) {
      existing.qty      += qty;
      existing.subtotal += subtotal;
      existing.addedAt   = new Date().toISOString();
    } else {
      items.push({
        id:       pkgId,
        pkg:      pkgLabel,
        qty,
        subtotal,
        isCombo:  !!isCombo,
        addedAt:  new Date().toISOString()
      });
    }
    save(items);

    // Guarda el ÚLTIMO item añadido (para el cart-notice)
    sessionStorage.setItem(LAST_KEY, JSON.stringify({
      pkg:     pkgLabel,
      qty,
      subtotal,
      isCombo: !!isCombo
    }));

    return items;
  }

  function removeItem(pkgId) { save(load().filter(i => i.id !== pkgId)); }
  function clear() { sessionStorage.removeItem(KEY); sessionStorage.removeItem(LAST_KEY); }
  function getItems() { return load(); }
  function totalQty() { return load().reduce((s, i) => s + i.qty, 0); }
  function totalPrice() { return load().reduce((s, i) => s + i.subtotal, 0); }
  function getLastAdded() { return JSON.parse(sessionStorage.getItem(LAST_KEY) || 'null'); }

  function getOrderPayload() {
    return {
      items:      getItems(),
      totalQty:   totalQty(),
      totalPrice: totalPrice(),
      capturedAt: new Date().toISOString()
    };
  }

  return { addItem, removeItem, clear, getItems, totalQty, totalPrice, getLastAdded, getOrderPayload, fmt };
})();
