import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

// Mapeos de valores semánticos a CSS reales
const fontSizeMap = {
    sm:  { base: '0.85rem', title: '0.9rem',  price: '0.95rem' },
    md:  { base: '1rem',    title: '1rem',    price: '1.1rem'  },
    lg:  { base: '1.1rem',  title: '1.15rem', price: '1.25rem' },
    xl:  { base: '1.2rem',  title: '1.3rem',  price: '1.4rem'  },
};

const btnRadiusMap = {
    none: '0px',
    sm:   '4px',
    md:   '8px',
    lg:   '16px',
    full: '9999px',
};

const defaultSettings = {
    colors: {
        primary:        '#1d4ed8',
        background:     '#ffffff',
        text:           '#1f2937',
        heroBackground: '#1e3a8a',
        saleBadge:      '#ef4444',
        navbarBg:       '#ffffff',
        navbarText:     '#1f2937',
        footerBg:       '#111827',
        footerText:     '#d1d5db',
        cardBg:         '#ffffff',
        cardText:       '#1f2937',
        cardPrice:      '#1d4ed8',
        cardBtnBg:      '#1d4ed8',
        cardBtnText:    '#ffffff',
    },
    typography: {
        fontFamily:    "'Inter', sans-serif",
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
    }
};

function applyCSS(merged) {
    const root = document.documentElement;
    const c = merged.colors;
    const t = merged.typography;
    const cs = merged.cardStyle;

    // Colores globales
    root.style.setProperty('--color-primary',    c.primary);
    root.style.setProperty('--color-bg',         c.background);
    root.style.setProperty('--color-text',       c.text);
    root.style.setProperty('--color-hero-bg',    c.heroBackground);
    root.style.setProperty('--color-sale-badge', c.saleBadge);

    // Navbar & Footer
    root.style.setProperty('--color-navbar-bg',   c.navbarBg);
    root.style.setProperty('--color-navbar-text', c.navbarText);
    root.style.setProperty('--color-footer-bg',   c.footerBg);
    root.style.setProperty('--color-footer-text', c.footerText);

    // Card
    root.style.setProperty('--color-card-bg',       c.cardBg);
    root.style.setProperty('--color-card-text',     c.cardText);
    root.style.setProperty('--color-card-price',    c.cardPrice);
    root.style.setProperty('--color-card-btn-bg',   c.cardBtnBg);
    root.style.setProperty('--color-card-btn-text', c.cardBtnText);

    // Tipografía
    root.style.setProperty('--font-family', t.fontFamily);
    const fsBase  = fontSizeMap[t.fontSizeBase]  || fontSizeMap.md;
    const fsTitle = fontSizeMap[t.fontSizeTitle] || fontSizeMap.md;
    const fsPrice = fontSizeMap[t.fontSizePrice] || fontSizeMap.lg;
    root.style.setProperty('--font-size-base',  fsBase.base);
    root.style.setProperty('--font-size-title', fsTitle.title);
    root.style.setProperty('--font-size-price', fsPrice.price);

    // Card estilo
    root.style.setProperty('--card-btn-radius', btnRadiusMap[cs.btnRadius] || '8px');
}

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

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
                        typography:{ ...defaultSettings.typography, ...(fetched.typography|| {}) },
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
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
    }

    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
};