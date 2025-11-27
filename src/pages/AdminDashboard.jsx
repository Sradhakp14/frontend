import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [counts, setCounts] = useState({
    products: 0,
    orders: 0,
    users: 0,
    messages: 0, 
  });

  useEffect(() => {
    if (!token) {
      navigate("/adminlogin");
      return;
    }

    const fetchCounts = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [productsRes, ordersRes, usersRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/products/count`, { headers }),
          axios.get(`${BASE_URL}/api/admin/orders/count`, { headers }),
          axios.get(`${BASE_URL}/api/admin/users/count`, { headers }),
        ]);

        
        const savedMessages = JSON.parse(
          localStorage.getItem("contactMessages") || "[]"
        );

        setCounts({
          products: productsRes.data.count || 0,
          orders: ordersRes.data.count || 0,
          users: usersRes.data.count || 0,
          messages: savedMessages.length || 0, 
        });

      } catch (err) {
        console.error("Dashboard Count Error:", err);

        if (err.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchCounts();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/adminlogin");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        
        <div
          className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/admin/products")}
        >
          <h2 className="text-xl font-semibold text-gray-700">Products</h2>
          <p className="text-4xl font-bold text-yellow-600 mt-3">
            {counts.products}
          </p>
        </div>

        
        <div
          className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/admin/orders")}
        >
          <h2 className="text-xl font-semibold text-gray-700">Orders</h2>
          <p className="text-4xl font-bold text-yellow-600 mt-3">
            {counts.orders}
          </p>
        </div>

        
        <div
          className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/admin/users")}
        >
          <h2 className="text-xl font-semibold text-gray-700">Users</h2>
          <p className="text-4xl font-bold text-yellow-600 mt-3">
            {counts.users}
          </p>
        </div>

        
        <div
          className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/admin/messages")}
        >
          <h2 className="text-xl font-semibold text-gray-700">Messages</h2>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            {counts.messages}
          </p>
        </div>

        
        <div
          className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition cursor-pointer"
          onClick={() => navigate("/admin/revenue")}
        >
          <h2 className="text-xl font-semibold text-gray-700">Revenue</h2>
          <p className="text-4xl font-bold text-green-600 mt-3">₹</p>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
