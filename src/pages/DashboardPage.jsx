import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FaShoppingBag, FaUserCircle, FaUserShield } from "react-icons/fa";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const cards = [
    {
      title: "Orders",
      desc: "View your past and current orders",
      icon: <FaShoppingBag className="text-yellow-600 text-4xl mb-3" />,
      btnText: "View Orders",
      action: () => navigate("/orders"),
      color:
        "bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg",
    },
    {
      title: "Profile",
      desc: "See and edit your profile details",
      icon: <FaUserCircle className="text-yellow-600 text-4xl mb-3" />,
      btnText: "View Profile",
      action: () => navigate("/profile"),
      color:
        "bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-yellow-600 mb-8">
          User Dashboard
        </h2>

        {user && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-10 max-w-md mx-auto border border-gray-100 transition-transform hover:scale-[1.01]">
            <div className="flex items-center justify-center mb-4">
              {user.isAdmin ? (
                <FaUserShield className="text-red-500 text-5xl" />
              ) : (
                <FaUserCircle className="text-yellow-600 text-5xl" />
              )}
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome, {user.name || "User"} 
            </h3>
            <p className="text-gray-600 mb-1">Email: {user.email}</p>
            <p className="text-gray-600">
              Role:{" "}
              {user.isAdmin ? (
                <span className="text-red-500 font-medium">Admin</span>
              ) : (
                <span className="text-green-600 font-medium">Customer</span>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md rounded-xl p-6 border border-gray-100 flex flex-col items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              {card.icon}
              <h4 className="text-xl font-semibold text-gray-800 mb-1">
                {card.title}
              </h4>
              <p className="text-gray-600 mb-4">{card.desc}</p>
              <button
                onClick={card.action}
                className={`px-5 py-2 rounded-lg font-medium transition ${card.color}`}
              >
                {card.btnText}
              </button>
            </div>
          ))}
        </div>

        {user?.isAdmin && (
          <div className="mt-10">
            <button
              onClick={() => navigate("/admin")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Go to Admin Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
