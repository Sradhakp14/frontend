import React, { useState } from "react";
import axios from "axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Registration successful!");
      console.log(res.data);
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

        {["name", "email", "password"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={formData[field]}
            onChange={handleChange}
            required
            className="border p-2 mb-4 w-full rounded"
          />
        ))}

        <button
          type="submit"
          className="bg-yellow-700 text-white w-full py-2 rounded hover:bg-yellow-800 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
