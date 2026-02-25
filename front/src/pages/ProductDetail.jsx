import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { ShoppingBagIcon, ArrowLeftIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        if (response.data.status === 'success') {
          setProduct(response.data.data);
        }
      } catch (err) {
        setError('Error al cargar el producto');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || quantity <= 0) return;

    setAddingToCart(true);
    try {
      addItem(product, quantity);
      // Aquí podrías mostrar un toast de éxito
    } finally {
      setAddingToCart(false);
    }
  };

  const updateQuantity = (newQuantity) => {
    const clampedQuantity = Math.max(1, Math.min(newQuantity, product.stock));
    setQuantity(clampedQuantity);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 text-lg mb-4">
          {error || 'Producto no encontrado'}
        </div>
        <button
          onClick={() => navigate('/catalog')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const imageUrl = product.image
    ? `http://localhost:3050${product.image}`
    : '/placeholder-product.svg';

  return (
    <div>
      {/* Botón volver */}
      <button
        onClick={() => navigate('/catalog')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span>Volver al catálogo</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Imagen del producto */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-product.svg';
              }}
            />
          </div>
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Estado del stock */}
          <div className="flex items-center space-x-2">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">
                ✓ En stock ({product.stock} unidades)
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                ✗ Agotado
              </span>
            )}
          </div>

          {/* Características */}
          {product.characteristics && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Características</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.characteristics).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">{key}</div>
                    <div className="font-medium text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selector de cantidad y agregar al carrito */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Cantidad:
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-12">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>
                  {addingToCart ? 'Agregando...' : `Agregar al carrito - ${formatPrice(product.price * quantity)}`}
                </span>
              </button>
            </div>
          )}

          {/* Descripción adicional */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Información del producto
            </h3>
            <p className="text-gray-600">
              Producto de alta calidad con materiales premium. Ideal para uso diario o ocasiones especiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;