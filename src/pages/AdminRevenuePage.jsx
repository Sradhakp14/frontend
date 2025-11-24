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

  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [yearTotal, setYearTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) navigate("/admin/login");
    fetchAllRevenue(year, selectedDate);
  }, [year, selectedDate]);


  const fetchAllRevenue = async (targetYear, targetDate) => {
    try {
      setLoading(true);

      const [dailyRes, weeklyRes, monthlyRes, yearlyRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/revenue/daily?date=${targetDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/admin/revenue/weekly`, {
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
          date: dailyRes.data.date,
          total: dailyRes.data.totalRevenue,
        },
      ]);

      setWeekly([
        {
          week: `${weeklyRes.data.weekStart} → ${weeklyRes.data.weekEnd}`,
          total: weeklyRes.data.totalRevenue,
        },
      ]);

      setMonthly(monthlyRes.data.monthlyRevenue || []);
      setYearTotal(
        yearlyRes.data.yearlyRevenue?.find((y) => y._id === year)?.totalRevenue ||
          0
      );
    } catch (err) {
      console.error("Revenue fetch error:", err);
    } finally {
      setLoading(false);
    }
  };


  const handlePrevYear = () => setYear((y) => y - 1);
  const handleNextYear = () => setYear((y) => y + 1);


  if (loading)
    return <p className="text-center mt-10 text-gray-600 text-xl">Loading...</p>;


  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto">

        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">GoldMart Revenue Dashboard</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin")}
              className="px-3 py-1 bg-white border rounded"
            >
              Back
            </button>

            <button onClick={handlePrevYear} className="px-3 py-1 bg-white border rounded">
              ◀
            </button>
            <span className="font-semibold">{year}</span>
            <button onClick={handleNextYear} className="px-3 py-1 bg-white border rounded">
              ▶
            </button>
          </div>
        </div>

        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-2">Select Date</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-1 rounded"
          />
        </div>

        
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

        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-2">Weekly Revenue</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Week</th>
                <th className="p-2 text-right">Revenue (₹)</th>
              </tr>
            </thead>

            <tbody>
              {weekly.map((w, i) => (
                <tr key={i}>
                  <td className="p-2">{w.week}</td>
                  <td className="p-2 text-right font-semibold">
                    {w.total.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
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
                    {m.totalRevenue.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
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
