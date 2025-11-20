import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return navigate("/admin/login");

    const fetchData = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setOrders(ordersRes.data.orders || []);
        setUsers(usersRes.data.users || []);

        
        const stored = JSON.parse(localStorage.getItem("contactMessages") || "[]");
        setMessages(stored);

      } catch (err) {
        console.error("Dashboard Error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      <header className="flex justify-between items-center p-6 bg-yellow-500 shadow-md">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
          }}
          className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center p-10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 w-full max-w-6xl">

          
          <div
            className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition cursor-pointer"
            onClick={() => navigate("/admin/orders")}
          >
            <h2 className="text-xl font-semibold text-gray-700">Total Orders</h2>
            <p className="text-4xl font-bold text-yellow-600 mt-3">{orders.length}</p>
          </div>

          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700">Total Users</h2>
            <p className="text-4xl font-bold text-yellow-600 mt-3">{users.length}</p>
          </div>

        
          <div
            className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition cursor-pointer"
            onClick={() => navigate("/addproduct")}
          >
            <h2 className="text-xl font-semibold text-gray-700">Add Product</h2>
            <p className="text-4xl font-bold text-yellow-600 mt-3">+</p>
          </div>

          
          <div
            className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition cursor-pointer"
            onClick={() => navigate("/admin/messages")}
          >
            <h2 className="text-xl font-semibold text-gray-700">Messages</h2>
            <p className="text-4xl font-bold text-yellow-600 mt-3">{messages.length}</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
