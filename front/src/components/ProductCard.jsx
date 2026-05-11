import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { effectiveUnitPrice, formatInstallments } from "../utils/pricing";

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
  lg: "rounded-xl",
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
  const finalPrice = effectiveUnitPrice(product);

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
  const radiusClass = radiusMap[cardStyle.radius] ?? "rounded-xl";
  const isCompact = cardStyle.layout === "compact";

  const cardBgStyle = { backgroundColor: "var(--color-card-bg, #fff)" };
  const softBorder = "border border-black/[0.06]";

  const btnStyle = (disabled) =>
    disabled
      ? {
          backgroundColor: "#e5e7eb",
          color: "#9ca3af",
          cursor: "not-allowed",
          borderRadius: "var(--card-btn-radius, 9999px)",
        }
      : {
          backgroundColor: "var(--color-card-btn-bg, #111)",
          color: "var(--color-card-btn-text, #fff)",
          borderRadius: "var(--card-btn-radius, 9999px)",
        };

  if (isCompact) {
    return (
      <div
        className={`${softBorder} overflow-hidden hover:shadow-lg transition-all duration-300 flex ${radiusClass} ${shadowClass}`}
        style={cardBgStyle}
      >
        <Link to={`/product/${product.id}`} className="flex w-full">
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ width: "100px", height: "100px" }}
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
              <div className="absolute top-1 left-1 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500">
                −{product.discount}%
              </div>
            )}

            {product.stock <= 5 && product.stock > 0 && (
              <div
                className="absolute top-1 right-1 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: "var(--color-sale-badge)" }}
              >
                ¡Últimas!
              </div>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] font-bold text-neutral-600">
                Agotado
              </div>
            )}
          </div>

          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <h3
                className="font-semibold line-clamp-2 leading-snug text-sm"
                style={{ color: "var(--color-card-text)", fontSize: "var(--font-size-title, 1rem)" }}
              >
                {product.name}
              </h3>

              {cardStyle.showStock && (
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {product.stock === 1
                    ? "¡Última unidad!"
                    : product.stock <= 5
                      ? "Quedan pocas"
                      : "Disponible"}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 gap-2">
              <div className="min-w-0">
                {hasDiscount && (
                  <div className="text-[11px] text-neutral-400 line-through">
                    {formatPrice(product.price)}
                  </div>
                )}
                <span className="font-bold text-sm" style={{ color: "var(--color-card-price)", fontSize: "var(--font-size-price, 1rem)" }}>
                  {formatPrice(finalPrice)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold transition-transform active:scale-95"
                style={btnStyle(product.stock === 0)}
              >
                <ShoppingBagIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Agregar</span>
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className={`group/card ${softBorder} overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${radiusClass} ${shadowClass}`} style={cardBgStyle}>
      <Link to={`/product/${product.id}`} className="block">
        <div
          className="relative overflow-hidden bg-neutral-50 aspect-[4/5]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
            onError={(e) => {
              e.target.src = "/placeholder-product.svg";
            }}
          />

          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/25 to-transparent" />

          {product.discount > 0 && (
            <div className="absolute top-3 right-3 sale-badge">−{product.discount}%</div>
          )}

          {product.flags?.isNew && <div className="absolute top-3 left-3 new-badge">New</div>}

          {product.flags?.isBestSeller && (
            <div className="absolute bottom-3 left-3 bestseller-badge">Top</div>
          )}

          {product.stock <= 5 && product.stock > 0 && (
            <div
              className="absolute bottom-3 right-3 text-white text-[10px] font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: "var(--color-sale-badge)" }}
            >
              ¡Últimas!
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-xs font-bold tracking-widest uppercase text-neutral-500">Agotado</span>
            </div>
          )}
        </div>

        <div className="p-4 pt-3">
          <h3 className="font-semibold mb-2 line-clamp-2 leading-snug tracking-tight" style={{ color: "var(--color-card-text)", fontSize: "var(--font-size-title, 1rem)" }}>
            {product.name}
          </h3>

          <div className="flex flex-col gap-0.5 mb-3">
            <div className="flex flex-wrap items-baseline gap-2">
              {hasDiscount && (
                <span className="text-sm text-neutral-400 line-through">{formatPrice(product.price)}</span>
              )}
              <span className="text-lg font-bold tracking-tight" style={{ color: "var(--color-card-price)", fontSize: "var(--font-size-price, 1.05rem)" }}>
                {formatPrice(finalPrice)}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">{formatInstallments(finalPrice)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wide transition-transform active:scale-[0.98]"
              style={btnStyle(product.stock === 0)}
            >
              <ShoppingBagIcon className="w-4 h-4" />
              Comprar
            </button>
          </div>

          {cardStyle.showStock && (
            <div className="text-[11px] text-neutral-400 mt-2.5">
              {product.stock === 1 ? "¡Última unidad!" : product.stock <= 5 ? "Quedan pocas unidades" : "En stock"}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
