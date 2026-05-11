import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { effectiveUnitPrice, formatInstallments, formatMoneyARS } from '../utils/pricing';
import { toast } from 'sonner';
import {
  ShoppingBagIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  TruckIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';

const HIDDEN_KEYS = ['género', 'genero', 'marca', 'brand', 'gender'];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        if (response.data.status === 'success') {
          setProduct(response.data.data);
          const relatedResponse = await api.get(`/products/${id}/related`);
          if (relatedResponse.data.status === 'success') {
            setRelatedProducts(relatedResponse.data.data);
          }
        }
      } catch (err) {
        setError('Error al cargar el producto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    setSelectedImage(0);
  }, [product]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);

  const updateQuantity = (newQuantity) => {
    setQuantity(Math.max(1, Math.min(newQuantity, product.stock)));
  };

  const handleAddToCart = async () => {
    if (!product || quantity <= 0) return;
    setAddingToCart(true);
    try {
      addItem(product, quantity);
      const lineTotal = effectiveUnitPrice(product) * quantity;
      toast.success(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} — ${formatPrice(lineTotal)}`, {
        description: 'Podés revisar el carrito cuando quieras',
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 text-lg mb-4">{error || 'Producto no encontrado'}</p>
        <button
          onClick={() => navigate('/catalog')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : [product.image || '/placeholder-product.svg'];

  const finalPrice = effectiveUnitPrice(product);

  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const visibleCharacteristics = product.characteristics
    ? Object.entries(product.characteristics).filter(
        ([key]) => !HIDDEN_KEYS.includes(key.toLowerCase().trim())
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto pb-12">

      <button
        type="button"
        onClick={() => navigate('/catalog')}
        className="inline-flex items-center gap-1.5 text-sm opacity-55 hover:opacity-100 transition mb-8"
        style={{ color: 'var(--color-text)' }}
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Volver al catálogo
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

        <div className="space-y-3">

          <div
            className="aspect-[4/5] lg:aspect-square bg-neutral-100 rounded-3xl overflow-hidden relative group cursor-zoom-in border border-black/[0.06]"
            onMouseMove={(e) => {
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
              const x = ((e.pageX - left) / width) * 100;
              const y = ((e.pageY - top) / height) * 100;
              e.currentTarget.style.setProperty('--x', `${x}%`);
              e.currentTarget.style.setProperty('--y', `${y}%`);
            }}
          >
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-150"
              style={{ transformOrigin: 'var(--x, 50%) var(--y, 50%)' }}
              onError={(e) => { e.target.src = '/placeholder-product.svg'; }}
            />

            {images.length > 1 && (
              <>
                {selectedImage > 0 && (
                  <button
                    onClick={() => setSelectedImage((p) => p - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow transition"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                  </button>
                )}
                {selectedImage < images.length - 1 && (
                  <button
                    onClick={() => setSelectedImage((p) => p + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow transition"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.flags?.isNew && (
                <span className="bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  NUEVO
                </span>
              )}
              {product.flags?.isBestSeller && (
                <span className="bg-amber-400 text-black text-xs font-semibold px-2.5 py-1 rounded-full">
                  ⭐ MÁS VENDIDO
                </span>
              )}
            </div>

            {hasDiscount && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{product.discount}%
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === index
                      ? 'border-primary-600 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/placeholder-product.svg'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">

          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold leading-tight tracking-tight" style={{ color: 'var(--color-text)' }}>
            {product.name}
          </h1>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-3">
              {hasDiscount && (
                <span className="text-base text-neutral-400 line-through">
                  {formatMoneyARS(product.price)}
                </span>
              )}
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--color-card-price, #1d4ed8)' }}
              >
                {formatMoneyARS(finalPrice)}
              </span>
            </div>
            <p className="text-sm text-neutral-500">{formatInstallments(finalPrice)}</p>
          </div>

          <div className="text-sm font-medium">
            {product.stock > 0 ? (
              <span className="text-emerald-600">
                {product.stock === 1
                  ? '✓ ¡Última unidad!'
                  : product.stock <= 5
                  ? `✓ Quedan pocas unidades (${product.stock})`
                  : '✓ En stock'}
              </span>
            ) : (
              <span className="text-red-500">✗ Sin stock</span>
            )}
          </div>

          {product.description && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Descripción
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {visibleCharacteristics.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Características
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {visibleCharacteristics.map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-50 rounded-lg px-3 py-2 flex flex-col"
                  >
                    <span className="text-xs text-gray-400">{key}</span>
                    <span className="text-sm font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 py-4 border-y border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <TruckIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>Retiro o envío a domicilio</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <CreditCardIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>Pagá en cuotas — consultá monto mínimo</span>
            </div>
          </div>

          {product.stock > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Cantidad:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full flex items-center justify-center gap-2 text-white px-6 py-4 rounded-full font-semibold text-sm transition active:scale-[0.98] shadow-lg"
                style={{ backgroundColor: 'var(--color-card-btn-bg, #1d4ed8)' }}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>
                  {added
                    ? '¡Agregado! ✓'
                    : addingToCart
                    ? 'Agregando...'
                    : `Agregar al carrito · ${formatPrice(finalPrice * quantity)}`}
                </span>
              </button>
            </div>
          )}

          <button
            onClick={() =>
              window.open(
                `https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `¡Mirá este producto!\n\n${product.name}\n\n${window.location.href}`
                )}`,
                '_blank'
              )
            }
            className="w-full flex items-center justify-center gap-2 border border-green-400 text-green-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-green-50 transition"
          >
            <ShareIcon className="w-4 h-4" />
            Compartir por WhatsApp
          </button>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-black/[0.06] pt-12">
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold mb-8 tracking-tight" style={{ color: 'var(--color-text)' }}>
            También te puede interesar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
