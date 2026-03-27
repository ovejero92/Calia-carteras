import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

const OrderTracking = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState(location.state?.email || '');
  const [searched, setSearched] = useState(false);

  const orderId = location.state?.orderId;
  const orderNumber = location.state?.orderNumber;

  useEffect(() => {
    if (orderId && searchEmail) {
      fetchOrders(searchEmail);
    }
  }, [orderId, searchEmail]);

  const fetchOrders = async (email) => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const response = await api.get(`/orders?email=${encodeURIComponent(email)}`);
      if (response.data.status === 'success') {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error al buscar pedidos. Verifica el email e intenta nuevamente.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(searchEmail);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente':   return <ClockIcon className="w-6 h-6 text-yellow-500" />;
      case 'completada':  return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'cancelada':   return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:            return <ClockIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente':  return 'Pendiente';
      case 'completada': return 'Aceptado';
      case 'cancelada':  return 'Cancelado';
      default:           return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':  return 'bg-yellow-100 text-yellow-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada':  return 'bg-red-100 text-red-800';
      default:           return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS'
  }).format(price);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Seguimiento de pedidos</h1>

      {orderId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <h3 className="text-green-800 font-medium">¡Pedido realizado con éxito!</h3>
              <p className="text-green-700 text-sm">
                Número de pedido: <strong>{orderNumber}</strong>. Te notificaremos cuando sea aceptado.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Buscar tus pedidos</h2>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Ingresa tu email"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {searched && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">No se encontraron pedidos para este email</p>
              <p className="text-gray-400 text-sm">Verificá que el email sea correcto.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">

             
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pedido #{order.saleNumber}</h3>
                    <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {order.status === 'pendiente' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <ClockIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-yellow-800 font-medium">Pedido pendiente de aprobación</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          Estamos revisando tu pedido. Te enviaremos un email cuando sea confirmado.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {order.status === 'completada' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-green-800 font-medium">¡Pedido aceptado!</h4>
                        <p className="text-green-700 text-sm mt-1">
                          Tu pedido fue confirmado. ¡Gracias por tu compra!
                        </p>
                        {/* ✅ Horario estimado de entrega */}
                        {order.estimatedDelivery && (
                          <div className="mt-3 flex items-center bg-white border border-green-300 rounded-lg px-4 py-3">
                            <span className="text-green-700 text-lg mr-2">🕐</span>
                            <div>
                              <p className="text-green-800 font-semibold text-sm">Horario estimado de entrega</p>
                              <p className="text-green-900 font-bold">{order.estimatedDelivery}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {order.status === 'cancelada' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <XCircleIcon className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-red-800 font-medium">Pedido cancelado</h4>
                        <p className="text-red-700 text-sm mt-1">
                          Este pedido no pudo procesarse. Contactanos si tenés dudas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-gray-900 text-sm">Productos:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">{formatPrice(item.subtotal)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-primary-600">{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Método de pago:</span>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/catalog" className="text-primary-600 hover:text-primary-800 font-medium">
          ← Continuar comprando
        </Link>
      </div>
    </div>
  );
};

export default OrderTracking;