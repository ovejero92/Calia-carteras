import { useState } from 'react';
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
    userAddress: '',
    paymentMethod: 'efectivo',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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

    if (!formData.userAddress.trim()) {
      newErrors.userAddress = 'La dirección es obligatoria';
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

    try {
      // First, try to register the user if they don't exist
      try {
        await api.post('/register', {
          name: formData.userName,
          email: formData.userEmail,
          phone: formData.userPhone,
          address: formData.userAddress,
          role: 'cliente',
          status: 'activo'
        });
      } catch (registerError) {
        // If user already exists, that's okay - continue with order
        if (registerError.response?.status !== 400 || !registerError.response?.data?.error?.includes('Ya existe')) {
          console.warn('Error registering user:', registerError);
        }
      }

      // Create the order
      const orderData = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        userPhone: formData.userPhone,
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
        {/* Formulario */}
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
                  Dirección de envío *
                </label>
                <textarea
                  name="userAddress"
                  value={formData.userAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.userAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dirección completa de envío"
                />
                {errors.userAddress && (
                  <p className="text-red-600 text-sm mt-1">{errors.userAddress}</p>
                )}
              </div>

              <div>
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
                  Notas adicionales (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Instrucciones especiales de envío, etc."
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