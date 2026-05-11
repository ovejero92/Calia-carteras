import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import { Toaster } from "sonner";

function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <Toaster richColors closeButton position="top-center" />
      <Header />
      <main className={isHome ? "w-full min-h-[40vh]" : "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <Router>
          <AppShell />
        </Router>
      </CartProvider>
    </SettingsProvider>
  );
}

export default App;
