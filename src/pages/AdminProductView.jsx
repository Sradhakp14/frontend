import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const AdminProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(res.data);
      } catch (err) {
        console.log("View product error:", err);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product)
    return (
      <p className="text-center mt-10 text-xl font-semibold">Loading...</p>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-4">{product.name}</h2>

      <img
        src={`${BASE_URL}/uploads/${product.image}`}
        alt={product.name}
        className="w-72 h-72 object-cover rounded mb-4"
      />

      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Price:</strong> ₹{product.price}</p>
      <p><strong>Stock:</strong> {product.stock}</p>
      <p className="mt-3"><strong>Description:</strong></p>
      <p className="text-gray-700">{product.description}</p>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Back
      </button>
    </div>
  );
};

export default AdminProductView;
