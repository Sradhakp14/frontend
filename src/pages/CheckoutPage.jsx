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

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [userId, setUserId] = useState(null);

  // ------------------------------------------
  // LOGIN PROTECTION + LOAD USER ID
  // ------------------------------------------
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

  // ------------------------------------------
  // LOAD SAVED ADDRESSES FOR THIS USER ONLY
  // ------------------------------------------
  useEffect(() => {
    if (!userId) return;

    const saved = localStorage.getItem(`addresses_${userId}`);

    if (saved) {
      const list = JSON.parse(saved);
      setAddresses(list);
      if (list.length > 0) setSelectedIndex(0);
    } else {
      // NEW USER → NO PREFILLED ADDRESS
      setAddresses([]);
      setSelectedIndex(null);
    }
  }, [userId]);

  // Save addresses
  const saveAddresses = (list) => {
    setAddresses(list);
    localStorage.setItem(`addresses_${userId}`, JSON.stringify(list));
  };

  // ------------------------------------------
  // ADD NEW ADDRESS
  // ------------------------------------------
  const handleAddAddress = () => {
    const { name, phone, street, city, state, pincode } = newAddress;

    if (!name || !phone || !street || !city || !state || !pincode) {
      alert("Please fill all fields");
      return;
    }

    const updated = [...addresses, newAddress];

    saveAddresses(updated);
    setSelectedIndex(updated.length - 1);

    setNewAddress({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
    });

    setIsAddingOrEditing(false);
  };

  // ------------------------------------------
  // SAVE EDIT ADDRESS
  // ------------------------------------------
  const handleSaveEdit = () => {
    const updated = addresses.map((a, i) =>
      i === editIndex ? newAddress : a
    );

    saveAddresses(updated);
    setEditIndex(null);

    setNewAddress({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
    });

    setIsAddingOrEditing(false);
  };

  // ------------------------------------------
  // DELETE ADDRESS
  // ------------------------------------------
  const handleDeleteAddress = (index) => {
    if (!window.confirm("Delete this address?")) return;

    const updated = addresses.filter((_, i) => i !== index);

    saveAddresses(updated);
    setSelectedIndex(updated.length > 0 ? 0 : null);
  };

  // ------------------------------------------
  // PROCEED TO PAYMENT
  // ------------------------------------------
  const handleProceed = () => {
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

  // ------------------------------------------
  // FIX IMAGE URL
  // ------------------------------------------
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
    <div className="min-h-screen bg-[#f1f3f6] py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#2874f0] text-white py-4 px-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <p className="text-sm opacity-80">Secure Checkout</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-2 space-y-6">

            {/* ADDRESS SECTION */}
            <div className="border border-gray-200 rounded-md p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                1. DELIVERY ADDRESS
              </h3>

              {/* Selected Address View */}
              {selectedIndex !== null && !isAddingOrEditing ? (
                <div className="border p-4 rounded-md bg-blue-50 border-[#2874f0]">
                  <p className="font-medium">
                    {addresses[selectedIndex].name} ({addresses[selectedIndex].phone})
                  </p>
                  <p className="text-sm text-gray-600">
                    {addresses[selectedIndex].street}, {addresses[selectedIndex].city},{" "}
                    {addresses[selectedIndex].state} - {addresses[selectedIndex].pincode}
                  </p>

                  <button
                    onClick={() => setIsAddingOrEditing(true)}
                    className="text-blue-600 mt-2 font-semibold text-sm"
                  >
                    CHANGE ADDRESS
                  </button>
                </div>
              ) : (
                <>
                  {/* Show all addresses or message */}
                  {addresses.length === 0 ? (
                    <p className="text-gray-500 text-sm mb-3">
                      No saved addresses. Add a new one below.
                    </p>
                  ) : (
                    addresses.map((a, i) => (
                      <div
                        key={i}
                        className={`border rounded-md p-3 mb-2 ${
                          selectedIndex === i
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={selectedIndex === i}
                            onChange={() => setSelectedIndex(i)}
                          />
                          <div>
                            <p className="font-medium">{a.name}</p>
                            <p className="text-sm text-gray-600">
                              {a.street}, {a.city}, {a.state} - {a.pincode}
                            </p>
                          </div>
                        </label>

                        <div className="flex gap-3 mt-2 text-sm">
                          <button
                            onClick={() => {
                              setEditIndex(i);
                              setNewAddress(a);
                              setIsAddingOrEditing(true);
                            }}
                            className="text-blue-600"
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

                  {/* Add new address button */}
                  {!isAddingOrEditing && (
                    <button
                      onClick={() => setIsAddingOrEditing(true)}
                      className="mt-3 bg-[#2874f0] text-white px-4 py-2 rounded text-sm"
                    >
                      ADD NEW ADDRESS
                    </button>
                  )}
                </>
              )}

              {/* Add / Edit Form */}
              {isAddingOrEditing && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {editIndex !== null ? "Edit Address" : "Add New Address"}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="border p-2 rounded text-sm"
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, name: e.target.value })
                      }
                    />

                    <input
                      className="border p-2 rounded text-sm"
                      placeholder="Phone"
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                    />

                    <input
                      className="border p-2 rounded text-sm col-span-2"
                      placeholder="Street Address"
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, street: e.target.value })
                      }
                    />

                    <input
                      className="border p-2 rounded text-sm"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                    />

                    <input
                      className="border p-2 rounded text-sm"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                    />

                    <input
                      className="border p-2 rounded text-sm"
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, pincode: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={editIndex !== null ? handleSaveEdit : handleAddAddress}
                      className="bg-[#2874f0] text-white py-2 px-4 rounded text-sm"
                    >
                      {editIndex !== null ? "Save Changes" : "Save Address"}
                    </button>

                    <button
                      onClick={() => {
                        setIsAddingOrEditing(false);
                        setEditIndex(null);
                        setNewAddress({
                          name: "",
                          phone: "",
                          street: "",
                          city: "",
                          state: "",
                          pincode: "",
                        });
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
            <div className="border border-gray-200 rounded-md p-5">
              <h3 className="text-lg font-semibold mb-4">
                2. ORDER SUMMARY ({cart.length} items)
              </h3>

              <div className="divide-y">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center py-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={getImageUrl(item.image)}
                        alt=""
                        className="w-16 h-16 rounded border object-cover"
                      />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.qty}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-[#2874f0]">
                      ₹{item.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE TOTAL */}
          <div className="border border-gray-200 rounded-md p-5 bg-[#fafafa] h-fit sticky top-20">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
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

            <div className="flex justify-between font-semibold text-base mb-4">
              <span>Total Amount</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={handleProceed}
              className="w-full bg-[#fb641b] hover:bg-[#e35a12] text-white py-3 rounded-sm text-sm"
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
