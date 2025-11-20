import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ConfettiPiece = ({ style }) => (
  <div style={{
    width: 10, height: 18, background: style.color,
    position: "absolute", left: style.left, top: style.top,
    transform: `rotate(${style.rot}deg)`,
    borderRadius: 2, opacity: 0.95
  }} />
);

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
    }, 4000);
    return () => clearTimeout(t);
  }, [navigate]);

  const confetti = Array.from({ length: 24 }).map((_, i) => ({
    left: `${5 + (i * 4) % 90}%`,
    top: `${10 + (i * 6) % 70}%`,
    rot: (i * 37) % 90,
    color: ["#D4AF37", "#FFDA77", "#FFC107", "#F0C674"][i % 4],
  }));

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-yellow-100">
        <div className="relative h-40">
          {confetti.map((c, idx) => <ConfettiPiece key={idx} style={c} />)}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-6">
            <svg width="96" height="96" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="#D4AF37" strokeWidth="1.5"/><path d="M6 12l3 3 7-7" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-yellow-700 mt-6">Payment Successful!</h2>
        <p className="text-gray-700 mt-2">Your order has been placed successfully.</p>

        {state && (
          <div className="mt-4 bg-gray-50 border border-yellow-100 p-3 rounded">
            <p className="text-sm text-gray-600">Order ID: <span className="font-medium">{state.orderId || "—"}</span></p>
            <p className="text-sm text-gray-600">Amount: <span className="font-medium">₹{state.amount?.toLocaleString() || "—"}</span></p>
            <p className="text-sm text-gray-600">Payment: <span className="font-medium">{state.method || "—"}</span></p>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => navigate("/orders")} className="px-4 py-2 bg-yellow-600 text-white rounded">View Orders</button>
          <button onClick={() => navigate("/")} className="px-4 py-2 border rounded">Continue Shopping</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
