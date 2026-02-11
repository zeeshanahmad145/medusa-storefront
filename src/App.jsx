import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:handle" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </Router>
    </CartProvider>
  );
}

export default App;
