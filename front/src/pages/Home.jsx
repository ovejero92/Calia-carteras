import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const NewCard = ({ product, accentColor }) => {
  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;
  return (
    <Link to={`/product/${product.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-[#f5ede8]"
      style={{ aspectRatio: '3/4' }}>
      <img
        src={product.image || product.images?.[0] || '/placeholder-product.svg'}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        onError={(e) => { e.target.src = '/placeholder-product.svg'; }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
      <span className="absolute top-3 left-3 text-[10px] font-semibold tracking-widest px-3 py-1 rounded-full"
        style={{ background: accentColor, color: '#fff', letterSpacing: '0.15em' }}>
        NEW
      </span>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent">
        <p className="text-white font-semibold text-sm leading-snug drop-shadow">{product.name}</p>
        <p className="text-white/90 text-xs mt-0.5 drop-shadow">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(finalPrice)}
        </p>
      </div>
    </Link>
  );
};


const Home = () => {
  const settings = useSettings();
  const [newProducts, setNewProducts] = useState([]);
  const [loadingNew,  setLoadingNew]  = useState(true);

  const [refHero, visHero] = useFadeIn();
  const [refNew,  visNew]  = useFadeIn();
  const [refWhy,  visWhy]  = useFadeIn();
  const [refCta,  visCta]  = useFadeIn();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res  = await api.get('/products', { params: { isNew: true, limit: 4 } });
        const data = res.data?.data || res.data?.products || [];
        setNewProducts(data.filter(p => p.flags?.isNew || p.isNew).slice(0, 4));
      } catch { setNewProducts([]); }
      finally  { setLoadingNew(false); }
    };
    fetch();
  }, []);

  const accent     = settings?.colors?.primary    || '#c8a4a0';
  const storeName  = settings?.brand?.storeName   || 'Calia';
  const tagline    = settings?.brand?.tagline     || 'Tu estilo, tu esencia.';
  const fontFamily = settings?.typography?.fontFamily || 'inherit';

  const heroImg     = settings?.images?.heroBanner || '';
  const h           = settings?.hero || {};
  const heroTitle   = h.title    || storeName;
  const heroEyebrow = h.eyebrow  || 'Colección invierno 2026';
  const heroSub     = h.subtitle || 'Carteras de cuero diseñadas para acompañarte todos los días.';
  const heroCta     = h.ctaLabel || 'Ver catálogo';
  const overlayOp   = ((h.overlayOpacity ?? 50) / 100).toFixed(2);

  let heroBg;
  if (heroImg) {
    heroBg = { backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  } else if (h.useGradient) {
    heroBg = { background: `linear-gradient(${h.gradientAngle || 145}deg, ${h.gradientFrom || '#2d1f1a'}, ${h.gradientTo || '#5c3429'})` };
  } else {
    heroBg = { background: settings?.colors?.heroBackground || '#2d1f1a' };
  }

  // Overlay
  const overlayStyle = heroImg
    ? { background: `linear-gradient(to top, rgba(0,0,0,${overlayOp}) 0%, rgba(0,0,0,${(overlayOp * 0.4).toFixed(2)}) 60%, transparent 100%)` }
    : { background: `rgba(0,0,0,${(overlayOp * 0.5).toFixed(2)})` };

  const features = [
    { icon: '✦', title: 'Diseño exclusivo',       text: 'Cada pieza seleccionada por calidad y estilo único.' },
    { icon: '◈', title: 'Cuero premium',           text: 'Materiales de alta gama que mejoran con el tiempo.' },
    { icon: '◎', title: 'Envío a todo el país',    text: 'Entrega rápida y segura en toda Argentina.' },
    { icon: '◇', title: 'Atención personalizada',  text: 'Respondemos tus consultas por WhatsApp al instante.' },
  ];

  const fadeStyle = (vis, delay = 0) => ({
    opacity:    vis ? 1 : 0,
    transform:  vis ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`,
  });

  return (
    <div style={{ fontFamily, color: 'var(--color-text, #1a0f0d)' }}>

      <section ref={refHero} className="relative min-h-[92vh] flex flex-col justify-end pb-16 px-6 md:px-16" style={heroBg}>
        <div className="absolute inset-0" style={overlayStyle} />

        <div className="relative z-10 max-w-3xl" style={fadeStyle(visHero)}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 20, fontWeight: 500 }}>
            {heroEyebrow}
          </p>
          <h1 style={{ fontSize: 'clamp(4.5rem, 13vw, 10rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.9, color: '#fff', marginBottom: 24, fontFamily }}>
            {heroTitle}
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.7, maxWidth: 420, marginBottom: 40, color: 'rgba(255,255,255,0.78)' }}>
            {heroSub}
          </p>
          <Link to="/catalog"
            className="inline-flex items-center gap-3 px-8 py-4 font-semibold text-sm tracking-wide rounded-full transition-all duration-300 hover:gap-5"
            style={{ background: '#fff', color: '#1a0f0d' }}>
            {heroCta}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="absolute top-8 right-8 text-white/20 font-bold hidden md:block"
          style={{ fontSize: '7rem', letterSpacing: '-0.05em', lineHeight: 1 }} aria-hidden>
          ©
        </div>
      </section>

      {(newProducts.length > 0 || loadingNew) && (
        <section ref={refNew} className="px-6 md:px-16 py-20" style={fadeStyle(visNew, 0.1)}>
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: accent, marginBottom: 8, fontWeight: 500 }}>
                Recién llegadas
              </p>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, fontFamily }}>
                New In
              </h2>
            </div>
            <Link to="/catalog" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold pb-0.5 shrink-0"
              style={{ borderBottom: `1.5px solid ${accent}`, color: accent }}>
              Ver todo <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingNew ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl animate-pulse bg-gray-100" style={{ aspectRatio: '3/4' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newProducts.map((p, i) => (
                <div key={p.id} style={fadeStyle(visNew, 0.1 + i * 0.1)}>
                  <NewCard product={p} accentColor={accent} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/catalog" className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: accent, borderBottom: `1.5px solid ${accent}` }}>
              Ver todo <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      <section style={{ padding: '40px 48px', background: accent + '12', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.6rem)', fontWeight: 800, lineHeight: 1.35, letterSpacing: '-0.01em', fontFamily }}>
          "No es solo una cartera.
          <br />
          <span style={{ color: accent }}>Es la que elegís todos los días."</span>
        </p>
      </section>

      <section ref={refWhy} className="px-6 md:px-16 py-20" style={fadeStyle(visWhy)}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: accent, marginBottom: 10, fontWeight: 500 }}>
            Por qué {storeName}
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', fontFamily }}>
            Hecho con intención
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          {features.map((f, i) => (
            <div key={i} className="py-10 px-14 pr-8 border-r last:border-r-0"
              style={{ borderColor: 'rgba(0,0,0,0.08)', ...fadeStyle(visWhy, 0.1 + i * 0.1) }}>
              <span style={{ display: 'block', fontSize: 22, color: accent, marginBottom: 16 }}>{f.icon}</span>
              <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.6 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={refCta} className="mx-6 md:mx-16 mb-20 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-16"
        style={{ background: settings?.colors?.heroBackground || '#2d1f1a', ...fadeStyle(visCta) }}>
        <div className="absolute -right-8 -bottom-8 text-white/5 font-bold leading-none select-none pointer-events-none hidden md:block"
          style={{ fontSize: '14rem', letterSpacing: '-0.05em', fontFamily }} aria-hidden>
          {storeName[0] || 'C'}
        </div>

        <div className="relative z-10 max-w-lg">
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 12, fontWeight: 500 }}>
            Colección completa
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 12, fontFamily }}>
            Encontrá la cartera que te representa
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>
            {tagline}
          </p>
        </div>

        <Link to="/catalog"
          className="relative z-10 inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm shrink-0 transition-all duration-300 hover:gap-5"
          style={{ background: '#fff', color: '#1a0f0d' }}>
          Explorar colección
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};

export default Home;