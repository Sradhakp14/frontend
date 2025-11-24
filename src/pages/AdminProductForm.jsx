import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [categories, setCategories] = useState([]);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  
  useEffect(() => {
    if (!token) {
      alert("Admin not logged in!");
      navigate("/admin-login");
    }
  }, [token, navigate]);

  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/products/categories`);
        setCategories(res.data || []);
      } catch (err) {
        console.log("Category Fetch Error:", err);
      }
    };

    fetchCategories();
  }, []);


  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/products/${id}`);
        const p = res.data;

        setName(p.name);
        setPrice(p.price);
        setCategory(p.category);
        setDescription(p.description);
        setStock(p.stock);

        if (p.imageUrl) {
          setPreview(p.imageUrl);
        } else if (p.image) {
          setPreview(`${BASE_URL}${p.image}`);
        }
      } catch (err) {
        console.log("Fetch Product Error:", err);
      }
    };

    fetchProduct();
  }, [id]);

  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Admin not logged in!");
      navigate("/admin-login");
      return;
    }

    const form = new FormData();
    form.append("name", name);
    form.append("price", price);
    form.append("category", category);
    form.append("description", description);
    form.append("stock", stock);

    if (image) form.append("image", image);

    try {
      if (id) {
        await axios.put(`${BASE_URL}/api/products/${id}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Product Updated Successfully!");
      } else {
        await axios.post(`${BASE_URL}/api/products`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Product Added Successfully!");
      }

      navigate("/admin/products");
    } catch (err) {
      console.log("Submit Error:", err.response?.data || err);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4">
        {id ? "Edit Product" : "Add Product"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          className="w-full p-3 border rounded"
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="w-full p-3 border rounded"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <select
          className="w-full p-3 border rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>

          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <textarea
          className="w-full p-3 border rounded"
          rows="4"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>

        <input
          className="w-full p-3 border rounded"
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />

    
        <div>
          <label className="block mb-2 font-semibold">Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 mt-3 rounded border object-cover"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white p-3 rounded hover:bg-gray-800"
        >
          {id ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
