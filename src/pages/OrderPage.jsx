import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const OrderPage = () => {
  const [loading, setLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [filter, setFilter] = useState("All");

  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState("");
  const [reason, setReason] = useState("");

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const [showReturnConfirmPopup, setShowReturnConfirmPopup] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderHistory(res.data.orders || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getImageUrl = (p) => {
    if (!p) return "/images/placeholder.jpg";
    if (p.startsWith("http")) return p;
    return `${BASE_URL}/uploads/${p.replace(/\\/g, "/")}`;
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const openPopup = (order, type) => {
    if (type === "return") {
      const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;
      if (!deliveredAt) {
        setConfirmMessage("Delivered time not recorded.");
        setShowConfirmPopup(true);
        return;
      }
      const diffDays = (new Date() - deliveredAt) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        setConfirmMessage("Return window expired.");
        setShowConfirmPopup(true);
        return;
      }
      setSelectedOrder(order);
      setShowReturnConfirmPopup(true);
      return;
    }

    setSelectedOrder(order);
    setActionType(type);
    setShowReasonPopup(true);
  };

  const confirmReturnProceed = () => {
    setShowReturnConfirmPopup(false);
    setActionType("return");
    setShowReasonPopup(true);
  };

  const submitReason = async () => {
    if (!reason.trim()) return alert("Please select a reason.");

    try {
      const token = localStorage.getItem("token");

      if (actionType === "cancel") {
        await axios.put(
          `${BASE_URL}/api/orders/${selectedOrder._id}/cancel`,
          { reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConfirmMessage("Order cancelled successfully.");
      }

      if (actionType === "return") {
        await axios.put(
          `${BASE_URL}/api/orders/${selectedOrder._id}/return-request`,
          { reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConfirmMessage("Return requested. We'll inform you after approval and pickup.");
      }

      setShowReasonPopup(false);
      setReason("");
      setShowConfirmPopup(true);
      fetchOrders();
    } catch (err) {
      alert(err?.response?.data?.message || "Something went wrong.");
    }
  };

  const filteredOrders =
    filter === "All"
      ? orderHistory
      : filter === "Returned"
      ? orderHistory.filter((o) => o.status === "Returned")
      : orderHistory.filter((o) => o.status === filter);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading orders...
      </div>
    );

  return (
    <div className="min-h-screen bg-yellow-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center gap-4 mb-6">
          {["All", "Delivered", "Cancelled", "Returned"].map((b) => (
            <button
              key={b}
              onClick={() => setFilter(b)}
              className={`px-4 py-2 rounded-xl ${
                filter === b ? "bg-yellow-600 text-white" : "bg-gray-200"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <h2 className="text-3xl font-extrabold text-yellow-700 mb-8 text-center">
          Your Orders
        </h2>

        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-600">
            No {filter} orders found.
          </p>
        )}

        {filteredOrders.map((order) => {
          const deliveredAt = order.deliveredAt
            ? new Date(order.deliveredAt)
            : null;
          const withinReturnPeriod =
            deliveredAt &&
            (new Date() - deliveredAt) / (1000 * 60 * 60 * 24) <= 7;

          const showReturnButton =
            order.status === "Delivered" &&
            withinReturnPeriod &&
            !order.returnRequested;

          return (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-md p-6 mb-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">
                    Order ID:{" "}
                    <span className="text-yellow-700">{order._id}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Ordered on: {formatDate(order.createdAt)}
                  </p>

                  {order.estimatedDelivery &&
                    ["Pending", "Processing", "Shipped", "Out for Delivery"].includes(order.status) && (
                      <p className="text-sm text-green-700 font-semibold">
                        Estimated Delivery: {formatDate(order.estimatedDelivery)}
                      </p>
                    )}

                  {order.deliveredAt && (
                    <p className="text-sm text-green-600">
                      Delivered on: {formatDate(order.deliveredAt)}
                    </p>
                  )}
                  {order.cancelledAt && (
                    <p className="text-sm text-red-600">
                      Cancelled on: {formatDate(order.cancelledAt)}
                    </p>
                  )}

                  {order.returnRequested && !order.returnApproved && (
                    <p className="text-purple-600">
                      Return Requested: {formatDate(order.returnRequestedAt)}
                    </p>
                  )}
                  {order.returnApproved && !order.returnPickupDone && (
                    <p className="text-blue-600">
                      Return Approved — Pickup Pending
                    </p>
                  )}
                  {order.returnPickupDone && (
                    <p className="text-green-700 font-semibold">Returned</p>
                  )}
                </div>

                <span
                  className={`text-sm font-bold ${
                    order.status === "Returned"
                      ? "text-green-700"
                      : "text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="border-t pt-3">
                {order.orderItems.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center mb-3 pb-2 border-b"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(it.image)}
                        className="w-16 h-16 rounded-md object-cover border"
                      />
                      <div>
                        <p className="font-medium">{it.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {it.qty} × ₹{it.price}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-yellow-700">
                      ₹{it.qty * it.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-700">
                    Payment:{" "}
                    <span className="text-yellow-700">
                      {order.paymentMethod}
                    </span>
                  </p>
                  <p className="text-lg font-bold text-yellow-700">
                    Total: ₹{order.totalPrice}
                  </p>
                  {order.returnReason && (
                    <p className="text-sm text-purple-600 mt-2">
                      Return Reason: {order.returnReason}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  {!order.deliveredAt && order.status !== "Cancelled" && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setActionType("cancel");
                        setShowReasonPopup(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl"
                    >
                      Cancel
                    </button>
                  )}

                  {showReturnButton && (
                    <button
                      onClick={() => openPopup(order, "return")}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl"
                    >
                      Request Return
                    </button>
                  )}

                  {order.returnRequested && !order.returnApproved && (
                    <span className="text-purple-600 font-semibold">
                      Return Requested
                    </span>
                  )}
                  {order.returnApproved && !order.returnPickupDone && (
                    <span className="text-blue-600 font-semibold">
                      Return Approved
                    </span>
                  )}
                  {order.returnPickupDone && (
                    <span className="text-green-600 font-semibold">
                      Returned
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {showReturnConfirmPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-80 p-6 rounded-xl shadow-lg text-center">
              <h2 className="text-lg font-bold mb-2 text-purple-700">
                Confirm Return Request?
              </h2>
              <p className="text-gray-700 mb-4">
                Do you want to request return for this order?
              </p>
              <div className="flex justify-between">
                <button
                  onClick={() => setShowReturnConfirmPopup(false)}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  No
                </button>
                <button
                  onClick={confirmReturnProceed}
                  className="px-3 py-1 bg-purple-600 text-white rounded"
                >
                  Yes, continue
                </button>
              </div>
            </div>
          </div>
        )}

        {showReasonPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-2xl w-80 shadow-lg">
              <h3 className="text-lg font-bold mb-3">
                {actionType === "cancel" ? "Cancel Order" : "Return Order"}
              </h3>
              <select
                className="w-full p-2 rounded-xl border bg-gray-100"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">-- Select Reason --</option>
                {actionType === "cancel" ? (
                  <>
                    <option>Ordered by mistake</option>
                    <option>Delivery taking too long</option>
                    <option>Found cheaper elsewhere</option>
                    <option>Changed my mind</option>
                  </>
                ) : (
                  <>
                    <option>Product damaged</option>
                    <option>Wrong item delivered</option>
                    <option>Size / fit issue</option>
                    <option>Not as expected</option>
                  </>
                )}
              </select>

              <div className="mt-5 flex justify-between">
                <button
                  onClick={() => setShowReasonPopup(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={submitReason}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-5 rounded-2xl shadow-xl w-80 text-center">
              <h2 className="text-lg font-bold text-green-700 mb-3">Success!</h2>
              <p className="text-gray-700 mb-4">{confirmMessage}</p>
              <button
                onClick={() => {
                  setShowConfirmPopup(false);
                  fetchOrders();
                }}
                className="px-6 py-2 bg-yellow-600 text-white rounded-xl"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
