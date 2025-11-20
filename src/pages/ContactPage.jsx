import React, { useState } from "react";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();

    const existing = JSON.parse(localStorage.getItem("contactMessages") || "[]");

    const newMsg = {
      ...form,
      date: new Date().toLocaleString(),
    };

    localStorage.setItem("contactMessages", JSON.stringify([...existing, newMsg]));

    setSent(true);
    setForm({ name: "", email: "", message: "" });

    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="bg-white min-h-screen py-12 px-6 flex flex-col items-center">
      <h2 className="text-3xl font-semibold text-yellow-600 mb-8">Contact Us</h2>

      <form
        onSubmit={submit}
        className="w-full max-w-lg bg-white border border-gray-100 shadow-sm rounded-xl p-6 space-y-4"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          className="w-full border border-gray-300 rounded-md p-3"
        />

        <input
          name="email"
          value={form.email}
          type="email"
          onChange={handleChange}
          placeholder="Your Email"
          required
          className="w-full border border-gray-300 rounded-md p-3"
        />

        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Message"
          required
          className="w-full border border-gray-300 rounded-md p-3"
        />

        <button className="w-full bg-yellow-500 text-white py-2 rounded-md">
          Send Message
        </button>

        {sent && <p className="text-green-600 text-center mt-2">
          Message Sent Successfully!
        </p>}
      </form>
    </div>
  );
};

export default ContactPage;
