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
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import Category from "./pages/Category.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import OrdersPage from "./pages/OrderPage.jsx";

import AdminProductsPage from "./pages/AdminProductsPage.jsx";
import AdminProductForm from "./pages/AdminProductForm.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import AdminRevenuePage from "./pages/AdminRevenuePage.jsx";
import AdminMessages from "./pages/AdminMessages.jsx";
import AdminUserPage from "./pages/AdminUserPage.jsx";
import AdminProductView from "./pages/AdminProductView.jsx";

import PrivateAdminRoute from "./PrivateAdminRoute.jsx";

function App() {
  // Hide Navbar & Footer for ALL admin pages
  function isAdminRoute() {
    const path = window.location.pathname.toLowerCase();
    return (
      path === "/admindashboard" || 
      path.startsWith("/admin")
    );
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hide navbar on all admin pages */}
      {!isAdminRoute() && <Navbar />}

      <main className="flex-1">
        <Routes>

          {/* USER ROUTES */}
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

          {/* ADMIN LOGIN */}
          <Route path="/admin-login" element={<AdminLoginPage />} />

          {/* ADMIN PROTECTED ROUTES */}
          <Route
            path="/admindashboard"
            element={
              <PrivateAdminRoute>
                <AdminDashboard />
              </PrivateAdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <PrivateAdminRoute>
                <AdminProductsPage />
              </PrivateAdminRoute>
            }
          />

          <Route
            path="/admin/products/add"
            element={
              <PrivateAdminRoute>
                <AdminProductForm />
              </PrivateAdminRoute>
            }
          />

          <Route
            path="/admin/products/edit/:id"
            element={
              <PrivateAdminRoute>
                <AdminProductForm />
              </PrivateAdminRoute>
            }
          />

          <Route
            path="/admin/products/view/:id"
            element={
              <PrivateAdminRoute>
                <AdminProductView />
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

          <Route
            path="/admin/revenue"
            element={
              <PrivateAdminRoute>
                <AdminRevenuePage />
              </PrivateAdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <PrivateAdminRoute>
                <AdminUserPage />
              </PrivateAdminRoute>
            }
          />

          <Route
            path="/admin/messages"
            element={
              <PrivateAdminRoute>
                <AdminMessages />
              </PrivateAdminRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>

      {/* Hide footer on admin pages */}
      {!isAdminRoute() && <Footer />}

    </div>
  );
}

export default App;
