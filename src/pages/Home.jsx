import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import medusa from "../lib/medusa";
import ProductCard from "../components/ProductCard";
import { ArrowRight, ShoppingBag, AlertCircle, RefreshCw } from "lucide-react";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { products } = await medusa.products.list({
        limit: 4,
      });
      setFeaturedProducts(products);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      if (err.message?.includes("ECONNREFUSED") || err.message?.includes("Network Error")) {
        setError("Unable to connect to the backend server. Please make sure your Medusa backend is running on port 9000.");
      } else {
        setError("Failed to load products. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Medusa Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing products with seamless shopping experience
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-1">Connection Error</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={fetchFeaturedProducts}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
