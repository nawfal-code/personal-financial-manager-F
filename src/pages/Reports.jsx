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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const [expRes, incRes] = await Promise.all([
        api.get("/reports/expenses/category"),
        api.get("/reports/income"),
      ]);

      // ✅ FIXED: backend now returns { category, total }
      const expensesData = expRes.data
        .filter(e => e.category)
        .map(e => ({
          category: e.category,
          amount: e.total,
        }));

      setExpenses(expensesData);

      // ✅ FIXED: income structure
      setIncomeRecords(incRes.data.records || []);
      setTotalIncome(incRes.data.totalIncome || 0);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income vs Expense */}
          <div className="border p-4 rounded shadow">
            <h3 className="font-semibold mb-2 text-center">
              Income vs Expense
            </h3>
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

          {/* Expense by Category */}
          <div className="border p-4 rounded shadow">
            <h3 className="font-semibold mb-2 text-center">
              Expense by Category
            </h3>
            {expenses.length > 0 ? (
              <Pie data={expenseChart} />
            ) : (
              <p className="text-center text-gray-500 mt-4">
                No expenses to show
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={exportCSV}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Export CSV
          </button>

          <button
            onClick={exportPDF}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Export PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default Reports;
