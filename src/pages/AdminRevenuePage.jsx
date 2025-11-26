import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AdminRevenuePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [range, setRange] = useState({ start: "", end: "" });
  const [rangeRevenue, setRangeRevenue] = useState(0);
  const [rangeOrders, setRangeOrders] = useState(0);

  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [yearTotal, setYearTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) navigate("/admin-login");
    fetchAllRevenue(year, selectedDate);
  }, [year, selectedDate]);

  const fetchAllRevenue = async (targetYear, targetDate) => {
    try {
      setLoading(true);

      const [dailyRes, weeklyRes, monthlyRes, yearlyRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/revenue/daily?date=${targetDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/admin/revenue/weekly?date=${targetDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/admin/revenue/monthly?year=${targetYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/admin/revenue/yearly`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDaily([
        {
          date: dailyRes.data?.date || targetDate,
          total: Number(dailyRes.data?.totalRevenue || 0),
        },
      ]);

      setWeekly([
        {
          week: `${weeklyRes.data?.weekStart || "N/A"} → ${weeklyRes.data?.weekEnd || "N/A"}`,
          total: Number(weeklyRes.data?.totalRevenue || 0),
        },
      ]);

      // FIXED: Convert monthly to full 12-month list
      const apiMonths = Array.isArray(monthlyRes.data?.monthlyRevenue)
        ? monthlyRes.data.monthlyRevenue
        : [];

      const normalized = apiMonths.map((m) => ({
        month: Number(m.month),
        totalRevenue: Number(m.totalRevenue || 0),
      }));

      const fullMonths = Array.from({ length: 12 }, (_, i) => {
        const found = normalized.find((m) => m.month === i + 1);
        return {
          month: i + 1,
          totalRevenue: found ? found.totalRevenue : 0,
        };
      });

      setMonthly(fullMonths);

      const matchedYear =
        yearlyRes.data?.yearlyRevenue?.find((y) => y._id === targetYear);

      setYearTotal(Number(matchedYear?.totalRevenue || 0));
    } catch (err) {
      console.error("Revenue fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeSelect = async (value) => {
    if (!range.start) {
      setRange({ start: value, end: "" });
      return;
    }

    if (range.start && !range.end) {
      setRange({ start: range.start, end: value });
      fetchRangeRevenue(range.start, value);
      return;
    }

    setRange({ start: value, end: "" });
    setRangeRevenue(0);
    setRangeOrders(0);
  };

  const fetchRangeRevenue = async (start, end) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/revenue/range?start=${start}&end=${end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRangeRevenue(Number(res.data?.totalRevenue || 0));
      setRangeOrders(Number(res.data?.orderCount || 0));
    } catch (err) {
      console.log("Range revenue error:", err);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-600 text-xl">Loading...</p>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">GoldMart Revenue Dashboard</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admindashboard")}
              className="px-3 py-1 bg-white border rounded"
            >
              Back
            </button>

            <button
              onClick={() => setYear((y) => y - 1)}
              className="px-3 py-1 bg-white border rounded"
            >
              ◀
            </button>
            <span className="font-semibold">{year}</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              className="px-3 py-1 bg-white border rounded"
            >
              ▶
            </button>
          </div>
        </div>

        {/* DATE SELECTOR */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-2">Select Date</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-1 rounded"
          />
        </div>

        {/* DAILY */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-2">Daily Revenue</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-right">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d, i) => (
                <tr key={i}>
                  <td className="p-2">{d.date}</td>
                  <td className="p-2 text-right font-semibold">
                    {d.total.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CUSTOM RANGE */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-2">Custom Weekly Revenue</h2>

          <p className="text-sm mb-2">Select Start & End Dates</p>

          <input
            type="date"
            onChange={(e) => handleRangeSelect(e.target.value)}
            className="border px-3 py-1 rounded"
          />

          <div className="mt-3 text-sm">
            <p><strong>Start:</strong> {range.start || "not selected"}</p>
            <p><strong>End:</strong> {range.end || "not selected"}</p>
          </div>

          {range.start && range.end && (
            <div className="mt-3">
              <p className="text-xl font-bold text-green-600">
                ₹ {rangeRevenue.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-gray-700">
                Orders: {rangeOrders}
              </p>
            </div>
          )}
        </div>

        {/* MONTHLY */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-2">Monthly Revenue</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Month</th>
                <th className="p-2 text-right">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.month}>
                  <td className="p-2">{monthNames[m.month - 1]}</td>
                  <td className="p-2 text-right font-semibold">
                    {Number(m.totalRevenue || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* YEARLY */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Yearly Total Revenue</h2>
          <p className="text-2xl font-bold text-green-600">
            ₹ {yearTotal.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenuePage;
