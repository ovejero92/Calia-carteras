import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

const shadowMap = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

const radiusMap = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-2xl",
};

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const settings = useSettings();
  const cardStyle = settings?.cardStyle || {
    shadow: "md",
    radius: "lg",
    showStock: true,
    layout: "vertical",
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);
  const images =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : ["/placeholder-product.svg"];

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);

  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const finalPrice = hasDiscount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleMouseEnter = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 800);
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentImageIndex(0);
  };

  const shadowClass = shadowMap[cardStyle.shadow] ?? "shadow-md";
  const radiusClass = radiusMap[cardStyle.radius] ?? "rounded-lg";
  const isCompact = cardStyle.layout === "compact";

  const cardBgStyle = { backgroundColor: "var(--color-card-bg, #fff)" };
  const cardTextStyle = {
    color: "var(--color-card-text, #1f2937)",
    fontSize: "var(--font-size-title, 1rem)",
  };

  const priceStyle = {
    color: "var(--color-card-price, #1d4ed8)",
    fontSize: "var(--font-size-price, 1.1rem)",
  };

  const btnStyle = (disabled) =>
    disabled
      ? {
          backgroundColor: "#d1d5db",
          color: "#6b7280",
          cursor: "not-allowed",
          borderRadius: "var(--card-btn-radius, 8px)",
        }
      : {
          backgroundColor: "var(--color-card-btn-bg, #1d4ed8)",
          color: "var(--color-card-btn-text, #fff)",
          borderRadius: "var(--card-btn-radius, 8px)",
        };

  if (isCompact) {
    return (
      <div
        className={`border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex ${radiusClass} ${shadowClass}`}
        style={cardBgStyle}
      >
        <Link to={`/product/${product.id}`} className="flex w-full">
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ width: "90px", height: "90px" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                e.target.src = "/placeholder-product.svg";
              }}
            />

            {hasDiscount && (
              <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                -{product.discount}%
              </div>
            )}

            {product.stock <= 5 && product.stock > 0 && (
              <div
                className="absolute top-1 right-1 text-white text-xs px-1 py-0.5 rounded"
                style={{
                  backgroundColor: "var(--color-sale-badge)",
                  fontSize: "0.6rem",
                }}
              >
                ¡Últimas!
              </div>
            )}

            {product.stock === 0 && (
              <div
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded"
                style={{ fontSize: "0.6rem" }}
              >
                Agotado
              </div>
            )}
          </div>

          <div className="flex-1 p-2 flex flex-col justify-between">
            <div>
              <h3
                className="font-semibold line-clamp-2 leading-tight"
                style={cardTextStyle}
              >
                {product.name}
              </h3>

              {cardStyle.showStock && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {product.stock === 1 ? '¡Última unidad!' : (product.stock <= 5 ? 'Quedan pocas unidades' : 'Disponible')}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-1">
              <div>
                {hasDiscount && (
                  <div className="text-xs text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </div>
                )}

                <span className="font-bold" style={priceStyle}>
                  {formatPrice(finalPrice)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center space-x-0.5 px-2 py-1 text-xs font-medium transition-colors"
                style={btnStyle(product.stock === 0)}
              >
                <ShoppingBagIcon className="w-3 h-3" />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${radiusClass} ${shadowClass}`}
      style={cardBgStyle}
    >
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
            onError={(e) => {
              e.target.src = "/placeholder-product.svg";
            }}
          />

          {product.discount > 0 && (
            <div className="absolute top-2 right-2 sale-badge">
              -{product.discount}%
            </div>
          )}

          {product.flags?.isNew && (
            <div className="absolute top-2 left-2 new-badge">NUEVO</div>
          )}

          {product.flags?.isBestSeller && (
            <div className="absolute bottom-2 left-2 bestseller-badge">
              ⭐ Más vendido
            </div>
          )}

          {product.stock <= 5 && product.stock > 0 && (
            <div
              className="absolute bottom-2 right-2 text-white text-xs px-2 py-1 rounded"
              style={{ backgroundColor: "var(--color-sale-badge)" }}
            >
              ¡Últimas!
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              Agotado
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-2" style={cardTextStyle}>
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              {hasDiscount && (
                <div className="text-sm text-gray-400 line-through">
                  {formatPrice(product.price)}
                </div>
              )}

              <span className="font-bold" style={priceStyle}>
                {formatPrice(finalPrice)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors"
              style={btnStyle(product.stock === 0)}
            >
              <ShoppingBagIcon className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>

          {cardStyle.showStock && (
            <div className="text-xs text-gray-500 mt-2">
              {product.stock === 1 ? '¡Última unidad!' : (product.stock <= 5 ? 'Quedan pocas unidades' : 'Disponible')}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
