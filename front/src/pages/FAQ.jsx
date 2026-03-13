import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const FAQ = () => {
    const [faqs,    setFaqs]    = useState([]);
    const [loading, setLoading] = useState(true);
    const [open,    setOpen]    = useState(null); // índice del acordeón abierto

    useEffect(() => {
        api.get('/settings/front').then(r => {
            const data = r.data?.data;
            if (data?.faqs && Array.isArray(data.faqs)) {
                setFaqs(data.faqs);
            }
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const toggle = (i) => setOpen(open === i ? null : i);

    if (loading) return (
        <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2"
                style={{ borderColor: 'var(--color-primary, #1d4ed8)' }} />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            {/* Encabezado */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text, #1f2937)' }}>
                    Preguntas Frecuentes
                </h1>
                <p style={{ color: 'var(--color-text, #1f2937)', opacity: 0.55, fontSize: 15 }}>
                    Todo lo que necesitás saber antes de hacer tu compra.
                </p>
            </div>

            {faqs.length === 0 ? (
                <div className="text-center py-16">
                    <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                    <p style={{ color: '#9ca3af', fontSize: 15 }}>
                        Todavía no hay preguntas cargadas.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {faqs.map((faq, i) => (
                        <div key={i}
                            style={{
                                background:   '#fff',
                                borderRadius: 12,
                                border:       open === i
                                    ? `1.5px solid var(--color-primary, #1d4ed8)`
                                    : '1.5px solid #e5e7eb',
                                overflow:     'hidden',
                                transition:   'border-color .2s',
                                boxShadow:    open === i ? '0 4px 16px rgba(0,0,0,0.07)' : 'none',
                            }}>
                            {/* Pregunta */}
                            <button
                                onClick={() => toggle(i)}
                                style={{
                                    width:          '100%',
                                    display:        'flex',
                                    justifyContent: 'space-between',
                                    alignItems:     'center',
                                    padding:        '16px 20px',
                                    background:     'none',
                                    border:         'none',
                                    cursor:         'pointer',
                                    textAlign:      'left',
                                    gap:            12,
                                }}>
                                <span style={{
                                    fontWeight: 600,
                                    fontSize:   15,
                                    color:      open === i ? 'var(--color-primary, #1d4ed8)' : 'var(--color-text, #1f2937)',
                                    lineHeight: 1.4,
                                    flex:       1,
                                }}>
                                    {faq.question}
                                </span>
                                <ChevronDownIcon
                                    className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                                    style={{
                                        color:     'var(--color-primary, #1d4ed8)',
                                        transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                                    }} />
                            </button>

                            {/* Respuesta con animación */}
                            <div style={{
                                maxHeight:  open === i ? 600 : 0,
                                overflow:   'hidden',
                                transition: 'max-height .3s ease',
                            }}>
                                <p style={{
                                    padding:    '0 20px 18px',
                                    color:      'var(--color-text, #1f2937)',
                                    opacity:    0.75,
                                    fontSize:   14,
                                    lineHeight: 1.7,
                                    margin:     0,
                                }}>
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CTA al final */}
            <div style={{
                marginTop:    40,
                padding:      '24px',
                background:   'var(--color-hero-bg, #1e3a8a)',
                borderRadius: 16,
                textAlign:    'center',
            }}>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, marginBottom: 4 }}>
                    ¿No encontraste lo que buscabas?
                </p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    Escribinos por WhatsApp o Instagram y te respondemos enseguida. 💬
                </p>
            </div>
        </div>
    );
};

export default FAQ;