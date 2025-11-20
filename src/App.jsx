import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess";
import ContactPage from "./pages/ContactPage.jsx";
import Category from "./pages/Category.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import OrdersPage from "./pages/OrderPage.jsx";
import AddProductPage from "./pages/AddProductPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import AdminMessages from "./pages/AdminMessages";
import PrivateAdminRoute from "./PrivateAdminRoute.jsx";

function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/userdashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
         <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
         <Route path="/admin/add-product" element={<AddProductPage />} />

          <Route
            path="/admindashboard"
            element={
              <PrivateAdminRoute>
                <AdminDashboard />
              </PrivateAdminRoute>
            }
          />

          <Route
            path="/addproduct"
            element={
              <PrivateAdminRoute>
                <AddProductPage />
              </PrivateAdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <PrivateAdminRoute>
                <AdminOrdersPage />
              </PrivateAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
