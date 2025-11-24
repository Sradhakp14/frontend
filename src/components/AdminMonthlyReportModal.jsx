import React from "react";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AdminMonthlyReportModal = ({ isOpen, onClose, details }) => {
  if (!isOpen || !details) return null;

  const { month, year, totalRevenue, bestProduct } = details;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded-lg shadow-lg relative">

        <h2 className="text-lg font-bold mb-3">
          {monthNames[month - 1]} {year}
        </h2>

        <p>
          <strong>Total Revenue:</strong> ₹ {Number(totalRevenue).toLocaleString("en-IN")}
        </p>

        <hr className="my-3" />

        <h3 className="font-semibold text-gray-700 mb-2">Best Selling Product</h3>

        {bestProduct ? (
          <div className="p-3 border rounded bg-gray-50 text-center">
            {bestProduct.image && (
              <img
                src={bestProduct.image}
                alt={bestProduct.name}
                className="w-24 h-24 object-cover rounded mb-3 mx-auto"
              />
            )}
            <p><strong>Name:</strong> {bestProduct.name}</p>
            <p><strong>Category:</strong> {bestProduct.category}</p>
            <p><strong>Price:</strong> ₹ {Number(bestProduct.price).toLocaleString("en-IN")}</p>
            <p><strong>Total Quantity Sold:</strong> {bestProduct.totalQuantity}</p>
            <p><strong>Total Orders:</strong> {bestProduct.totalOrders}</p>
            <p><strong>Revenue (this product):</strong> ₹ {Number(bestProduct.totalRevenue).toLocaleString("en-IN")}</p>
          </div>
        ) : (
          <p>No product sold this month.</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-black text-white py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AdminMonthlyReportModal;
