import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeItem, total } = useCart();
  const settings = useSettings();
  const navigate = useNavigate();

  const accent = settings?.colors?.primary || '#c8a4a0';
  const fontFamily = settings?.typography?.fontFamily || 'inherit';

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end" style={{ fontFamily }}>
      <div 
        className="absolute inset-0 transition-opacity" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.75)', 
          backdropFilter: 'blur(4px)' 
        }} 
        onClick={() => setIsCartOpen(false)}
      />

      <div 
        className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform"
        style={{ animation: 'slideRight 0.3s ease-out forwards' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight">Tu Carrito</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
              <ShoppingBagIcon className="w-16 h-16 opacity-50" />
              <p>Tu carrito está vacío</p>
              <button
                onClick={() => { setIsCartOpen(false); navigate('/catalog'); }}
                className="mt-4 px-6 py-2 text-sm font-semibold rounded-full"
                style={{ background: accent, color: '#fff' }}
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    <img 
                      src={item.image || '/placeholder-product.svg'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      onError={e => e.target.src='/placeholder-product.svg'}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 leading-snug pr-4">{item.name}</h3>
                        <p className="text-sm font-bold mt-1" style={{ color: accent }}>
                          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.price)}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button 
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
                        >
                          <MinusIcon className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                        <button 
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
                        >
                          <PlusIcon className="w-3 h-3" />
                        </button>
                      </div>
                      {item.stock !== undefined && item.quantity >= item.stock && (
                        <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">Máximo</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total)}
              </span>
            </div>
            
            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate('/cart');
              }}
              className="w-full py-4 text-center rounded-xl font-bold tracking-wide text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: accent, color: '#fff' }}
            >
              Entrar al carrito
            </button>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
};

export default CartDrawer;
