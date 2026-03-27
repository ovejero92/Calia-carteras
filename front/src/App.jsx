import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CartDrawer from "./components/CartDrawer";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import { SettingsProvider } from "./context/SettingsContext";
import FAQ from "./pages/FAQ";
import "./App.css";

function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <Router>
          <div
            className="min-h-screen bg-gray-50"
            style={{
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          >
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/faq" element={<FAQ />} />
              </Routes>
              <CartDrawer />
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </SettingsProvider>
  );
}

export default App;
