import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

/* =======================
   REUSABLE STYLES
======================= */
const cardBase =
  "rounded-2xl shadow-lg p-6 transition hover:scale-[1.02]";

const statLabel = "text-sm font-medium opacity-90";
const statValue = "text-3xl font-extrabold mt-2";

const Dashboard = () => {
  const navigate = useNavigate();
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, expRes] = await Promise.all([
        api.get("/income"),
        api.get("/expenses"),
      ]);
      setIncome(incRes.data);
      setExpenses(expRes.data); 
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const recentTransactions = [
    ...income.map((t) => ({ ...t, type: "Income" })),
    ...expenses.map((t) => ({ ...t, type: "Expense" })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading)
    return (
      <>
        <Navbar />
        <p className="p-6 text-center text-gray-500 font-medium">
          Loading dashboard...
        </p>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <p className="p-6 text-center text-red-600 font-medium">{error}</p>
      </>
    );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* TITLE */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-10">
            Financial Dashboard
          </h2>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${cardBase} bg-gradient-to-br from-green-500 to-emerald-500 text-white`}>
              <p className={statLabel}>Total Income</p>
              <h3 className={statValue}>₹ {totalIncome}</h3>
            </div>

            <div className={`${cardBase} bg-gradient-to-br from-rose-500 to-red-500 text-white`}>
              <p className={statLabel}>Total Expenses</p>
              <h3 className={statValue}>₹ {totalExpense}</h3>
            </div>

            <div
              className={`${cardBase} ${
                balance >= 0
                  ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
                  : "bg-gradient-to-br from-gray-600 to-gray-800 text-white"
              }`}
            >
              <p className={statLabel}>Balance</p>
              <h3 className={statValue}>₹ {balance}</h3>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-indigo-700 mb-4">
              Recent Transactions
            </h3>

            {/* MOBILE VIEW */}
            <div className="grid gap-4 md:hidden">
              {recentTransactions.map((t) => (
                <div
                  key={t._id}
                  className={`rounded-2xl p-4 shadow-md text-white ${
                    t.type === "Income"
                      ? "bg-gradient-to-br from-green-500 to-emerald-500"
                      : "bg-gradient-to-br from-rose-500 to-red-500"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">
                      {t.type}
                    </span>
                    <span className="text-lg font-bold">
                      ₹ {t.amount}
                    </span>
                  </div>

                  <p className="mt-2 text-sm opacity-90">
                    {t.description || "No description"}
                  </p>

                  <p className="mt-1 text-xs opacity-80">
                    {new Date(t.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                  <tr>
                    <th className="p-4 text-left">Type</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-left">Description</th>
                    <th className="p-4 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((t) => (
                    <tr
                      key={t._id}
                      className="border-t hover:bg-indigo-50 transition"
                    >
                      <td className="p-4 font-semibold text-indigo-700">
                        {t.type}
                      </td>
                      <td
                        className={`p-4 text-right font-bold ${
                          t.type === "Income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ₹ {t.amount}
                      </td>
                      <td className="p-4">
                        {t.description || "-"}
                      </td>
                      <td className="p-4">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
