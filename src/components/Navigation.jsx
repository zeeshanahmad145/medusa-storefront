import { Link } from "react-router-dom";
import { ShoppingCart, Store, Package } from "lucide-react";
import { useCart } from "../context/CartContext";

const Navigation = () => {
  const { cart } = useCart();
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Store className="w-6 h-6" />
            <span>Medusa Store</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/products"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Package className="w-5 h-5" />
              <span className="hidden sm:inline">Products</span>
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
