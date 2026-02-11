import { Link } from "react-router-dom";
import { formatPrice } from "../lib/utils";

const ProductCard = ({ product }) => {
  const thumbnail = product.thumbnail || product.images?.[0]?.url;
  const price = product.variants?.[0]?.prices?.[0] || product.variants?.[0]?.calculated_price;

  return (
    <Link
      to={`/products/${product.handle || product.id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        {product.subtitle && (
          <p className="text-sm text-gray-500 mt-1">{product.subtitle}</p>
        )}
        <div className="mt-2">
          {price ? (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(price.amount || price, price.currency_code || "USD")}
            </span>
          ) : (
            <span className="text-gray-500">Price not available</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
