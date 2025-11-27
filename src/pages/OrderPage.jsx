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
  const [reason, setReason] = useState("");

  
  const [showReturnPopup, setShowReturnPopup] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
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
      console.error("Order load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  
  const openCancelPopup = (order) => {
    setSelectedOrder(order);
    setShowReasonPopup(true);
  };

  const submitReason = async () => {
    if (!reason.trim()) return alert("Please select a reason.");

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/api/orders/${selectedOrder._id}/cancel`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmMessage("Order cancelled successfully.");
      setShowConfirmPopup(true);
      setShowReasonPopup(false);
      setReason("");

      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  
  const openReturnPopup = (order, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setShowReturnPopup(true);
  };

  const submitReturnRequest = async () => {
    if (!returnReason.trim()) return alert("Select a reason!");

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/api/orders/${selectedOrder._id}/return/${selectedItem._id}`,
        { reason: returnReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowReturnPopup(false);
      setReturnReason("");
      setConfirmMessage("Return Requested Successfully.");
      setShowConfirmPopup(true);

      fetchOrders();
    } catch (err) {
      console.log(err);
      alert("Return request failed.");
    }
  };

  
  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/orders/${orderId}/invoice`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${orderId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Invoice download failed.");
    }
  };

  const filteredOrders =
    filter === "All"
      ? orderHistory
      : orderHistory.filter((o) => o.status === filter);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-yellow-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        
        <div className="flex justify-center gap-4 mb-6">
          {["All", "Delivered", "Cancelled", "Return Requested", "Returned"].map((b) => (
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

      
        {filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold">
                  Order ID: <span className="text-yellow-700">{order._id}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Ordered: {formatDate(order.createdAt)}
                </p>
                {order.deliveredAt && (
                  <p className="text-sm text-green-600">
                    Delivered: {formatDate(order.deliveredAt)}
                  </p>
                )}
              </div>

              <span className="text-sm font-bold text-gray-800">
                {order.status}
              </span>
            </div>

            
            <div className="border-t pt-3">
              {order.orderItems.map((it) => (
                <div
                  key={it._id}
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

                  
                  <div className="text-right">
                    {it.returnRequested && !it.returnApproved && (
                      <p className="text-orange-600 font-semibold">Return Requested</p>
                    )}
                    {it.returnApproved && !it.returnPickedUp && (
                      <p className="text-blue-600 font-semibold">Pickup Scheduled</p>
                    )}
                    {it.returnPickedUp && (
                      <p className="text-red-600 font-semibold">Returned</p>
                    )}

                    
                    {order.status === "Delivered" &&
                      !it.returnRequested &&
                      !it.returnApproved &&
                      !it.returnPickedUp && (
                        <button
                          onClick={() => openReturnPopup(order, it)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg mt-2"
                        >
                          Return
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>

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
                
                {order.status === "Pending" && (
                  <button
                    onClick={() => openCancelPopup(order)}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl"
                  >
                    Cancel
                  </button>
                )}

              
                <button
                  onClick={() => downloadInvoice(order._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                >
                  Invoice
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      {showReasonPopup && (
        <CancelPopup
          reason={reason}
          setReason={setReason}
          submitReason={submitReason}
          close={() => setShowReasonPopup(false)}
        />
      )}

    
      {showReturnPopup && (
        <ReturnPopup
          reason={returnReason}
          setReason={setReturnReason}
          submitReason={submitReturnRequest}
          close={() => setShowReturnPopup(false)}
        />
      )}

      
      {showConfirmPopup && (
        <ConfirmPopup
          message={confirmMessage}
          close={() => setShowConfirmPopup(false)}
        />
      )}
    </div>
  );
};


const CancelPopup = ({ reason, setReason, submitReason, close }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-80">
      <h3 className="font-bold mb-3">Reason for Cancellation</h3>

      <select
        className="w-full border p-2 rounded"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      >
        <option value="">Select a reason</option>
        <option value="Ordered by mistake">Ordered by mistake</option>
        <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
        <option value="Delivery taking too long">Delivery delay</option>
        <option value="Product not needed now">No longer needed</option>
      </select>

      <div className="flex justify-end gap-3 mt-4">
        <button className="px-3 py-1 bg-gray-300 rounded" onClick={close}>
          Close
        </button>
        <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={submitReason}>
          Cancel Order
        </button>
      </div>
    </div>
  </div>
);

const ReturnPopup = ({ reason, setReason, submitReason, close }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-80">
      <h3 className="font-bold mb-3">Reason for Return</h3>

      <select
        className="w-full border p-2 rounded"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      >
        <option value="">Select a reason</option>
        <option value="Wrong item received">Wrong item received</option>
        <option value="Product damaged">Product damaged</option>
        <option value="Not satisfied with quality">Not satisfied</option>
        <option value="Other">Other</option>
      </select>

      <div className="flex justify-end gap-3 mt-4">
        <button className="px-3 py-1 bg-gray-300 rounded" onClick={close}>
          Close
        </button>
        <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={submitReason}>
          Submit Return
        </button>
      </div>
    </div>
  </div>
);

const ConfirmPopup = ({ message, close }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-80 text-center">
      <p className="mb-4">{message}</p>
      <button className="px-4 py-2 bg-yellow-600 text-white rounded-xl" onClick={close}>
        OK
      </button>
    </div>
  </div>
);

export default OrderPage;
