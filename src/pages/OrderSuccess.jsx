import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import medusa from "../lib/medusa";
import { formatPrice } from "../lib/utils";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { order: orderData } = await medusa.orders.retrieve(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-16 rounded-lg w-16 mx-auto"></div>
          <div className="bg-gray-200 h-8 rounded w-1/2 mx-auto"></div>
          <div className="bg-gray-200 h-32 rounded-lg mt-8"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 text-lg">Order not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
        >
          <Home className="w-5 h-5" />
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <p className="text-gray-900 font-semibold mt-2">
          Order ID: {order.display_id || order.id}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Details
        </h2>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
              <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                {item.variant?.title && (
                  <p className="text-sm text-gray-500">{item.variant.title}</p>
                )}
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                <p className="font-medium text-gray-900 mt-1">
                  {formatPrice(item.total || item.unit_price * item.quantity, order.currency_code)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatPrice(order.subtotal, order.currency_code)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">{formatPrice(order.shipping_total, order.currency_code)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">{formatPrice(order.tax_total, order.currency_code)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>{formatPrice(order.total, order.currency_code)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
        <div className="text-gray-600">
          <p>{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
          <p>{order.shipping_address?.address_1}</p>
          {order.shipping_address?.address_2 && <p>{order.shipping_address.address_2}</p>}
          <p>
            {order.shipping_address?.city}, {order.shipping_address?.postal_code}
          </p>
          <p>{order.shipping_address?.country_code?.toUpperCase()}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Continue Shopping
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50"
        >
          <Home className="w-5 h-5" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
