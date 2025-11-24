import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const BASE_URL = "http://localhost:5000";

const Category = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "/images/placeholder.jpg";
    if (imgPath.startsWith("http")) return imgPath;
    return `${BASE_URL}/uploads/${imgPath.replace(/\\/g, "/")}`;
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/products`);

        const filtered = data.filter(
          (product) =>
            product.category?.toLowerCase() === category.toLowerCase()
        );

        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching category products:", error);
      }
    };

    fetchCategoryProducts();
  }, [category]);

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <h2 className="text-center text-3xl font-bold text-yellow-700 mb-8">
        {category} Collection
      </h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => {
          const isOutOfStock = product.stock <= 0;
          const isLowStock = product.stock > 0 && product.stock <= 5;

          return (
            <div
              key={product._id}
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
            >
              
              {isOutOfStock && (
                <span className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  OUT OF STOCK
                </span>
              )}

            
              {isLowStock && (
                <span className="absolute top-3 left-3 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  LOW STOCK
                </span>
              )}

              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="w-full h-64 object-cover cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              />

              <div className="p-5 text-center">
                <h4 className="text-xl font-semibold text-gray-800 mb-1">
                  {product.name}
                </h4>

                <p className="text-yellow-700 font-bold text-lg mb-3">
                  ₹{product.price?.toLocaleString()}
                </p>

                <button
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className={`px-4 py-2 rounded-full text-white transition ${
                    isOutOfStock
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Category;
