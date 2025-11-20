import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const token = localStorage.getItem("adminToken");

  const fixPath = (path) => {
    if (!path) return "";
    return path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/^uploads\//, "");
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Admin Orders Fetch Error:", err);
      setOrders([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (orders && users) setLoading(false);
  }, [orders, users]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${BASE_URL}/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      console.error("Update Status Error:", err);
    }
  };

  const markPickup = async (orderId) => {
    try {
      await axios.put(
        `${BASE_URL}/api/orders/${orderId}/return/pickup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      console.error("Mark pickup error:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    if (filter === "Returned") return order.status === "Returned";
    if (filter === "Returned Requests") return order.returnRequested === true;
    return order.status === filter;
  });

  const statusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "text-green-700 font-semibold";
      case "Cancelled":
        return "text-red-700 font-semibold";
      case "Shipped":
        return "text-blue-700 font-semibold";
      case "Out for Delivery":
        return "text-purple-700 font-semibold";
      case "Processing":
        return "text-yellow-700 font-semibold";
      case "Returned":
        return "text-green-800 font-semibold";
      default:
        return "text-gray-700";
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        GoldMart Admin Orders
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">
        {[
          "All",
          "Pending",
          "Processing",
          "Shipped",
          "Out for Delivery",
          "Delivered",
          "Cancelled",
          "Returned",
          "Returned Requests",
        ].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-black text-white" : "bg-white border"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-700">Total Orders</h2>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold text-gray-700">Revenue</h2>
          <p className="text-2xl font-bold">
            ₹
            {orders
              .reduce((s, o) => s + (o.totalPrice || 0), 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

     
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white shadow rounded p-5 border border-gray-200"
          >
           
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {order?.user?.name || "Guest User"}
                </h2>
                <p className="text-sm text-gray-600">
                  {order?.user?.email || "No email"}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">₹{order.totalPrice}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
                <p className={`mt-1 ${statusColor(order.status)}`}>
                  {order.status}
                </p>

                {order.returnRequested && !order.returnApproved && (
                  <p className="text-purple-700 font-semibold">
                    Return Requested
                  </p>
                )}

                {order.returnApproved && !order.returnPickupDone && (
                  <p className="text-blue-700 font-semibold">
                    Return Approved — Pickup Pending
                  </p>
                )}

                {order.returnPickupDone && (
                  <p className="text-green-700 font-semibold">Returned</p>
                )}
              </div>
            </div>

           
            {order.returnRequested && (
              <div className="bg-purple-50 p-3 rounded mb-3 border-l-4 border-purple-500">
                <p className="font-semibold">
                  Return Reason: {order.returnReason}
                </p>
                <p className="text-sm">
                  Requested:{" "}
                  {order.returnRequestedAt
                    ? new Date(order.returnRequestedAt).toLocaleString("en-IN")
                    : "—"}
                </p>
              </div>
            )}

            
            <table className="w-full border text-sm mb-3">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Image</th>
                  <th className="p-2 border">Product</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Price</th>
                </tr>
              </thead>

              <tbody>
                {order.orderItems.map((it, idx) => (
                  <tr key={idx}>
                    
                    <td className="p-2 border text-center">
                      <img
                        src={`${BASE_URL}/uploads/${fixPath(it.image)}`}
                        alt={it.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>

                   
                    <td className="p-2 border">
                      <p className="font-semibold">{it.name}</p>
                      <p className="text-xs text-gray-500">
                        {it.category || ""}
                      </p>
                      <p className="text-xs text-gray-500">
                        {it.description || ""}
                      </p>
                    </td>

                 
                    <td className="p-2 border text-center">{it.qty}</td>

                  
                    <td className="p-2 border text-center">₹{it.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

           
            <div className="flex justify-between items-center">
              <div>
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                  className="border px-2 py-1 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              <div>
                {order.returnApproved && !order.returnPickupDone && (
                  <button
                    onClick={() => markPickup(order._id)}
                    className="ml-3 px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Mark Pickup Done
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
