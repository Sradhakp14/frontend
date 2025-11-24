import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  const fixPath = (img) => {
    if (!img) return "";
    return img.replace(/\\/g, "/").replace("public/", "").trim();
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Admin Orders Fetch Error:", err);
      setOrders([]);
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${BASE_URL}/api/admin/orders/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --------------------------
  // 🔥 DATE FILTER FUNCTIONS
  // --------------------------

  const isToday = (date) => {
    const d = new Date(date);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isThisWeek = (date) => {
    const d = new Date(date);
    const today = new Date();
    const first = today.getDate() - today.getDay();
    const last = first + 6;
    const weekStart = new Date(today.setDate(first));
    const weekEnd = new Date(today.setDate(last));

    return d >= weekStart && d <= weekEnd;
  };

  const isThisMonth = (date) => {
    const d = new Date(date);
    const today = new Date();
    return (
      d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    );
  };

  // --------------------------
  // APPLY DATE FILTER
  // --------------------------
  const dateFilteredOrders = orders.filter((o) => {
    if (dateFilter === "Today") return isToday(o.createdAt);
    if (dateFilter === "This Week") return isThisWeek(o.createdAt);
    if (dateFilter === "This Month") return isThisMonth(o.createdAt);
    return true;
  });

  // --------------------------
  // APPLY STATUS FILTER
  // --------------------------
  const finalFilteredOrders =
    filter === "All"
      ? dateFilteredOrders
      : dateFilteredOrders.filter((o) => o.status === filter);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 text-xl font-semibold">
        Loading Orders...
      </p>
    );

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* ---------------- SIDEBAR ---------------- */}
      <div className="w-64 bg-white border-r shadow p-5">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>

        {/* STATUS FILTER */}
        <h3 className="font-semibold mb-2 text-gray-700">Status</h3>
        {[
          "All",
          "Pending",
          "Processing",
          "Shipped",
          "Out for Delivery",
          "Delivered",
          "Cancelled",
          "Returned",
        ].map((st) => (
          <div key={st} className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              checked={filter === st}
              onChange={() => setFilter(st)}
            />
            <label>{st}</label>
          </div>
        ))}

        <hr className="my-4" />

        {/* DATE FILTER */}
        <h3 className="font-semibold mb-2 text-gray-700">Date Filter</h3>
        {["All", "Today", "This Week", "This Month"].map((dt) => (
          <div key={dt} className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              checked={dateFilter === dt}
              onChange={() => setDateFilter(dt)}
            />
            <label>{dt}</label>
          </div>
        ))}
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">GoldMart Admin Orders</h1>

        {finalFilteredOrders.length === 0 ? (
          <p className="text-gray-600 text-lg text-center mt-10">
            No orders available.
          </p>
        ) : (
          <div className="space-y-6">
            {finalFilteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white border shadow rounded-lg p-5"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">{order.user?.name}</h2>
                    <p className="text-gray-500 text-sm">{order.user?.email}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-xl">₹{order.totalPrice}</p>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 font-medium">{order.status}</p>
                  </div>
                </div>

                {/* Items table */}
                <table className="w-full border text-sm mb-4">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="p-2 border">Image</th>
                      <th className="p-2 border">Product</th>
                      <th className="p-2 border text-center">Qty</th>
                      <th className="p-2 border text-center">Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {order.orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2 text-center">
                          <img
                            src={`${BASE_URL}/uploads/${fixPath(item.image)}`}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => (e.target.src = "/placeholder.png")}
                          />
                        </td>
                        <td className="border p-2">{item.name}</td>
                        <td className="border p-2 text-center">{item.qty}</td>
                        <td className="border p-2 text-center">₹{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Status Only — Pickup Button Removed */}
                <div className="flex justify-between items-center">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(order._id, e.target.value)
                    }
                    className="border px-3 py-1 rounded"
                  >
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Out for Delivery</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                    <option>Returned</option>
                  </select>

                  {/* Pickup button fully removed */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
