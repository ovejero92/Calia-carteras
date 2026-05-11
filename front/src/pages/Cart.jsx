import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const Cart = () => {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <ShoppingBagIcon className="w-14 h-14 text-neutral-300 mx-auto mb-5" />
        <h2 className="font-editorial text-2xl sm:text-3xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Tu bolsa está vacía
        </h2>
        <p className="text-sm opacity-55 mb-8 leading-relaxed">Agregá piezas desde el catálogo — te van a quedar incluso mejor en persona.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-transform active:scale-[0.98]"
          style={{ background: 'var(--color-primary)' }}
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <h1 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight mb-10" style={{ color: 'var(--color-text)' }}>
        Tu bolsa
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const imageUrl = item.image || '/placeholder-product.svg';
            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl border border-black/[0.07] shadow-sm"
                style={{ background: 'var(--color-card-bg)' }}
              >
                <div className="flex gap-4">
                  <div className="w-24 h-28 sm:w-28 sm:h-32 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.svg';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold mb-1 leading-snug" style={{ color: 'var(--color-text)' }}>
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(item.price)} c/u
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 border border-black/10 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-1.5 border border-black/10 rounded-lg min-w-12 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 border border-black/10 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0">
                    <div className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                      aria-label="Quitar"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-semibold text-red-600 hover:text-red-800"
            >
              Vaciar carrito
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-black/[0.07] p-6 sm:p-7 sticky top-24 shadow-sm" style={{ background: 'var(--color-card-bg)' }}>
            <h3 className="text-base font-semibold mb-5" style={{ color: 'var(--color-text)' }}>
              Resumen
            </h3>

            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between opacity-75">
                <span>Productos ({itemCount})</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between opacity-75">
                <span>Envío</span>
                <span className="font-medium">A coordinar</span>
              </div>
            </div>

            <div className="border-t border-black/10 pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full text-white px-6 py-3.5 rounded-full font-semibold text-sm transition-transform active:scale-[0.98]"
              style={{ background: 'var(--color-card-btn-bg, var(--color-primary))', color: 'var(--color-card-btn-text, #fff)' }}
            >
              Proceder al pago
            </button>

            <Link
              to="/catalog"
              className="block text-center mt-5 text-sm font-semibold opacity-55 hover:opacity-90 transition-opacity"
              style={{ color: 'var(--color-primary)' }}
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;