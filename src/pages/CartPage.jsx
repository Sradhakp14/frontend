import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

const CartPage = () => {
  const { cart, removeFromCart, clearCart, updateQty } = useCart();
  const navigate = useNavigate();

  
  const getImageUrl = (imgPath) => {
    if (!imgPath) return "/images/placeholder.jpg";
    if (imgPath.startsWith("http")) return imgPath;
    return `${BASE_URL}/uploads/${imgPath}`;
  };

  
  const getDeliveryDate = () => {
    const daysToAdd = Math.floor(Math.random() * 5) + 1; 
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);

    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const total = cart.reduce(
    (acc, item) => acc + item.price * (item.qty || 1),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-5xl mx-auto flex gap-6">

        
        <div className="flex-1">
          <h2 className="bg-white text-xl font-semibold p-4 shadow">
            My Cart ({cart.length})
          </h2>

          {cart.length === 0 ? (
            <p className="text-center text-gray-600 text-lg mt-6">
              Your cart is empty.
            </p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow-sm border rounded-lg p-4 mt-4"
                >
                  <div className="flex gap-5">

                  
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-28 h-28 object-cover rounded-lg border"
                    />

                    
                    <div className="flex-1 space-y-1">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h4>

                      <p className="text-sm text-gray-600">
                        {item.category ? item.category : "Jewellery Item"}
                      </p>

                      <p className="text-yellow-700 font-bold text-xl">
                        ₹{item.price.toLocaleString()}
                      </p>

                      
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() =>
                            updateQty(item._id, Math.max(1, (item.qty || 1) - 1))
                          }
                          className="w-8 h-8 border flex items-center justify-center rounded text-lg"
                        >
                          -
                        </button>

                        <div className="w-10 h-8 border rounded flex items-center justify-center bg-gray-100">
                          {item.qty || 1}
                        </div>

                        <button
                          onClick={() =>
                            updateQty(item._id, (item.qty || 1) + 1)
                          }
                          className="w-8 h-8 border flex items-center justify-center rounded text-lg"
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="ml-4 text-red-500 font-medium hover:underline"
                        >
                          REMOVE
                        </button>
                      </div>

                    
                      <p className="text-sm text-green-600 font-medium mt-2">
                        Delivery by {getDeliveryDate()} | Free Delivery
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              
              <div className="bg-white shadow-md p-4 mt-4 flex justify-between">
                <button
                  onClick={clearCart}
                  className="px-6 py-2 bg-red-500 text-white rounded-md"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => navigate("/checkout")}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-md"
                >
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>

        
        {cart.length > 0 && (
          <div className="w-80">
            <div className="bg-white shadow-lg rounded-lg border p-4 sticky top-6">
              <h3 className="text-gray-600 font-semibold text-lg">
                PRICE DETAILS
              </h3>
              <hr className="my-3" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Price ({cart.length} items)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
