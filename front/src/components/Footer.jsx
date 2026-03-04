const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Carteras</h3>
            <p className="text-gray-300 mb-4">
              Descubre nuestra colección exclusiva de carteras de cuero premium.
              Diseñadas para durar, creadas para impresionar.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="/catalog" className="text-gray-300 hover:text-white transition-colors">
                  Catálogo
                </a>
              </li>
              <li>
                <a href="/cart" className="text-gray-300 hover:text-white transition-colors">
                  Carrito
                </a>
              </li>
              <li>
                <a href="/order-tracking" className="text-gray-300 hover:text-white transition-colors">
                  Seguimiento de Pedidos
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📧 info@carteras.com</li>
              <li>📱 +54 11 1234-5678</li>
              <li>📍 Buenos Aires, Argentina</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Carteras. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;