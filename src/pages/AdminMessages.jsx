import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return navigate("/admin/login");

    const stored = JSON.parse(localStorage.getItem("contactMessages") || "[]");
    setMessages(stored);
  }, []);

  const deleteMessage = (index) => {
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated);
    localStorage.setItem("contactMessages", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-8">
      <h1 className="text-3xl font-bold text-yellow-700 mb-6">
        Customer Messages
      </h1>

      <button
        onClick={() => navigate("/admin/dashboard")}
        className="mb-6 bg-yellow-500 text-white px-4 py-2 rounded-lg"
      >
        ← Back to Dashboard
      </button>

      {messages.length === 0 ? (
        <p className="text-gray-600 text-lg">No messages received yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-xl shadow border border-gray-200"
            >
              <p><strong>Name:</strong> {msg.name}</p>
              <p><strong>Email:</strong> {msg.email}</p>
              <p className="mt-2"><strong>Message:</strong> {msg.message}</p>
              <p className="text-sm text-gray-500 mt-2">{msg.date}</p>

              <button
                onClick={() => deleteMessage(index)}
                className="mt-4 bg-red-500 text-white px-3 py-1 rounded-md"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
