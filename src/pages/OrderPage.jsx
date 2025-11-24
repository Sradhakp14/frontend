import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

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

  const navigate = useNavigate();

  // ============================
  // 🔥 Redirect if NOT logged in
  // ============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, []);


  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrderHistory(sorted);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatus = (o) => o.status || "Pending";

  const getImageUrl = (img) => {
    if (!img) return "/images/placeholder.jpg";
    if (img.startsWith("http")) return img;
    return `${BASE_URL}/uploads/${img.replace(/\\/g, "/")}`;
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openPopup = (order, type) => {
    const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;

    if (type === "return") {
      if (!deliveredAt) {
        setConfirmMessage("Order not delivered yet.");
        setShowConfirmPopup(true);
        return;
      }

      const diffDays =
        (new Date() - deliveredAt) / (1000 * 60 * 60 * 24);

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
        setConfirmMessage("Return request submitted.");
      }

      setShowReasonPopup(false);
      setReason("");
      setShowConfirmPopup(true);
      fetchOrders();
    } catch (err) {
      alert(err?.response?.data?.message || "Something went wrong.");
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/orders/${orderId}/invoice`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${orderId}.pdf`;
      link.click();
    } catch (err) {
      alert("Invoice download failed.");
    }
  };

  const filteredOrders =
    filter === "All"
      ? orderHistory
      : filter === "Returned"
      ? orderHistory.filter((o) => getStatus(o) === "Returned")
      : orderHistory.filter((o) => getStatus(o) === filter);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-yellow-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* FILTER BUTTONS */}
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
          <p className="text-center text-gray-600">No {filter} orders found.</p>
        )}

        {/* ORDERS */}
        {filteredOrders.map((order) => {
          const status = getStatus(order);
          const deliveredAt = order.deliveredAt
            ? new Date(order.deliveredAt)
            : null;

          const withinReturnPeriod =
            deliveredAt &&
            (new Date() - deliveredAt) / (1000 * 60 * 60 * 24) <= 7;

          return (
            <div key={order._id} className="bg-white rounded-2xl shadow-md p-6 mb-6">

              {/* ORDER HEADER */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">
                    Order ID:{" "}
                    <span className="text-yellow-700">{order._id}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Ordered on: {formatDate(order.createdAt)}
                  </p>

                  {order.deliveredAt && (
                    <p className="text-sm text-green-600">
                      Delivered on: {formatDate(order.deliveredAt)}
                    </p>
                  )}
                </div>

                <span className="text-sm font-bold text-gray-800">
                  {status}
                </span>
              </div>

              <div className="border-t pt-3">
                {order.orderItems.map((it, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b pb-2 mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(it.image)}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <p className="font-medium">{it.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {it.qty} × ₹{it.price}
                        </p>
                      </div>
                    </div>

                    <strong className="text-yellow-700">
                      ₹{it.qty * it.price}
                    </strong>
                  </div>
                ))}
              </div>

              {/* BUTTONS */}
              <div className="flex justify-between mt-4 items-center">
                <div>
                  <p className="font-semibold">
                    Payment:{" "}
                    <span className="text-yellow-700">{order.paymentMethod}</span>
                  </p>
                  <p className="text-lg font-bold text-yellow-700">
                    Total: ₹{order.totalPrice}
                  </p>
                </div>

                <div className="flex gap-3">
                  {status === "Pending" && (
                    <button
                      onClick={() => openPopup(order, "cancel")}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl"
                    >
                      Cancel
                    </button>
                  )}

                  {deliveredAt && withinReturnPeriod && !order.returnRequested && (
                    <button
                      onClick={() => openPopup(order, "return")}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl"
                    >
                      Request Return
                    </button>
                  )}

                  {deliveredAt && (
                    <button
                      onClick={() => downloadInvoice(order._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                    >
                      Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== CANCEL / RETURN REASON POPUP ===== */}
      {showReasonPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80">
            <h3 className="font-bold mb-3">Select Reason</h3>

            <select
              className="w-full border p-2 rounded"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found cheaper somewhere else">Found cheaper</option>
              <option value="Delivery taking too long">Delivery delay</option>
              <option value="Product not needed now">Not needed</option>
            </select>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => setShowReasonPopup(false)}
              >
                Close
              </button>

              <button
                className="px-3 py-1 bg-yellow-600 text-white rounded"
                onClick={submitReason}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== FINAL CONFIRM POPUP ==== */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80 text-center">
            <p className="mb-4">{confirmMessage}</p>
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded-xl"
              onClick={() => setShowConfirmPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ==== RETURN CONFIRM BEFORE REASON SCREEN ==== */}
      {showReturnConfirmPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80 text-center">
            <p className="mb-4">
              Are you sure you want to request a return?
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setShowReturnConfirmPopup(false)}
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded"
                onClick={confirmReturnProceed}
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderPage;
