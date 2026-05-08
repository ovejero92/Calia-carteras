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
