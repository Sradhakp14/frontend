import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const BASE_URL = "http://localhost:5000";

const ShopPage = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "/images/placeholder.jpg";
    if (imgPath.startsWith("http")) return imgPath;
    return `${BASE_URL}/uploads/${imgPath}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/products`);
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    if (!term) setFilteredProducts(products);
    else {
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        )
      );
    }
  }, [search, products]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50 to-white py-12 px-6">
      <h2 className="text-center text-4xl font-extrabold text-yellow-700 mb-8">
        Explore Our Jewellery Collection
      </h2>

      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search jewellery..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md py-3 px-5 rounded-full border border-yellow-300 shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No products found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
          {filteredProducts.map((product) => (
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
                <h4
                  className="text-xl font-semibold text-gray-800 mb-1 hover:text-yellow-700 cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {product.name}
                </h4>

                <p className="text-yellow-700 font-bold text-lg mb-1">
                  ₹{product.price?.toLocaleString()}
                </p>

          
                {product.countInStock === 0 ? (
                  <span className="inline-block bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                    SOLD OUT
                  </span>
                ) : product.countInStock <= 5 ? (
                  <span className="inline-block bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full mb-3">
                    LOW STOCK
                  </span>
                ) : (
                  <span className="mb-3 block"></span>
                )}

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-full hover:bg-yellow-50"
                  >
                    View
                  </button>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.countInStock === 0}
                    className={`px-4 py-2 rounded-full text-white ${
                      product.countInStock === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-yellow-600 hover:bg-yellow-700"
                    }`}
                  >
                    {product.countInStock === 0 ? "Unavailable" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
