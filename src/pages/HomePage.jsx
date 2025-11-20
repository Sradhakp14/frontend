import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const categories = [
    { name: "Rings", image: "public/images/ring.jpg" },
    { name: "Earrings", image: "public/images/earrings.jpg" },
    { name: "Necklaces", image: "public/images/necklace .jpg" },
    { name: "Bracelets & Bangles", image: "public/images/bangle .jpg" },
    { name: "Pendants", image: "public/images/pendant.jpg" },
    { name: "Nose Pins", image: "public/images/nosepin.jpg" },
    { name: "Jewellery Sets", image: "public/images/jewellery.jpg" },
    { name: "Anklets", image: "public/images/LOTUS ANKLET.jpg" },
    { name: "Toe Rings", image: "public/images/toering.jpg" },
  ];

  const featured = [
    { id: 1, name: "Diamond Ring", price: "₹18,000", image: "public/images/ring.jpg" },
    { id: 2, name: "Gold Necklace", price: "₹22,500", image: "public/images/necklace.jpg" },
    { id: 3, name: "Silver Bangles", price: "₹8,000", image: "public/images/bangle.jpg" },
  ];

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white text-gray-800">
      <section className="relative bg-gradient-to-r from-yellow-600 to-yellow-400 text-white text-center py-24">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Gold Mart – Where Elegance Shines
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Discover timeless jewellery that defines your beauty
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/shop"
            className="bg-white text-yellow-700 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-100 transition"
          >
            Shop Now
          </Link>
          <Link
            to="/profile"
            className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
          >
            Profile
          </Link>
        </div>
      </section>

      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 px-6 md:px-20">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={`/category/${cat.name}`}
              className="bg-white rounded-xl shadow hover:shadow-lg p-4 transition-transform transform hover:scale-105"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="rounded-lg mb-3 mx-auto h-32 w-32 object-cover"
              />
              <h3 className="text-lg font-semibold">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16 text-center">
        <h2 className="text-3xl font-bold mb-10">Featured Jewellery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6 md:px-20">
          {featured.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow hover:shadow-lg p-6 transition-transform transform hover:scale-105"
            >
              <img
                src={item.image}
                alt={item.name}
                className="rounded-lg mb-4 mx-auto h-48 w-48 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-700 mb-4">{item.price}</p>
              <button
                onClick={() => handleAddToCart(item)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
