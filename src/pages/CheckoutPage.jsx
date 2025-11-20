import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CheckoutPage = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to continue checkout.");
      navigate("/login");
    }
  }, [navigate]);

  
  useEffect(() => {
    const loadFromLocal = () => {
      const saved = localStorage.getItem("userAddresses");
      const defaultIndex = localStorage.getItem("defaultAddressIndex");

      if (saved) {
        try {
          const list = JSON.parse(saved);
          setAddresses(list);

          if (defaultIndex !== null && defaultIndex !== undefined) {
            setSelectedIndex(Number(defaultIndex));
            setIsChangingAddress(false);
          } else if (list.length > 0 && selectedIndex === null) {
            
            setSelectedIndex(0);
            setIsChangingAddress(false);
          }
        } catch (err) {
          console.error("Failed to parse saved addresses:", err);
        }
      } else {
        setAddresses([]);
        setSelectedIndex(null);
      }
    };

    loadFromLocal();

    
    const onStorage = (e) => {
      if (e.key === "userAddresses" || e.key === "defaultAddressIndex") {
        loadFromLocal();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveAddresses = (updated) => {
    setAddresses(updated);
    localStorage.setItem("userAddresses", JSON.stringify(updated));
  };

  const total = cart.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "/images/placeholder.jpg";
    if (imgPath.startsWith("http")) return imgPath;
    return `${BASE_URL}/uploads/${imgPath}`;
  };

  const handleAddAddress = () => {
    const { name, phone, street, city, state, pincode } = newAddress;
    if (!name || !phone || !street || !city || !state || !pincode) {
      alert("Please fill in all address fields.");
      return;
    }

    const updated = [...addresses, newAddress];
    saveAddresses(updated);
    setNewAddress({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
    setSelectedIndex(updated.length - 1);
    setIsChangingAddress(false);
  };

  const handleSelectAddress = (index) => {
    setSelectedIndex(index);
    setIsChangingAddress(false);
  };

  const handleDeleteAddress = (index) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const updated = addresses.filter((_, i) => i !== index);
      saveAddresses(updated);
      if (selectedIndex === index) setSelectedIndex(null);
      else if (selectedIndex > index) setSelectedIndex((s) => s - 1); 
    }
  };

  const handleEditAddress = (index) => {
    setEditIndex(index);
    setNewAddress(addresses[index]);
    setIsChangingAddress(true);
  };

  const handleSaveEdit = () => {
    const updated = addresses.map((addr, i) => (i === editIndex ? newAddress : addr));
    saveAddresses(updated);
    setEditIndex(null);
    setNewAddress({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
    setIsChangingAddress(false);
  };

  
  const handleProceed = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to place an order.");
      navigate("/login");
      return;
    }

    if (selectedIndex === null || addresses.length === 0) {
      alert("Please select a delivery address.");
      return;
    }

    localStorage.setItem("checkoutAddress", JSON.stringify(addresses[selectedIndex]));
    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-md shadow-lg overflow-hidden">
        
        <div className="bg-[#2874f0] text-white py-4 px-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <p className="text-sm opacity-80">Secure Checkout</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-2 space-y-6">
            <div className="border border-gray-200 rounded-md p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                1. DELIVERY ADDRESS
              </h3>
              {selectedIndex !== null && !isChangingAddress ? (
                <div className="border rounded-md p-3 border-[#2874f0] bg-blue-50 mb-4">
                  <p className="font-medium text-gray-800">
                    {addresses[selectedIndex]?.name} ({addresses[selectedIndex]?.phone})
                  </p>
                  <p className="text-sm text-gray-600">
                    {addresses[selectedIndex]?.street}, {addresses[selectedIndex]?.city}, {addresses[selectedIndex]?.state} - {addresses[selectedIndex]?.pincode}
                  </p>
                  <button
                    onClick={() => setIsChangingAddress(true)}
                    className="text-blue-600 mt-2 font-semibold text-sm"
                  >
                    CHANGE
                  </button>
                </div>
              ) : (
                
                <div className="space-y-3 mb-4">
                  {addresses.length > 0 ? (
                    addresses.map((addr, index) => (
                      <div
                        key={index}
                        className={`border rounded-md p-3 ${selectedIndex === index ? "border-[#2874f0] bg-blue-50" : "border-gray-300"}`}
                      >
                        <div className="flex justify-between items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="address"
                              checked={selectedIndex === index}
                              onChange={() => handleSelectAddress(index)}
                            />
                            <div>
                              <p className="font-medium text-gray-800">{addr.name} ({addr.phone})</p>
                              <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                            </div>
                          </label>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(index)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(index)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm mb-4">No saved addresses found. Add one below.</p>
                  )}
                </div>
              )}
              {isChangingAddress && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">{editIndex !== null ? "Edit Address" : "Add New Address"}</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="border p-2 rounded text-sm"
                    />

                    <input
                      type="text"
                      placeholder="Phone"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="border p-2 rounded text-sm"
                    />

                    <input
                      type="text"
                      placeholder="Street / House No."
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="border p-2 rounded text-sm col-span-2"
                    />

                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="border p-2 rounded text-sm"
                    />

                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="border p-2 rounded text-sm"
                    />

                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="border p-2 rounded text-sm"
                    />
                  </div>

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={editIndex !== null ? handleSaveEdit : handleAddAddress}
                      className="bg-[#2874f0] hover:bg-[#1f5ecb] text-white py-2 px-4 rounded-md text-sm font-semibold"
                    >
                      {editIndex !== null ? "Save Changes" : "Save Address"}
                    </button>

                    {editIndex !== null && (
                      <button
                        onClick={() => {
                          setEditIndex(null);
                          setNewAddress({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
                          setIsChangingAddress(false);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="border border-gray-200 rounded-md p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">2. ORDER SUMMARY ({cart.length} items)</h3>

              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <p className="text-sm text-gray-600">Qty: {item.qty || 1}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-[#2874f0]">₹{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-md bg-[#fafafa] h-fit sticky top-20 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">PRICE DETAILS</h3>

            <div className="flex justify-between mb-2 text-sm">
              <span>Price ({cart.length} items)</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Delivery Charges</span>
              <span className="text-green-600">FREE</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between text-base font-semibold text-gray-800 mb-4">
              <span>Total Amount</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <button onClick={handleProceed} className="w-full bg-[#fb641b] hover:bg-[#e35a12] text-white py-3 rounded-sm font-semibold text-sm transition">
              CONTINUE TO PAYMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
