import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

const BASE_URL = "http://localhost:5000";


const getImageUrl = (imgPath) => {
  if (!imgPath) return "/images/placeholder.jpg";
  if (imgPath.startsWith("http")) return imgPath;
  return `${BASE_URL}/uploads/${imgPath.replace(/\\/g, "/")}`;
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);


  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/products/${id}`);
        setProduct(data);
        setReviews(data.reviews || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) return navigate("/login");

    if (!rating || !comment.trim()) {
      alert("Rating & comment required!");
      return;
    }

    try {
      if (editing) {
        const { data } = await axios.put(
          `${BASE_URL}/api/products/${id}/reviews/${editing}`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReviews((prev) =>
          prev.map((r) => (r._id === editing ? data.review : r))
        );
        setEditing(null);
      } else {
        const { data } = await axios.post(
          `${BASE_URL}/api/products/${id}/reviews`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReviews((prev) => [...prev, data.review]);
      }

      setRating(0);
      setComment("");
    } catch {
      alert("Failed to submit review");
    }
  };

  
  const handleDelete = async (rid) => {
    if (!window.confirm("Delete review?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/products/${id}/reviews/${rid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r._id !== rid));
    } catch {
      alert("Failed to delete");
    }
  };

  
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!product)
    return <h2 className="text-center text-red-600 mt-12">Product Not Found</h2>;

  const isOut = product.stock <= 0;
  const isLow = product.stock > 0 && product.stock <= 5;

  return (
    <div className="py-12 px-6 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        
        {isOut && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1 rounded-full">
            OUT OF STOCK
          </div>
        )}
        {!isOut && isLow && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-1 rounded-full">
            LOW STOCK
          </div>
        )}
        {!isOut && !isLow && (
          <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-1 rounded-full">
            IN STOCK
          </div>
        )}

    
        <div className="flex-1 flex justify-center">
          <img
            src={getImageUrl(product.image)}
            className="rounded-lg shadow-lg w-full max-w-md"
            alt={product.name}
          />
        </div>

        
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-bold text-yellow-700">{product.name}</h1>
          <p className="text-gray-500 uppercase">{product.category}</p>

          <p className="text-3xl font-bold text-yellow-800">
            ₹{product.price?.toLocaleString()}
          </p>

          {isLow && <p className="text-red-500 font-semibold">Only {product.stock} left!</p>}
          {isOut && <p className="text-red-600 font-semibold">Out of Stock</p>}

          <p className="text-gray-700">{product.description}</p>

        
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex gap-4">
              <button
                disabled={isOut}
                onClick={() => addToCart(product)}
                className={`px-6 py-2 rounded-full text-white ${
                  isOut ? "bg-gray-400" : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {isOut ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                disabled={isOut}
                onClick={() => {
                  addToCart(product);
                  navigate("/checkout");
                }}
                className={`px-6 py-2 rounded-full text-white ${
                  isOut ? "bg-gray-400" : "bg-yellow-800 hover:bg-yellow-900"
                }`}
              >
                Buy Now
              </button>
            </div>

            
            <div className="mt-2 bg-yellow-50 border border-yellow-300 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Return Policy
              </h3>
              <ul className="list-disc ml-5 text-gray-700 text-sm space-y-1">
                <li>Returns accepted within 7 days of delivery.</li>
                <li>Product must be unused & in original packaging.</li>
                <li>All certificates & tags must be included.</li>
                <li>No returns on customized jewellery.</li>
                <li>Refund processed in 5–7 working days.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">Customer Reviews</h2>

        {reviews.length === 0 && (
          <p className="text-gray-500">No reviews yet.</p>
        )}

        
        {reviews.map((r) => (
          <div
            key={r._id}
            className="p-4 border rounded-lg bg-white shadow-sm mb-4"
          >
            <div className="flex items-center gap-3">
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                {r.rating} ★
              </span>
              <p className="text-sm font-semibold text-gray-800">{r.user}</p>
            </div>

            <p className="text-gray-700 text-sm mt-2 leading-relaxed">
              {r.comment}
            </p>

            {user && user._id === r.userId && (
              <div className="flex gap-4 mt-2 text-xs">
                <button
                  onClick={() => {
                    setEditing(r._id);
                    setRating(r.rating);
                    setComment(r.comment);
                  }}
                  className="text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(r._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

      
        <form
          onSubmit={handleSubmitReview}
          className="mt-10 p-5 border rounded-lg bg-white shadow-sm max-w-md"
        >
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            {editing ? "Edit Review" : "Write a Review"}
          </h3>

        
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer text-xl ${
                  star <= rating ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="w-full border rounded-md p-2 text-sm"
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
          />

          <button className="mt-3 w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 text-sm">
            {editing ? "Update Review" : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
