import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { Pie, Bar } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const Reports = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomeRecords, setIncomeRecords] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);

  // ✅ NEW (ONLY FOR MENTOR)
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const [expRes, incRes, budRes, goalRes] = await Promise.all([
        api.get("/reports/expenses/category"),
        api.get("/reports/income"),
        api.get("/reports/budgets"),
        api.get("/reports/goals"),
      ]);

      /* EXPENSES */
      const expensesData = expRes.data
        .filter(e => e.category)
        .map(e => ({
          category: e.category,
          amount: e.total,
        }));
      setExpenses(expensesData);

      /* INCOME */
      setIncomeRecords(incRes.data.records || []);
      setTotalIncome(incRes.data.totalIncome || 0);

      /* BUDGET + GOALS */
      setBudgets(budRes.data || []);
      setGoals(goalRes.data || []);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  /* ==========================
     CHART DATA
  ========================== */

  const expenseChart = {
    labels: expenses.map(e => e.category),
    datasets: [
      {
        data: expenses.map(e => e.amount),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  /* ==========================
     EXPORT CSV
  ========================== */

  const exportCSV = () => {
    let csv = "Type,Amount,Category,Date\n";

    incomeRecords.forEach(i => {
      csv += `Income,${i.amount},${i.source || ""},${i.date?.slice(0,10) || ""}\n`;
    });

    expenses.forEach(e => {
      csv += `Expense,${e.amount},${e.category},\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "report.csv";
    link.click();
  };

  /* ==========================
     EXPORT PDF
  ========================== */

  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text("Finance Report", 10, 10);

    pdf.setFontSize(12);
    pdf.text(`Total Income: ₹${totalIncome}`, 10, 25);
    pdf.text(`Total Expense: ₹${totalExpense}`, 10, 35);

    pdf.text("Expense by Category:", 10, 50);
    let y = 60;
    expenses.forEach(e => {
      pdf.text(`${e.category}: ₹${e.amount}`, 10, y);
      y += 8;
    });

    pdf.save("report.pdf");
  };

  if (loading) return <p className="p-6">Loading reports...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Reports</h2>

        {/* ===================== CHARTS ===================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded shadow">
            <h3 className="font-semibold mb-2 text-center">Income vs Expense</h3>
            <Bar
              data={{
                labels: ["Income", "Expense"],
                datasets: [
                  {
                    label: "Amount",
                    data: [totalIncome, totalExpense],
                    backgroundColor: ["#36A2EB", "#FF6384"],
                  },
                ],
              }}
            />
          </div>

          <div className="border p-4 rounded shadow">
            <h3 className="font-semibold mb-2 text-center">Expense by Category</h3>
            {expenses.length > 0 ? (
              <Pie data={expenseChart} />
            ) : (
              <p className="text-center text-gray-500 mt-4">No expenses to show</p>
            )}
          </div>
        </div>

        {/* ===================== BUDGET REPORT ===================== */}
        <div className="mt-10">
          <h3 className="font-bold mb-3">Budget Report</h3>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Category</th>
                <th className="border p-2">Limit</th>
                <th className="border p-2">Spent</th>
                <th className="border p-2">Used %</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map(b => (
                <tr key={b._id}>
                  <td className="border p-2">{b.category}</td>
                  <td className="border p-2">₹{b.limitAmount}</td>
                  <td className="border p-2">₹{b.spentAmount}</td>
                  <td className="border p-2">{b.percentUsed}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===================== GOAL REPORT ===================== */}
        <div className="mt-10">
          <h3 className="font-bold mb-3">Goal Progress Report</h3>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Goal</th>
                <th className="border p-2">Target</th>
                <th className="border p-2">Saved</th>
                <th className="border p-2">Completed %</th>
              </tr>
            </thead>
            <tbody>
              {goals.map(g => (
                <tr key={g._id}>
                  <td className="border p-2">{g.title}</td>
                  <td className="border p-2">₹{g.targetAmount}</td>
                  <td className="border p-2">₹{g.savedAmount}</td>
                  <td className="border p-2">{g.percentCompleted}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===================== EXPORT ===================== */}
        <div className="mt-8 flex gap-4 justify-center">
          <button onClick={exportCSV} className="bg-blue-500 text-white px-4 py-2 rounded">
            Export CSV
          </button>
          <button onClick={exportPDF} className="bg-green-500 text-white px-4 py-2 rounded">
            Export PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default Reports;
