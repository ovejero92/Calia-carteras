/** Mensaje legible desde respuestas del backend (axios error). */
export function getApiErrorMessage(error) {
  const status = error.response?.status;
  const d = error.response?.data;

  if (status === 429) {
    return 'Demasiados intentos. Esperá unos minutos y volvé a intentar.';
  }

  if (d?.errors?.length) {
    return d.errors.map((e) => e.message || e.msg || '').filter(Boolean).join(' ');
  }

  if (typeof d?.error === 'string') return d.error;

  if (error.message === 'Network Error') {
    return 'Sin conexión. Revisá tu internet e intentá de nuevo.';
  }

  return 'No pudimos completar la operación. Intentá de nuevo.';
}
