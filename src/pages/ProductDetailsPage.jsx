import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getImageUrl = (imgPath) => {
  if (!imgPath) return "/images/placeholder.jpg";
  if (imgPath.startsWith("http")) return imgPath;
  if (imgPath.startsWith("uploads/") || imgPath.includes("/uploads/")) {
    return `${BASE_URL}/${imgPath.replace(/\\/g, "/")}`;
  }
  return `${BASE_URL}/uploads/${imgPath.replace(/\\/g, "/")}`;
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/products/${id}`);
        setProduct(data);
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      alert("Please provide both rating and comment.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to submit or edit a review.");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      if (editingReviewId) {
        const { data } = await axios.put(
          `${BASE_URL}/api/products/${id}/reviews/${editingReviewId}`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReviews((prev) =>
          prev.map((r) => (r._id === editingReviewId ? data.review : r))
        );
        setEditingReviewId(null);
        alert("Review updated successfully!");
      } else {
        const { data } = await axios.post(
          `${BASE_URL}/api/products/${id}/reviews`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReviews((prev) => [...prev, data.review]);
        alert("Review submitted successfully!");
      }

      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (rev) => {
    setRating(rev.rating);
    setComment(rev.comment);
    setEditingReviewId(rev._id);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this review?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to delete a review.");
      navigate("/login");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/products/${id}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.message || "Failed to delete review");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-white to-yellow-50">
        <div className="w-14 h-14 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!product)
    return (
      <div className="text-center text-red-600 font-semibold text-lg mt-10">
        Product not found.
      </div>
    );

  const imageUrl = getImageUrl(product.image);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50 to-white py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

        <div className="flex-1 flex justify-center">
          <img
            src={imageUrl}
            alt={product.name}
            className="rounded-2xl shadow-2xl w-full max-w-md object-cover border border-yellow-100 transition-transform duration-300 group-hover:scale-105"
            onError={(e) => (e.target.src = "/images/placeholder.jpg")}
          />
        </div>

        <div className="flex-1 space-y-6">
          <h1 className="text-4xl font-extrabold text-yellow-700 tracking-wide capitalize">
            {product.name}
          </h1>

          {product.category && (
            <p className="text-lg text-gray-500 uppercase tracking-widest">
              {product.category}
            </p>
          )}

          <p className="text-3xl font-semibold text-yellow-800">
            ₹{product.price?.toLocaleString()}
          </p>

          <p className="text-gray-700 leading-relaxed text-base">
            {product.description ||
              "This exclusive piece is crafted with passion, precision, and elegance."}
          </p>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 p-5 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-yellow-700 mb-3">
              Return & Replacement Policy
            </h3>

            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-yellow-600 text-xl">↺</span>
                <p>
                  <strong>7-Day Return / Replacement</strong> – Eligible for damaged,
                  defective, or wrong product delivery.
                </p>
              </li>

              <li className="flex items-start space-x-2">
                <span className="text-yellow-600 text-xl">✔</span>
                <p>
                  Item must be unused & returned in original condition with all
                  packaging.
                </p>
              </li>

              <li className="flex items-start space-x-2">
                <span className="text-yellow-600 text-xl">📦</span>
                <p>
                  Replacement pickup arranged within <strong>2–5 business days</strong>.
                </p>
              </li>

              <li className="flex items-start space-x-2">
                <span className="text-yellow-600 text-xl">💰</span>
                <p>
                  Full refund processed once the product is inspected at warehouse.
                </p>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => addToCart(product)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-8 rounded-full shadow-md"
            >
              Add to Cart
            </button>

            <button
              onClick={() => {
                addToCart(product);
                navigate("/checkout");
              }}
              className="bg-yellow-700 hover:bg-yellow-800 text-white font-semibold py-2.5 px-8 rounded-full shadow-md"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-16 bg-white p-8 rounded-2xl shadow-lg border border-yellow-100">
        <h2 className="text-2xl font-bold text-yellow-700 mb-6">
          Customer Reviews
        </h2>

        {reviews.length > 0 ? (
          <div className="space-y-4 mb-8">
            {reviews.map((rev) => (
              <div key={rev._id || rev.user} className="border-b border-gray-200 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < rev.rating ? "text-yellow-500" : "text-gray-300"}
                      >
                        ★
                      </span>
                    ))}
                    <p className="font-semibold text-gray-800">
                      {rev.user || "Anonymous"}
                    </p>
                  </div>

                  {rev.userId === currentUser?._id && (
                    <div className="space-x-3">
                      <button
                        onClick={() => handleEditReview(rev)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mt-1">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-8">No reviews yet. Be the first to review!</p>
        )}

        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-800 mb-2">
              {editingReviewId ? "Edit Your Rating:" : "Your Rating:"}
            </label>

            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${
                    star <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-800 mb-2">
              {editingReviewId ? "Edit Your Review:" : "Your Review:"}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              placeholder="Share your thoughts about this product..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-full shadow-md disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : editingReviewId
              ? "Update Review"
              : "Submit Review"}
          </button>
        </form>
      </div>

      <div className="mt-20 text-center text-gray-600 text-sm">
        <p className="italic">
          "Jewellery is not just an accessory — it's a reflection of who you are."
        </p>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
