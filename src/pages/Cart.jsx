import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/utils";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const Cart = () => {
  const { cart, isLoading, updateLineItem, deleteLineItem } = useCart();
  const navigate = useNavigate();

  const handleUpdateQuantity = async (lineId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateLineItem(lineId, newQuantity);
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (lineId) => {
    try {
      await deleteLineItem(lineId);
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Continue Shopping
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.unit_price * item.quantity),
    0
  );
  const shippingTotal = cart.shipping_total || 0;
  const taxTotal = cart.tax_total || 0;
  const total = cart.total || subtotal + shippingTotal + taxTotal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border"
            >
              {/* Product Image */}
              <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.variant?.product?.handle || item.product_id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate block"
                >
                  {item.title}
                </Link>
                {item.variant?.title && item.variant.title !== "Default variant" && (
                  <p className="text-sm text-gray-500">{item.variant.title}</p>
                )}
                <p className="text-gray-900 font-medium mt-1">
                  {formatPrice(item.unit_price, cart.region?.currency_code || "USD")}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Remove</span>
                  </button>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(item.total || item.unit_price * item.quantity, cart.region?.currency_code || "USD")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal, cart.region?.currency_code || "USD")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shippingTotal > 0 
                    ? formatPrice(shippingTotal, cart.region?.currency_code || "USD")
                    : "Calculated at checkout"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  {taxTotal > 0 
                    ? formatPrice(taxTotal, cart.region?.currency_code || "USD")
                    : "Calculated at checkout"}
                </span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(total, cart.region?.currency_code || "USD")}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              to="/products"
              className="block text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
