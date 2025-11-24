import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  if (!token) navigate("/admin-login");

  
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      console.log("Fetch products error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

 
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = products.filter((p) => p._id !== id);
      setProducts(updated);
      setFilteredProducts(updated.filter(filterLogic));
    } catch (err) {
      console.log("Delete failed:", err);
    }
  };

 
  const filterLogic = (p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.price.toString().includes(search);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setFilteredProducts(products.filter(filterLogic));
  };

 
  if (loading)
    return (
      <p className="text-center text-xl font-semibold mt-10">Loading...</p>
    );
  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-3xl font-bold">Admin Products</h2>
        <Link
          to="/admin/products/add"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          + Add Product
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by name, category, or price..."
        value={search}
        onChange={handleSearch}
        className="border p-2 w-full rounded mb-4"
      />

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">Image</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Price</th>
              <th className="p-3 border">Stock</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} className="border-b">
                <td className="p-3 border">
                  <img
                    src={`${BASE_URL}/uploads/${product.image}`}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded"
                  />
                </td>

                <td className="p-3 border">{product.name}</td>
                <td className="p-3 border">{product.category}</td>
                <td className="p-3 border">₹{product.price}</td>
                <td className="p-3 border">{product.stock}</td>

                <td className="p-3 border flex gap-2">
                  <Link
                    to={`/admin/products/edit/${product._id}`}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-3 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
