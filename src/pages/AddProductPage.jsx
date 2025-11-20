import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AddProductPage = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  
  const token = localStorage.getItem("adminToken");

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/products`);
      setProducts(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);

      if (image) {
        formData.append("image", image);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingProduct) {
        await axios.put(
          `${BASE_URL}/api/products/${editingProduct._id}`,
          formData,
          config
        );
      } else {
        await axios.post(`${BASE_URL}/api/products`, formData, config);
      }

      setEditingProduct(null);
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setImage(null);

      fetchProducts();
    } catch (error) {
      console.error("Upload/Update error:", error);
      alert("Failed to save product");
    }
  };

  const startEdit = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price);
    setCategory(p.category);
    setDescription(p.description);
    setImage(null);
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        {editingProduct ? "Edit Product" : "Add New Product"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md p-6 rounded-xl max-w-md space-y-4"
      >
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="border p-2 rounded w-full" />

        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required className="border p-2 rounded w-full" />

        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required className="border p-2 rounded w-full" />

        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows="4" required className="border p-2 rounded w-full" />

        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="border p-2 rounded w-full" />

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          {editingProduct ? "Update Product" : "Add Product"}
        </button>
      </form>

      <hr className="my-10" />

      <h3 className="text-xl font-semibold mb-4">All Products</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {products.map((p) => (
          <div key={p._id} className="border rounded-xl p-4 shadow-sm bg-white">
            <h4 className="font-bold text-lg">{p.name}</h4>
            <p>₹ {p.price}</p>
            <p>Category: {p.category}</p>
            <p className="text-sm">{p.description}</p>

            {p.imageUrl && (
              <img src={p.imageUrl} alt={p.name} className="w-20 h-20 mt-2 rounded" />
            )}

            <div className="mt-4 flex gap-2">
              <button onClick={() => startEdit(p)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                Edit
              </button>

              <button onClick={() => deleteProduct(p._id)} className="bg-red-600 text-white px-3 py-1 rounded">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddProductPage;
