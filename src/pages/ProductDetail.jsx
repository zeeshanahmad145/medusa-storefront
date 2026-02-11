import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import medusa from "../lib/medusa";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/utils";
import { ArrowLeft, Plus, Minus, ShoppingCart, Check } from "lucide-react";

const ProductDetail = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [handle]);

  const fetchProduct = async () => {
    try {
      let productData;
      
      // Try to fetch by handle first
      try {
        const { products } = await medusa.products.list({
          handle: handle,
        });
        productData = products[0];
      } catch {
        // Fallback to fetching by ID
        const { product: p } = await medusa.products.retrieve(handle);
        productData = p;
      }

      if (!productData) {
        toast.error("Product not found");
        navigate("/products");
        return;
      }

      setProduct(productData);
      if (productData.variants?.length > 0) {
        setSelectedVariant(productData.variants[0]);
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
      toast.error("Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(selectedVariant.id, quantity);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
      console.error(err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, selectedVariant?.inventory_quantity || 10)));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const price = selectedVariant?.prices?.[0] || selectedVariant?.calculated_price;
  const thumbnail = product.thumbnail || product.images?.[0]?.url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
          
          {product.subtitle && (
            <p className="text-lg text-gray-600 mb-4">{product.subtitle}</p>
          )}

          {price && (
            <div className="text-3xl font-bold text-gray-900 mb-6">
              {formatPrice(price.amount || price, price.currency_code || "USD")}
            </div>
          )}

          {product.description && (
            <div className="prose prose-gray mb-8">
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Variant Selection */}
          {product.variants?.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Variant
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      selectedVariant?.id === variant.id
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !selectedVariant}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isAddingToCart ? (
              <>
                <Check className="w-5 h-5" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
