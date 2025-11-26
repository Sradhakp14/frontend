import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const BASE_URL = "http://localhost:5000";

const CheckoutPage = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [userId, setUserId] = useState(null);

  const emptyForm = {
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  };

  const [form, setForm] = useState(emptyForm);

  // LOGIN PROTECTION
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    setUserId(user._id);
  }, [navigate]);

  // LOAD USER ADDRESSES
  useEffect(() => {
    if (!userId) return;

    const saved = localStorage.getItem(`addresses_${userId}`);

    if (saved) {
      const list = JSON.parse(saved);
      setAddresses(list);
      if (list.length > 0) setSelectedIndex(0);
    } else {
      setAddresses([]);
      setSelectedIndex(null);
    }
  }, [userId]);

  const saveAddresses = (list) => {
    setAddresses(list);
    localStorage.setItem(`addresses_${userId}`, JSON.stringify(list));
  };

  // ---------------------------------------------------------
  // ADDRESS VALIDATION (PINCODE + PHONE FIXED HERE)
  // ---------------------------------------------------------
  const validateForm = () => {
    const { name, phone, street, city, state, pincode } = form;

    if (!name || !phone || !street || !city || !state || !pincode) {
      alert("Please fill all fields");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be exactly 10 digits");
      return false;
    }

    if (!/^\d{6}$/.test(pincode)) {
      alert("Pincode must be exactly 6 digits");
      return false;
    }

    return true;
  };

  // ADD NEW ADDRESS
  const handleAddAddress = () => {
    if (!validateForm()) return;

    const updated = [...addresses, form];
    saveAddresses(updated);

    setSelectedIndex(updated.length - 1);
    setForm(emptyForm);
    setIsAddingOrEditing(false);
  };

  // SAVE EDIT
  const handleSaveEdit = () => {
    if (!validateForm()) return;

    const updated = addresses.map((a, i) => (i === editIndex ? form : a));
    saveAddresses(updated);

    setEditIndex(null);
    setForm(emptyForm);
    setIsAddingOrEditing(false);
  };

  // DELETE ADDRESS
  const handleDeleteAddress = (index) => {
    if (!window.confirm("Delete this address?")) return;

    const updated = addresses.filter((_, i) => i !== index);
    saveAddresses(updated);

    setSelectedIndex(updated.length > 0 ? 0 : null);
  };

  // PROCEED TO PAYMENT
  const handleProceed = () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (selectedIndex === null) {
      alert("Please select an address");
      return;
    }

    localStorage.setItem(
      "checkoutAddress",
      JSON.stringify(addresses[selectedIndex])
    );

    navigate("/payment");
  };

  // FIX IMAGE
  const getImageUrl = (url) => {
    if (!url) return "/images/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${BASE_URL}/uploads/${url}`;
  };

  const total = cart.reduce(
    (acc, item) => acc + item.price * (item.qty || 1),
    0
  );

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow-xl border border-yellow-300">

        {/* HEADER */}
        <div className="bg-yellow-500 text-white py-4 px-6 flex justify-between items-center rounded-t-md">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <p className="text-sm opacity-90">Premium & Secure Checkout</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-2 space-y-6">

            {/* ADDRESS SECTION */}
            <div className="border border-yellow-300 rounded-md p-5 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-yellow-700 mb-4">
                1. DELIVERY ADDRESS
              </h3>

              {/* SELECTED ADDRESS VIEW */}
              {selectedIndex !== null && !isAddingOrEditing ? (
                <div className="border p-4 rounded-md bg-yellow-50 border-yellow-400 shadow-sm">
                  <p className="font-medium">
                    {addresses[selectedIndex].name} ({addresses[selectedIndex].phone})
                  </p>
                  <p className="text-sm text-gray-700">
                    {addresses[selectedIndex].street}, {addresses[selectedIndex].city},{" "}
                    {addresses[selectedIndex].state} - {addresses[selectedIndex].pincode}
                  </p>

                  <button
                    onClick={() => setIsAddingOrEditing(true)}
                    className="text-yellow-700 mt-2 font-semibold text-sm"
                  >
                    CHANGE ADDRESS
                  </button>
                </div>
              ) : (
                <>
                  {/* LIST OF ADDRESSES */}
                  {addresses.length === 0 ? (
                    <p className="text-gray-500 text-sm mb-3">
                      No saved addresses. Add a new one below.
                    </p>
                  ) : (
                    addresses.map((a, i) => (
                      <div
                        key={i}
                        className={`border rounded-md p-3 mb-2 ${
                          selectedIndex === i ? "border-yellow-500 bg-yellow-50" : "border-gray-300"
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={selectedIndex === i}
                            onChange={() => setSelectedIndex(i)}
                          />
                          <div>
                            <p className="font-semibold">{a.name}</p>
                            <p className="text-sm text-gray-700">
                              {a.street}, {a.city}, {a.state} - {a.pincode}
                            </p>
                          </div>
                        </label>

                        <div className="flex gap-3 mt-2 text-sm">
                          <button
                            onClick={() => {
                              setEditIndex(i);
                              setForm(a);
                              setIsAddingOrEditing(true);
                            }}
                            className="text-yellow-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteAddress(i)}
                            className="text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {!isAddingOrEditing && (
                    <button
                      onClick={() => setIsAddingOrEditing(true)}
                      className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600"
                    >
                      ADD NEW ADDRESS
                    </button>
                  )}
                </>
              )}

              {/* ADD/EDIT FORM */}
              {isAddingOrEditing && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-yellow-700 mb-2">
                    {editIndex !== null ? "Edit Address" : "Add New Address"}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(form).map((key, idx) => (
                      <input
                        key={idx}
                        className={`border border-gray-400 p-2 rounded text-sm ${
                          key === "street" ? "col-span-2" : ""
                        }`}
                        placeholder={
                          key === "pincode"
                            ? "Pincode"
                            : key.charAt(0).toUpperCase() + key.slice(1)
                        }
                        value={form[key]}
                        onChange={(e) => {
                          let val = e.target.value;

                          // PHONE: only digits, max 10
                          if (key === "phone") {
                            val = val.replace(/\D/g, "");
                            if (val.length > 10) return;
                          }

                          // PINCODE: only digits, max 6
                          if (key === "pincode") {
                            val = val.replace(/\D/g, "");
                            if (val.length > 6) return;
                          }

                          setForm({ ...form, [key]: val });
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={editIndex !== null ? handleSaveEdit : handleAddAddress}
                      className="bg-yellow-500 text-white py-2 px-4 rounded text-sm hover:bg-yellow-600"
                    >
                      {editIndex !== null ? "Save Changes" : "Save Address"}
                    </button>

                    <button
                      onClick={() => {
                        setIsAddingOrEditing(false);
                        setEditIndex(null);
                        setForm(emptyForm);
                      }}
                      className="bg-gray-300 text-gray-800 py-2 px-4 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ORDER SUMMARY */}
            <div className="border border-yellow-300 rounded-md p-5 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-yellow-700">
                2. ORDER SUMMARY ({cart.length} items)
              </h3>

              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={getImageUrl(item.image)}
                        alt=""
                        className="w-16 h-16 rounded border object-cover"
                      />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-700">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-yellow-700">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRICE DETAILS */}
          <div className="border border-yellow-300 rounded-md p-5 bg-yellow-50 h-fit sticky top-20 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-yellow-800">
              PRICE DETAILS
            </h3>

            <div className="flex justify-between text-sm mb-2">
              <span>Price ({cart.length} items)</span>
              <span>₹{total}</span>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <span>Delivery</span>
              <span className="text-green-600">FREE</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between font-semibold text-base mb-4 text-yellow-800">
              <span>Total Amount</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={handleProceed}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-md text-sm font-semibold"
            >
              CONTINUE TO PAYMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
