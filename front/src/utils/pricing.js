/** Precio unitario efectivo (misma regla que el servidor y el carrito). */
export function effectiveUnitPrice(product) {
  if (!product) return 0;
  const discountPct = Number(product.discount) || 0;
  const list = Number(product.price) || 0;
  if (discountPct > 0) {
    return Math.round(list * (1 - discountPct / 100) * 100) / 100;
  }
  return list;
}

const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Texto tipo "12x 5.375" para cuotas sin interés (referencia visual). */
export function formatInstallments(finalPrice, months = 12) {
  const n = Number(finalPrice);
  if (!n || n <= 0 || months < 1) return '';
  const per = n / months;
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: per >= 100 ? 0 : 2,
  }).format(per);
  return `${months}x ${formatted} sin interés`;
}

export function formatMoneyARS(value) {
  return ars.format(Number(value) || 0);
}
