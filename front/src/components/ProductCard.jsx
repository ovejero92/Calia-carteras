import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

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

  const imageUrl = product.image
    ? `http://localhost:3050${product.image}`
    : '/placeholder-product.svg';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-product.svg';
            }}
          />
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