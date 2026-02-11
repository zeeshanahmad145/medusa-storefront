import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { formatPrice, removeCartId } from "../lib/utils";
import medusa from "../lib/medusa";
import { paymentInfoMap, isStripeLike, isManual } from "../lib/constants";
import { ArrowLeft, Truck, CreditCard, Check, Loader2 } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

// Stripe Payment Form Component
const StripePaymentForm = ({ cart, onSuccess, email, shippingAddress }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const session = cart.payment_collection?.payment_sessions?.find(
        (s) => s.status === "pending"
      );

      if (!session?.data?.client_secret) {
        throw new Error("Payment session not initialized");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        session.data.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
              email: email,
              address: {
                line1: shippingAddress.address_1,
                city: shippingAddress.city,
                postal_code: shippingAddress.postal_code,
                country: shippingAddress.country_code?.toUpperCase(),
              },
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture") {
        await onSuccess();
      }
    } catch (err) {
      toast.error(err.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#9e2146" },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay {formatPrice(cart.total, cart.region?.currency_code || "USD")}
          </>
        )}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { cart, refreshCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  
  // Form states
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    postal_code: "",
    country_code: "us",
    phone: "",
  });
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("pp_system_default");

  useEffect(() => {
    if (!cart) {
      navigate("/cart");
      return;
    }
    fetchShippingOptions();
  }, [cart]);

  const fetchShippingOptions = async () => {
    if (!cart?.id) return;
    
    try {
      const { shipping_options } = await medusa.shippingOptions.list({
        cart_id: cart.id,
      });
      setShippingOptions(shipping_options);
      if (shipping_options.length > 0) {
        setSelectedShipping(shipping_options[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch shipping options:", err);
    }
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const updateCartAddresses = async () => {
    if (!cart) return;
    
    try {
      await medusa.carts.update(cart.id, {
        email,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      });
    } catch (err) {
      throw new Error("Failed to update addresses: " + err.message);
    }
  };

  const addShippingMethod = async () => {
    if (!cart || !selectedShipping) return;
    
    try {
      await medusa.carts.addShippingMethod(cart.id, {
        option_id: selectedShipping,
      });
    } catch (err) {
      throw new Error("Failed to add shipping method: " + err.message);
    }
  };

  const initiatePaymentSession = async () => {
    if (!cart) return;
    
    try {
      // Use the SDK client to initiate payment session
      await medusa.client.request("POST", `/store/carts/${cart.id}/payment-sessions`, {
        provider_id: paymentProvider,
      });
      
      // Refresh cart to get updated payment session
      await refreshCart();
    } catch (err) {
      throw new Error("Failed to initiate payment: " + (err.message || "Unknown error"));
    }
  };

  const completeOrder = async () => {
    if (!cart) return;
    
    try {
      const result = await medusa.carts.complete(cart.id);
      
      if (result?.type === "order") {
        clearCart();
        navigate(`/order-success/${result.order.id}`);
      } else {
        throw new Error("Order completion failed");
      }
    } catch (err) {
      throw new Error("Failed to complete order: " + (err.message || "Unknown error"));
    }
  };

  const handleShippingSubmit = async () => {
    setIsLoading(true);
    try {
      await updateCartAddresses();
      await addShippingMethod();
      await refreshCart();
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (isStripeLike(paymentProvider)) {
      // For Stripe, we need to initiate payment session first
      setIsLoading(true);
      try {
        await initiatePaymentSession();
        setStep(3);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // For manual payment, go directly to review
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      if (isManual(paymentProvider)) {
        await initiatePaymentSession();
      }
      await completeOrder();
    } catch (err) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  const isShippingValid = 
    email && 
    shippingAddress.first_name && 
    shippingAddress.last_name && 
    shippingAddress.address_1 && 
    shippingAddress.city && 
    shippingAddress.postal_code &&
    selectedShipping;

  if (!cart) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate("/cart")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Cart
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { num: 1, label: "Shipping" },
          { num: 2, label: "Payment" },
          { num: 3, label: "Review" },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= s.num
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step > s.num ? <Check className="w-5 h-5" /> : s.num}
            </div>
            <span className={step >= s.num ? "text-gray-900" : "text-gray-500"}>
              {s.label}
            </span>
            {s.num < 3 && <div className="w-8 h-px bg-gray-300 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.first_name}
                      onChange={(e) => handleAddressChange("first_name", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.last_name}
                      onChange={(e) => handleAddressChange("last_name", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address_1}
                    onChange={(e) => handleAddressChange("address_1", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postal_code}
                      onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      value={shippingAddress.country_code}
                      onChange={(e) => handleAddressChange("country_code", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="us">United States</option>
                      <option value="gb">United Kingdom</option>
                      <option value="ca">Canada</option>
                      <option value="de">Germany</option>
                      <option value="fr">France</option>
                      <option value="au">Australia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Method *
                  </label>
                  <div className="space-y-2">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedShipping === option.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={(e) => setSelectedShipping(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="ml-3 flex-1">
                          <span className="font-medium">{option.name}</span>
                          <span className="ml-2 text-gray-600">
                            ({formatPrice(option.amount, cart.region?.currency_code || "USD")})
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleShippingSubmit}
                disabled={!isShippingValid || isLoading}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentProvider === "pp_system_default"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="pp_system_default"
                    checked={paymentProvider === "pp_system_default"}
                    onChange={(e) => setPaymentProvider(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 font-medium">
                    {paymentInfoMap["pp_system_default"].icon} Manual Payment (Test)
                  </span>
                </label>

                <label
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentProvider === "pp_stripe_stripe"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="pp_stripe_stripe"
                    checked={paymentProvider === "pp_stripe_stripe"}
                    onChange={(e) => setPaymentProvider(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 font-medium">
                    {paymentInfoMap["pp_stripe_stripe"].icon} Credit Card (Stripe)
                  </span>
                </label>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Review
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Complete */}
          {step === 3 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Review Order</h2>

              {/* Order Items */}
              <div className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Items</h3>
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.title} x {item.quantity}</span>
                      <span>{formatPrice(item.total || item.unit_price * item.quantity, cart.region?.currency_code || "USD")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{shippingAddress.first_name} {shippingAddress.last_name}</p>
                  <p>{shippingAddress.address_1}</p>
                  <p>{shippingAddress.city}, {shippingAddress.postal_code}</p>
                  <p>{shippingAddress.country_code?.toUpperCase()}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Payment Method</h3>
                <p className="text-sm text-gray-600">
                  {paymentInfoMap[paymentProvider]?.icon} {paymentInfoMap[paymentProvider]?.title}
                </p>
              </div>

              {/* Stripe Card Input */}
              {isStripeLike(paymentProvider) && (
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    cart={cart}
                    email={email}
                    shippingAddress={shippingAddress}
                    onSuccess={completeOrder}
                  />
                </Elements>
              )}

              {/* Manual Payment Place Order */}
              {isManual(paymentProvider) && (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2 text-sm mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600">{item.title} x {item.quantity}</span>
                  <span className="font-medium">
                    {formatPrice(item.total || item.unit_price * item.quantity, cart.region?.currency_code || "USD")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(cart.subtotal || cart.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0), cart.region?.currency_code || "USD")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {cart.shipping_total > 0 
                    ? formatPrice(cart.shipping_total, cart.region?.currency_code || "USD")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  {cart.tax_total > 0 
                    ? formatPrice(cart.tax_total, cart.region?.currency_code || "USD")
                    : "-"}
                </span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(cart.total, cart.region?.currency_code || "USD")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
