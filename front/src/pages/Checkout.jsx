import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { CreditCardIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    deliveryMethod: 'retiro',
    calle: '',
    altura: '',
    timbre: '',
    localidad: '',
    codigoPostal: '',
    provincia: '',
    infoAdicional: '',
    paymentMethod: 'efectivo',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'El nombre es obligatorio';
    }

    if (!formData.userEmail.trim()) {
      newErrors.userEmail = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
      newErrors.userEmail = 'Email inválido';
    }

    if (!formData.userPhone.trim()) {
      newErrors.userPhone = 'El teléfono es obligatorio';
    }

    if (formData.deliveryMethod === 'envio') {
      if (!formData.calle.trim()) newErrors.calle = 'Obligatorio';
      if (!formData.altura.trim()) newErrors.altura = 'Obligatorio';
      if (!formData.localidad.trim()) newErrors.localidad = 'Obligatorio';
      if (!formData.codigoPostal.trim()) newErrors.codigoPostal = 'Obligatorio';
      if (!formData.provincia.trim()) newErrors.provincia = 'Obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const fullAddress = formData.deliveryMethod === 'envio' 
      ? `${formData.calle} ${formData.altura} ${formData.timbre ? 'Dpto/Timbre: ' + formData.timbre : ''}, ${formData.localidad}, CP: ${formData.codigoPostal}, ${formData.provincia}. Info: ${formData.infoAdicional}`
      : 'Retiro en sucursal';

    try {
      try {

        await api.post('/register', {
          name: formData.userName,
          email: formData.userEmail,
          phone: formData.userPhone,
          address: fullAddress,
          role: 'cliente',
          status: 'activo'
        });
      } catch (registerError) {
        if (registerError.response?.status !== 400 || !registerError.response?.data?.error?.includes('Ya existe')) {
          console.warn('Error registering user:', registerError);
        }
      }

      const orderData = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        userPhone: formData.userPhone,
        userAddress: fullAddress,
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        total: total,
        paymentMethod: formData.paymentMethod,
        status: 'pendiente',
        notes: formData.notes
      };

      const response = await api.post('/orders', orderData);

      if (response.data.status === 'success') {
        clearCart();
        navigate('/order-tracking', {
          state: {
            orderId: response.data.data.id,
            orderNumber: response.data.data.saleNumber,
            email: formData.userEmail
          }
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al procesar el pedido. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TruckIcon className="w-5 h-5 mr-2" />
              Información de envío
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.userName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tu nombre completo"
                />
                {errors.userName && (
                  <p className="text-red-600 text-sm mt-1">{errors.userName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.userEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                />
                {errors.userEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.userEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="userPhone"
                  value={formData.userPhone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.userPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+54 11 1234-5678"
                />
                {errors.userPhone && (
                  <p className="text-red-600 text-sm mt-1">{errors.userPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de entrega
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="retiro"
                      checked={formData.deliveryMethod === 'retiro'}
                      onChange={handleInputChange}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    Retiro en sucursal
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="envio"
                      checked={formData.deliveryMethod === 'envio'}
                      onChange={handleInputChange}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    Envío a domicilio
                  </label>
                </div>
              </div>

              {formData.deliveryMethod === 'envio' && (
                <div className="space-y-4 border-t border-gray-100 pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 text-sm">Dirección de envío</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Calle *</label>
                      <input type="text" name="calle" value={formData.calle} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.calle?'border-red-500':'border-gray-300'}`} />
                      {errors.calle && <p className="text-red-500 text-xs mt-1">{errors.calle}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Altura *</label>
                      <input type="text" name="altura" value={formData.altura} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.altura?'border-red-500':'border-gray-300'}`} />
                      {errors.altura && <p className="text-red-500 text-xs mt-1">{errors.altura}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Piso / Depto / Timbre (opcional)</label>
                      <input type="text" name="timbre" value={formData.timbre} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Código Postal *</label>
                      <input type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.codigoPostal?'border-red-500':'border-gray-300'}`} />
                      {errors.codigoPostal && <p className="text-red-500 text-xs mt-1">{errors.codigoPostal}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Localidad *</label>
                      <input type="text" name="localidad" value={formData.localidad} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.localidad?'border-red-500':'border-gray-300'}`} />
                      {errors.localidad && <p className="text-red-500 text-xs mt-1">{errors.localidad}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Provincia *</label>
                      <input type="text" name="provincia" value={formData.provincia} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.provincia?'border-red-500':'border-gray-300'}`} />
                      {errors.provincia && <p className="text-red-500 text-xs mt-1">{errors.provincia}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Info adicional (opcional)</label>
                    <textarea name="infoAdicional" value={formData.infoAdicional} onChange={handleInputChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Ej: Casa puerta roja, dejar en recepción..."></textarea>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de pago
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="tarjeta">Tarjeta de crédito/débito</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas sobre el pedido (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Instrucciones adicionales para el pedido."
                />
              </div>
            </form>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Resumen del pedido
            </h2>

            <div className="space-y-4 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Confirmar pedido
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Al confirmar el pedido, aceptas nuestros términos y condiciones.
            Te enviaremos un email de confirmación con los detalles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;