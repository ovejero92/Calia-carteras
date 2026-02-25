import { Link } from 'react-router-dom';
import { ShoppingBagIcon, TruckIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      icon: ShoppingBagIcon,
      title: 'Colección Exclusiva',
      description: 'Carteras de cuero premium seleccionadas cuidadosamente para ti.'
    },
    {
      icon: TruckIcon,
      title: 'Envío Rápido',
      description: 'Entrega rápida y segura en toda Argentina.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Garantía de Calidad',
      description: 'Productos de alta calidad con garantía de satisfacción.'
    },
    {
      icon: StarIcon,
      title: 'Atención Personalizada',
      description: 'Servicio al cliente dedicado para resolver tus dudas.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Carteras de Cuero Premium
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Descubre nuestra colección exclusiva de carteras diseñadas para durar
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingBagIcon className="w-5 h-5 mr-2" />
            Ver Catálogo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            ¿Listo para encontrar tu cartera perfecta?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Explora nuestro catálogo y encuentra el accesorio que complemente tu estilo
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Explorar Colección
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;