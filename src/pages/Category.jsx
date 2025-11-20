import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Category = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "/images/placeholder.jpg";
    if (imgPath.startsWith("http")) return imgPath;
    return `${BASE_URL}/uploads/${imgPath}`;
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/products`);
        const filtered = data.filter(
          (product) => product.category?.toLowerCase() === category.toLowerCase()
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
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
          >
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
                className="px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
