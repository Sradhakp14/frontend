import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Delete, AddLocationAlt } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

const ProfilePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    addresses: [],
    defaultAddressIndex: 0,
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    city: "",
    state: "",
    fullAddress: "",
  });

  const [openModal, setOpenModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editProfileModal, setEditProfileModal] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const addresses = Array.isArray(data.addresses) ? data.addresses : [];
      const defaultIndex =
        typeof data.defaultAddressIndex === "number"
          ? data.defaultAddressIndex
          : 0;

      setProfile({ ...data, addresses, defaultAddressIndex: defaultIndex });

      localStorage.setItem("userAddresses", JSON.stringify(addresses));
      localStorage.setItem("defaultAddressIndex", String(defaultIndex));
    } catch (error) {
      console.error("Fetch profile error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      if (!editProfileForm.name || !editProfileForm.email) {
        alert("Name and Email are required!");
        return;
      }

      await axios.put(
        `${BASE_URL}/api/auth/update-profile`,
        editProfileForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchProfile();
      setEditProfileModal(false);
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Failed to update profile");
    }
  };

  const handleAddOrEditAddress = async () => {
    try {
      const { name, phone, pincode, locality, city, state, fullAddress } = form;

      if (!name || !phone || !pincode || !locality || !city || !state || !fullAddress) {
        alert("All address fields are required!");
        return;
      }

      const payload = { name, phone, pincode, locality, city, state, fullAddress };
      if (editingIndex !== null) payload.index = editingIndex;

      await axios.post(`${BASE_URL}/api/auth/update-addresses`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await fetchProfile();

      setOpenModal(false);
      setEditingIndex(null);
      resetForm();
    } catch (error) {
      console.error("Add/Edit address error:", error);
      alert(error.response?.data?.message || "Failed to save address");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      pincode: "",
      locality: "",
      city: "",
      state: "",
      fullAddress: "",
    });
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/auth/delete-address`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { index },
      });

      await fetchProfile();
    } catch (error) {
      console.error("Delete address error:", error);
      alert(error.response?.data?.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (index) => {
    try {
      await axios.post(
        `${BASE_URL}/api/auth/set-default-address`,
        { index },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchProfile();
    } catch (error) {
      console.error("Set default address error:", error);
      alert("Failed to set default address");
    }
  };

  const renderAddress = (address) => {
    if (!address) return "";
    const extra = address.fullAddress ? `, ${address.fullAddress}` : "";
    return `${address.name}, ${address.phone}, ${address.locality}, ${address.city}, ${address.state} - ${address.pincode}${extra}`;
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="bg-white shadow-sm rounded-lg p-5 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {profile.name || "Your Profile"}
          </h2>
          <p className="text-gray-600">{profile.email}</p>
        </div>

        <button
          onClick={() => {
            setEditProfileForm({
              name: profile.name,
              email: profile.email,
            });
            setEditProfileModal(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Edit Profile
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">My Addresses</h3>
          <button
            onClick={() => {
              resetForm();
              setEditingIndex(null);
              setOpenModal(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <AddLocationAlt />
            Add New Address
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && <p className="col-span-2 text-gray-500">Loading...</p>}
          {!loading && profile.addresses.length === 0 && (
            <p className="col-span-2 text-gray-500">No saved addresses yet.</p>
          )}

          {profile.addresses.map((address, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 border rounded-lg shadow-sm ${
                profile.defaultAddressIndex === index
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <p className="text-gray-800 mb-2 font-medium">
                {renderAddress(address)}
              </p>

              {profile.defaultAddressIndex === index && (
                <span className="text-sm bg-orange-500 text-white px-2 py-1 rounded">
                  Default
                </span>
              )}

              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => {
                    setForm({
                      name: address.name,
                      phone: address.phone,
                      pincode: address.pincode,
                      locality: address.locality,
                      city: address.city,
                      state: address.state,
                      fullAddress: address.fullAddress,
                    });
                    setEditingIndex(index);
                    setOpenModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Edit fontSize="small" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Delete fontSize="small" /> Delete
                </button>

                {profile.defaultAddressIndex !== index && (
                  <button
                    onClick={() => handleSetDefault(index)}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editingIndex !== null ? "Edit Address" : "Add New Address"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border p-2 rounded-md"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border p-2 rounded-md"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="border p-2 rounded-md"
                placeholder="Pincode"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              <input
                className="border p-2 rounded-md"
                placeholder="Locality"
                value={form.locality}
                onChange={(e) => setForm({ ...form, locality: e.target.value })}
              />
              <input
                className="border p-2 rounded-md"
                placeholder="City/District"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                className="border p-2 rounded-md"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>

            <textarea
              className="border p-2 rounded-md w-full mt-3"
              placeholder="Full Address"
              value={form.fullAddress}
              onChange={(e) =>
                setForm({ ...form, fullAddress: e.target.value })
              }
            ></textarea>

            <div className="flex justify-end mt-4 gap-3">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setEditingIndex(null);
                }}
                className="px-4 py-2 rounded-md border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrEditAddress}
                className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
              >
                {editingIndex !== null ? "Save Changes" : "Add Address"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {editProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Edit Profile
            </h3>

            <input
              className="border p-2 rounded-md w-full mb-3"
              value={editProfileForm.name}
              placeholder="Full Name"
              onChange={(e) =>
                setEditProfileForm({
                  ...editProfileForm,
                  name: e.target.value,
                })
              }
            />

            <input
              className="border p-2 rounded-md w-full"
              value={editProfileForm.email}
              placeholder="Email Address"
              onChange={(e) =>
                setEditProfileForm({
                  ...editProfileForm,
                  email: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditProfileModal(false)}
                className="px-4 py-2 rounded-md border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
