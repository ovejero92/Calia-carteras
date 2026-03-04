import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);

  // ✅ Armamos el array de imágenes igual que en ProductDetail
  // Si tiene el array images lo usamos, sino usamos image como fallback
  const images = product.images?.length > 0
    ? product.images
    : (product.image ? [product.image] : ['/placeholder-product.svg']);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  // ✅ Al hacer hover, arranca un intervalo que cicla las fotos cada 800ms
  const handleMouseEnter = () => {
    if (images.length <= 1) return; // Si hay una sola foto, no hacer nada
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 800);
  };

  // ✅ Al salir del hover, para el intervalo y vuelve a la primera foto
  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentImageIndex(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`} className="block">
        <div
          className="aspect-square bg-gray-100 relative overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => { e.target.src = '/placeholder-product.svg'; }}
          />

          {/* Indicador de foto actual cuando hay varias (puntitos) */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badge cantidad de fotos */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              📷 {images.length}
            </div>
          )}

          {/* Badges de stock */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              ¡Últimas unidades!
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Agotado
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>

          {product.characteristics && (
            <div className="text-sm text-gray-600 mb-2">
              {product.characteristics.Marca && (
                <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1 mb-1">
                  {product.characteristics.Marca}
                </span>
              )}
              {product.characteristics.Color && (
                <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1 mb-1">
                  {product.characteristics.Color}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <ShoppingBagIcon className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Stock: {product.stock} unidades
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;