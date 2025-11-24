import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GpayPopup, CardPopup, CodPopup } from "../components/PaymentPopups";

const BASE_URL = "http://localhost:5000";

const PaymentPage = () => {
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [showGpay, setShowGpay] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showCod, setShowCod] = useState(false);

  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState({});

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    const ad = JSON.parse(localStorage.getItem("checkoutAddress") || "{}");
    setCart(c);
    setAddress(ad);
  }, []);

  const total = cart.reduce((acc, i) => acc + i.price * (i.qty || 1), 0);

  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/150";
    if (img.startsWith("http")) return img;
    if (img.includes("uploads")) return `${BASE_URL}/${img.replace(/\\/g, "/")}`;
    return `${BASE_URL}/uploads/${img.replace(/\\/g, "/")}`;
  };

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!cart.length) {
        alert("Cart is empty!");
        return;
      }

      const formattedItems = cart.map((item) => ({
        product: item._id, 
        name: item.name,
        description: item.description || "",
        qty: item.qty,
        price: item.price,
        image: item.image,
      }));

      const { data } = await axios.post(
        `${BASE_URL}/api/orders`,
        {
          orderItems: formattedItems,
          shippingAddress: address,
          paymentMethod,
          totalPrice: total,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.removeItem("cart");
      navigate("/orders", { state: { orderId: data._id || data.order._id } });
    } catch (err) {
      console.error("Place order error:", err);
      alert("Order failed. Server error.");
    }
  };

  const handlePayment = () => {
    if (!paymentMethod) return alert("Select a payment method first!");

    if (paymentMethod === "UPI") setShowGpay(true);
    if (paymentMethod === "CARD") setShowCard(true);
    if (paymentMethod === "COD") setShowCod(true);
  };

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl border rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Secure Payment</h2>

    
        <div className="border rounded-xl p-5 mb-8 bg-yellow-50">
          <h3 className="text-lg font-semibold">Delivery Address</h3>
          <p>{address.fullAddress}</p>
          <p>
            {address.city}, {address.state} - {address.pincode}
          </p>
          <p>
            {address.phone} | {address.name}
          </p>
        </div>

        
        <div className="border rounded-xl p-5 mb-8">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b">
              <div className="flex items-center gap-4">
                <img
                  src={getImageUrl(item.image)}
                  className="w-16 h-16 rounded-xl object-cover border"
                  alt={item.name}
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.qty} × ₹{item.price}
                  </p>
                </div>
              </div>
              <p className="font-semibold">₹{item.price * (item.qty || 1)}</p>
            </div>
          ))}
        </div>

    
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { type: "UPI", text: "GPay / PhonePe / Paytm" },
            { type: "CARD", text: "Visa / Mastercard" },
            { type: "COD", text: "Cash on Delivery" },
          ].map((m) => (
            <div
              key={m.type}
              onClick={() => setPaymentMethod(m.type)}
              className={`border p-6 rounded-xl text-center cursor-pointer ${
                paymentMethod === m.type ? "border-yellow-600 bg-yellow-50" : ""
              }`}
            >
              <p className="font-semibold">{m.type}</p>
              <p className="text-sm text-gray-500">{m.text}</p>
            </div>
          ))}
        </div>

        
        <div className="flex justify-between border-t pt-4">
          <span className="text-lg font-semibold">Total Amount</span>
          <span className="text-xl font-bold text-yellow-700">₹{total}</span>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-full mt-6 text-lg"
        >
          Pay Now
        </button>
      </div>

      
      {showGpay && (
        <GpayPopup
          amount={total}
          onClose={() => setShowGpay(false)}
          onSuccess={() => {
            setShowGpay(false);
            placeOrder();
          }}
        />
      )}

      {showCard && (
        <CardPopup
          amount={total}
          onClose={() => setShowCard(false)}
          onSuccess={() => {
            setShowCard(false);
            placeOrder();
          }}
        />
      )}

      {showCod && (
        <CodPopup
          onClose={() => setShowCod(false)}
          onSuccess={() => {
            setShowCod(false);
            placeOrder();
          }}
        />
      )}
    </div>
  );
};

export default PaymentPage;
