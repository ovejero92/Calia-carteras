import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { ArrowRightIcon, TruckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { effectiveUnitPrice, formatInstallments, formatMoneyARS } from '../utils/pricing';

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

const HeroProductStack = ({ products, accent }) => {
  const slice = (products || []).slice(0, 3);
  if (slice.length === 0) return null;
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto h-[320px] sm:h-[380px] lg:h-[440px]">
      {slice.map((p, i) => {
        const img = p.image || p.images?.[0] || '/placeholder-product.svg';
        const z = slice.length - i;
        const rot = i === 0 ? -6 : i === 1 ? 4 : -3;
        const x = i % 2 === 0 ? -8 : 12;
        return (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            className="absolute block overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-white/10 transition-transform duration-500 hover:scale-[1.02] hover:z-50"
            style={{
              width: i === 0 ? '72%' : '62%',
              left: `${14 + x}%`,
              top: `${8 + i * 12}%`,
              zIndex: z,
              transform: `rotate(${rot}deg)`,
            }}
          >
            <div className="aspect-[4/5] bg-neutral-900">
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.svg';
                }}
              />
            </div>
            <div
              className="absolute bottom-0 inset-x-0 px-3 py-2 text-[11px] font-semibold flex justify-between gap-2"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
                color: '#fff',
              }}
            >
              <span className="truncate">{p.name}</span>
              <span style={{ color: accent }} className="shrink-0">
                {formatPrice(effectiveUnitPrice(p))}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const ShowcaseCard = ({ product, accent, large }) => {
  const final = effectiveUnitPrice(product);
  const hasDisc = Boolean(product.discount && product.discount > 0);
  const img = product.image || product.images?.[0] || '/placeholder-product.svg';
  return (
    <Link
      to={`/product/${product.id}`}
      className={`group block overflow-hidden rounded-2xl bg-neutral-100 ${large ? 'md:col-span-2' : ''}`}
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}
    >
      <div className={large ? 'grid md:grid-cols-2 gap-0' : ''}>
        <div className={`relative overflow-hidden ${large ? 'min-h-[280px] md:min-h-[340px]' : 'aspect-[4/5]'}`}>
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            onError={(e) => {
              e.target.src = '/placeholder-product.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80" />
          {product.flags?.isNew && (
            <span
              className="absolute top-4 left-4 text-[10px] font-bold tracking-[0.2em] px-3 py-1.5 rounded-full uppercase"
              style={{ background: accent, color: '#fff' }}
            >
              New in
            </span>
          )}
          {hasDisc && (
            <span className="absolute top-4 right-4 text-white text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/95">
              −{product.discount}%
            </span>
          )}
        </div>
        <div className={`p-6 md:p-8 flex flex-col justify-center ${large ? '' : 'hidden'}`}>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase opacity-45 mb-3">Destacado</p>
          <h3 className="font-editorial text-2xl md:text-3xl font-semibold leading-tight mb-4" style={{ color: 'var(--color-text)' }}>
            {product.name}
          </h3>
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            {hasDisc && (
              <span className="text-sm line-through opacity-40">{formatMoneyARS(product.price)}</span>
            )}
            <span className="text-xl font-bold" style={{ color: accent }}>
              {formatMoneyARS(final)}
            </span>
          </div>
          <p className="text-sm opacity-55 mb-6">{formatInstallments(final)}</p>
          <span
            className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
            style={{ color: accent }}
          >
            Ver producto <ArrowRightIcon className="w-4 h-4" />
          </span>
        </div>
      </div>
      {!large && (
        <div className="p-4">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1" style={{ color: 'var(--color-text)' }}>
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 flex-wrap">
            {hasDisc && <span className="text-xs line-through opacity-40">{formatMoneyARS(product.price)}</span>}
            <span className="font-bold text-sm" style={{ color: accent }}>
              {formatMoneyARS(final)}
            </span>
          </div>
          <p className="text-[11px] opacity-50 mt-1">{formatInstallments(final)}</p>
        </div>
      )}
    </Link>
  );
};

const Home = () => {
  const settings = useSettings();
  const [allProducts, setAllProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [refHero, visHero] = useFadeIn();
  const [refTrust, visTrust] = useFadeIn();
  const [refShow, visShow] = useFadeIn();
  const [refNew, visNew] = useFadeIn();
  const [refSplit, visSplit] = useFadeIn();
  const [refQuote, visQuote] = useFadeIn();
  const [refWhy, visWhy] = useFadeIn();
  const [refCta, visCta] = useFadeIn();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/products');
        const list = res.data?.data || res.data?.products || [];
        const normalized = Array.isArray(list) ? list : [];
        setAllProducts(normalized);
        setNewProducts(normalized.filter((p) => p.flags?.isNew || p.isNew).slice(0, 8));
      } catch {
        setAllProducts([]);
        setNewProducts([]);
      } finally {
        setLoadingLists(false);
      }
    };
    load();
  }, []);

  const accent = settings?.colors?.primary || '#c8a4a0';
  const storeName = settings?.brand?.storeName || 'Calia';
  const tagline = settings?.brand?.tagline || 'Tu estilo, tu esencia.';
  const fontFamily = settings?.typography?.fontFamily || 'inherit';

  const heroImg = settings?.images?.heroBanner || '';
  const h = settings?.hero || {};
  const heroTitle = h.title || storeName;
  const heroEyebrow = h.eyebrow || 'Colección curada';
  const heroSub = h.subtitle || 'Carteras y complementos elegidos a mano, con la calma de un diseño que perdura.';
  const heroCta = h.ctaLabel || 'Explorar tienda';
  const overlayOp = ((h.overlayOpacity ?? 50) / 100).toFixed(2);

  let heroBg;
  if (heroImg) {
    heroBg = {
      backgroundImage: `url(${heroImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else if (h.useGradient) {
    heroBg = {
      background: `linear-gradient(${h.gradientAngle || 145}deg, ${h.gradientFrom || '#2d1f1a'}, ${h.gradientTo || '#5c3429'})`,
    };
  } else {
    heroBg = { background: settings?.colors?.heroBackground || '#2d1f1a' };
  }

  const overlayStyle = heroImg
    ? {
        background: `linear-gradient(to top, rgba(0,0,0,${overlayOp}) 0%, rgba(0,0,0,${(overlayOp * 0.35).toFixed(2)}) 55%, rgba(0,0,0,0.15) 100%)`,
      }
    : { background: `rgba(0,0,0,${(overlayOp * 0.45).toFixed(2)})` };

  const destacados = [...allProducts]
    .sort((a, b) => {
      const as = a.flags?.isSale || a.discount > 0 ? 1 : 0;
      const bs = b.flags?.isSale || b.discount > 0 ? 1 : 0;
      return bs - as;
    })
    .slice(0, 4);

  const features = [
    { icon: SparklesIcon, title: 'Selección real', text: 'Pocas piezas, mucha personalidad. Nada de ruido: solo lo que vale la pena usar.' },
    { icon: TruckIcon, title: 'Llega a tu puerta', text: 'Coordinamos envíos y retiros con la misma calma con la que elegimos cada modelo.' },
  ];

  const fadeStyle = (vis, delay = 0) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.85s ease ${delay}s, transform 0.85s ease ${delay}s`,
  });

  const surfaceMuted = `color-mix(in srgb, ${accent} 9%, var(--color-bg))`;

  return (
    <div style={{ fontFamily, color: 'var(--color-text)' }}>
      <section
        ref={refHero}
        className="relative min-h-[88vh] lg:min-h-[92vh] flex flex-col justify-center overflow-hidden"
        style={heroBg}
      >
        <div className="absolute inset-0" style={overlayStyle} />
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(circle_at_20%_30%,white,transparent_50%)]" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-6 xl:col-span-5" style={fadeStyle(visHero)}>
              <p
                className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase mb-6"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                {heroEyebrow}
              </p>
              <h1
                className="font-editorial text-[clamp(2.75rem,8vw,5.25rem)] leading-[0.95] font-semibold text-white mb-6 tracking-tight"
              >
                {heroTitle}
              </h1>
              <p className="text-base sm:text-lg leading-relaxed max-w-md mb-10" style={{ color: 'rgba(255,255,255,0.72)' }}>
                {heroSub}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide shadow-lg"
                  style={{ background: '#fff', color: '#1a120e' }}
                >
                  {heroCta}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  to="/catalog?tag=sale"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold border border-white/35 text-white/95 hover:bg-white/10 transition-colors"
                >
                  Ver ofertas
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 xl:col-span-7 hidden sm:block" style={fadeStyle(visHero, 0.08)}>
              <HeroProductStack products={allProducts} accent={accent} />
            </div>
          </div>
        </div>

        <div
          className="relative z-10 border-t border-white/10 backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-wrap justify-center sm:justify-between gap-4 text-[11px] sm:text-xs font-medium tracking-wide text-white/75">
            <span className="inline-flex items-center gap-2">
              <TruckIcon className="w-4 h-4 opacity-70" /> Envíos a todo el país
            </span>
            <span className="hidden sm:inline opacity-40">·</span>
            <span>Cuotas con tu banco — consultá condiciones</span>
            <span className="hidden sm:inline opacity-40">·</span>
            <span>Empaque cuidado, como corresponde</span>
          </div>
        </div>
      </section>

      <section ref={refTrust} className="border-b" style={{ borderColor: 'rgba(0,0,0,0.06)', ...fadeStyle(visTrust) }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10 grid sm:grid-cols-3 gap-8 text-center sm:text-left">
          {[
            { step: '01', title: 'Editado con criterio', desc: 'Menos modelos, más acierto. Elegimos texturas y siluetas que se usan en serio.' },
            { step: '02', title: 'Pago flexible', desc: 'Débito, transferencia o lo que te quede cómodo — lo charlamos por el canal que prefieras.' },
            { step: '03', title: 'Cerca tuyo', desc: 'Seguimiento humano del pedido. Sin vueltas, sin letra chica innecesaria.' },
          ].map((x) => (
            <div key={x.title}>
              <p className="text-[10px] font-bold tracking-[0.2em] opacity-35 mb-2">{x.step}</p>
              <h3 className="font-semibold text-sm mb-2">{x.title}</h3>
              <p className="text-sm opacity-55 leading-relaxed">{x.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {(loadingLists || destacados.length > 0) && (
        <section ref={refShow} className="py-16 lg:py-24" style={{ ...fadeStyle(visShow, 0.05) }}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-3" style={{ color: accent }}>
                  Elegidas para vos
                </p>
                <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight">
                  Piezas que abren conversación
                </h2>
              </div>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 text-sm font-semibold shrink-0 group"
                style={{ color: accent }}
              >
                Todo el catálogo
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {loadingLists ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-neutral-100 animate-pulse aspect-[4/5] max-h-[420px]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                {destacados.map((p, i) => (
                  <div key={p.id} className={i === 0 ? 'sm:col-span-2' : ''} style={fadeStyle(visShow, 0.06 + i * 0.05)}>
                    <ShowcaseCard product={p} accent={accent} large={i === 0} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {(newProducts.length > 0 || loadingLists) && (
        <section className="py-16 lg:py-20" style={{ background: surfaceMuted }} ref={refNew}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10" style={fadeStyle(visNew, 0.05)}>
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-3" style={{ color: accent }}>
                  Recién llegadas
                </p>
                <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight">New in, sin apuro</h2>
              </div>
              <Link to="/catalog?tag=new" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
                Ver novedades <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {loadingLists ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white/50 animate-pulse aspect-[3/4]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newProducts.map((p, i) => (
                  <ShowcaseCard key={p.id} product={p} accent={accent} large={false} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section ref={refSplit} className="py-16 lg:py-24" style={fadeStyle(visSplit)}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-6">
          <div
            className="rounded-3xl p-10 lg:p-14 flex flex-col justify-center min-h-[280px]"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 22%, #1a120e), #15100d)`,
              color: '#fff',
            }}
          >
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase opacity-50 mb-4">Experiencia Calia</p>
            <h3 className="font-editorial text-2xl sm:text-3xl leading-snug mb-4">
              Unboxing que se siente especial
            </h3>
            <p className="text-sm leading-relaxed opacity-75 max-w-md">
              Cuidamos el envío como cuidamos el producto: con detalle, perfume a 'recién abierto' y ganas de que lo uses ya.
            </p>
          </div>
          <div
            className="rounded-3xl p-10 lg:p-14 flex flex-col justify-center min-h-[280px] border"
            style={{ borderColor: 'rgba(0,0,0,0.07)', background: 'var(--color-bg)' }}
          >
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase opacity-40 mb-4" style={{ color: accent }}>
              Tu ritmo
            </p>
            <h3 className="font-editorial text-2xl sm:text-3xl leading-snug mb-4" style={{ color: 'var(--color-text)' }}>
              Elegí con tiempo, comprá con confianza
            </h3>
            <p className="text-sm leading-relaxed max-w-md" style={{ opacity: 0.58 }}>
              Si te queda alguna duda de medidas o combinaciones, escribinos: preferimos una conversación honesta a una compra apurada.
            </p>
            <Link
              to="/faq"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: accent }}
            >
              Preguntas frecuentes <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={refQuote}
        className="py-14 lg:py-16 px-4"
        style={{ background: surfaceMuted, ...fadeStyle(visQuote) }}
      >
        <p className="max-w-3xl mx-auto text-center font-editorial text-[clamp(1.35rem,3.5vw,2.1rem)] leading-snug font-medium">
          “No hace falta un armario enorme.
          <br />
          <span style={{ color: accent }}>Hacen falta dos o tres piezas que te representen de verdad.”</span>
        </p>
      </section>

      <section ref={refWhy} className="py-16 lg:py-24" style={fadeStyle(visWhy)}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-3" style={{ color: accent }}>
            Por qué {storeName}
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight mb-12">Hecho con intención</h2>
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex gap-5" style={fadeStyle(visWhy, 0.08 + i * 0.08)}>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: accent }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm leading-relaxed opacity-60">{f.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        ref={refCta}
        className="mx-4 sm:mx-6 lg:mx-10 mb-16 lg:mb-24 rounded-[2rem] overflow-hidden relative"
        style={{ ...fadeStyle(visCta), background: settings?.colors?.heroBackground || '#2d1f1a' }}
      >
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_80%_20%,var(--color-primary),transparent_55%)]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16 py-14 lg:py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Colección completa
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl text-white leading-tight mb-4">
              Tu próxima favorita está a un clic
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {tagline}
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm shrink-0 shadow-xl"
            style={{ background: '#fff', color: '#1a120e' }}
          >
            Explorar colección
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
