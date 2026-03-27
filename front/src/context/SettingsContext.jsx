import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

const fontSizeMap = {
  sm: { base: '0.85rem', title: '0.9rem',  price: '0.95rem' },
  md: { base: '1rem',    title: '1rem',    price: '1.1rem'  },
  lg: { base: '1.1rem',  title: '1.15rem', price: '1.25rem' },
  xl: { base: '1.2rem',  title: '1.3rem',  price: '1.4rem'  },
};
const btnRadiusMap = {
  none: '0px', sm: '4px', md: '8px', lg: '16px', full: '9999px',
};

export const defaultSettings = {
  colors: {
    primary:         '#c8a4a0',
    background:      '#ffffff',
    text:            '#1a0f0d',
    heroBackground:  '#2d1f1a',
    saleBadge:       '#ef4444',
    navbarBg:        '#ffffff',
    navbarText:      '#1a0f0d',
    footerBg:        '#1a0f0d',
    footerText:      '#d4c4bc',
    cardBg:          '#ffffff',
    cardText:        '#1a0f0d',
    cardPrice:       '#c8a4a0',
    cardBtnBg:       '#c8a4a0',
    cardBtnText:     '#ffffff',
    badgeNew:        '#16a34a',
    badgeSale:       '#ef4444',
    badgeBestSeller: '#d97706',
  },
  hero: {
    useGradient:      false,
    gradientFrom:     '#2d1f1a',
    gradientTo:       '#5c3429',
    gradientAngle:    145,
    title:            'Calia',
    subtitle:         'Carteras de cuero diseñadas para acompañarte todos los días.',
    eyebrow:          'Colección invierno 2026',
    ctaLabel:         'Ver catálogo',
    overlayOpacity:   50,
  },
  brand: {
    storeName: 'Calia',
    tagline:   'Tu estilo, tu esencia.',
    whatsapp:  '',
    instagram: '',
    facebook:  '',
    email:     '',
    phone:     '',
    address:   'Buenos Aires, Argentina',
  },
  typography: {
    fontFamily:    "'DM Sans', sans-serif",
    fontSizeBase:  'md',
    fontSizeTitle: 'md',
    fontSizePrice: 'lg',
  },
  images: { heroBanner: '' },
  cardStyle: {
    shadow:    'md',
    radius:    'lg',
    showStock: true,
    layout:    'vertical',
    btnRadius: 'md',
  },
  cardPresets: [],
  faqs: [],
};

function applyCSS(merged) {
  const root = document.documentElement;
  const c  = merged.colors;
  const t  = merged.typography;
  const cs = merged.cardStyle;
  const b  = merged.brand || {};
  const h  = merged.hero  || {};

  root.style.setProperty('--color-primary',    c.primary);
  root.style.setProperty('--color-bg',         c.background);
  root.style.setProperty('--color-text',       c.text);
  root.style.setProperty('--color-sale-badge', c.saleBadge);

  root.style.setProperty('--color-navbar-bg',   c.navbarBg);
  root.style.setProperty('--color-navbar-text', c.navbarText);
  root.style.setProperty('--color-footer-bg',   c.footerBg);
  root.style.setProperty('--color-footer-text', c.footerText);

  if (h.useGradient) {
    root.style.setProperty('--color-hero-bg',
      `linear-gradient(${h.gradientAngle || 145}deg, ${h.gradientFrom || c.heroBackground}, ${h.gradientTo || c.heroBackground})`
    );
  } else {
    root.style.setProperty('--color-hero-bg', c.heroBackground);
  }

  root.style.setProperty('--color-card-bg',       c.cardBg);
  root.style.setProperty('--color-card-text',     c.cardText);
  root.style.setProperty('--color-card-price',    c.cardPrice);
  root.style.setProperty('--color-card-btn-bg',   c.cardBtnBg);
  root.style.setProperty('--color-card-btn-text', c.cardBtnText);

  root.style.setProperty('--color-badge-new',         c.badgeNew        || '#16a34a');
  root.style.setProperty('--color-badge-sale',        c.badgeSale       || '#ef4444');
  root.style.setProperty('--color-badge-bestseller',  c.badgeBestSeller || '#d97706');

  root.style.setProperty('--font-family', t.fontFamily);
  const fsBase  = fontSizeMap[t.fontSizeBase]  || fontSizeMap.md;
  const fsTitle = fontSizeMap[t.fontSizeTitle] || fontSizeMap.md;
  const fsPrice = fontSizeMap[t.fontSizePrice] || fontSizeMap.lg;
  root.style.setProperty('--font-size-base',  fsBase.base);
  root.style.setProperty('--font-size-title', fsTitle.title);
  root.style.setProperty('--font-size-price', fsPrice.price);

  root.style.setProperty('--card-btn-radius', btnRadiusMap[cs.btnRadius] || '8px');

  root.style.setProperty('--store-name', `"${b.storeName || 'Calia'}"`);
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/front');
        if (response.data?.data) {
          const fetched = response.data.data;
          const merged = {
            ...defaultSettings,
            ...fetched,
            colors:    { ...defaultSettings.colors,    ...(fetched.colors    || {}) },
            hero:      { ...defaultSettings.hero,      ...(fetched.hero      || {}) },
            brand:     { ...defaultSettings.brand,     ...(fetched.brand     || {}) },
            typography:{ ...defaultSettings.typography, ...(fetched.typography || {}) },
            images:    { ...defaultSettings.images,    ...(fetched.images    || {}) },
            cardStyle: { ...defaultSettings.cardStyle, ...(fetched.cardStyle || {}) },
          };
          setSettings(merged);
          applyCSS(merged);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        applyCSS(defaultSettings);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #c8a4a0', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};
