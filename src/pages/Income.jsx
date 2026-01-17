import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

/* =======================
   REUSABLE UI STYLES
======================= */
const inputStyle =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition";

const primaryBtn =
  "rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition shadow-md";

const outlineBtn =
  "rounded-xl border border-indigo-500 text-indigo-600 px-3 py-1.5 text-sm hover:bg-indigo-50 transition";

const dangerBtn =
  "rounded-xl bg-rose-500 text-white px-3 py-1.5 text-sm hover:bg-rose-600 transition";

/* =======================
   EDIT MODAL
======================= */
const EditIncomeModal = ({ income, isOpen, onClose, onUpdate }) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (income) {
      setAmount(income.amount);
      setDate(income.date?.split("T")[0] || "");

      if (["Salary", "Business", "Investments"].includes(income.source)) {
        setSource(income.source);
        setCustomSource("");
      } else {
        setSource("Other");
        setCustomSource(income.source);
      }
    }
  }, [income]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalSource =
      source === "Other" ? customSource.trim() : source;

    if (!finalSource) return toast.error("Enter income type");

    try {
      await api.put(`/income/${income._id}`, {
        amount,
        source: finalSource,
        date,
      });

      toast.success("Income updated");
      onUpdate();
      onClose();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-indigo-700 mb-4">
          Edit Income
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className={inputStyle}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className={inputStyle}
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option>Salary</option>
            <option>Business</option>
            <option>Investments</option>
            <option>Other</option>
          </select>

          {source === "Other" && (
            <input
              className={inputStyle}
              placeholder="Enter income type"
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
            />
          )}

          <input
            className={inputStyle}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button type="submit" className={primaryBtn}>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =======================
   MAIN PAGE
======================= */
const Income = () => {
  const [incomeList, setIncomeList] = useState([]);

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [date, setDate] = useState("");

  /* FILTER STATES */
  const [filterSource, setFilterSource] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [editIncome, setEditIncome] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchIncome = async () => {
    const res = await api.get("/income");
    setIncomeList(res.data);
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const addIncome = async (e) => {
    e.preventDefault();

    const finalSource =
      source === "Other" ? customSource.trim() : source;

    if (!finalSource) return toast.error("Enter income type");

    await api.post("/income", {
      amount,
      source: finalSource,
      date,
    });

    toast.success("Income added");
    setAmount("");
    setSource("Salary");
    setCustomSource("");
    setDate("");
    fetchIncome();
  };

  const deleteIncome = async (id) => {
    await api.delete(`/income/${id}`);
    toast.success("Income deleted");
    fetchIncome();
  };

  const filteredIncome = incomeList.filter((i) => {
    const matchSource = filterSource ? i.source === filterSource : true;
    const matchFrom = fromDate ? new Date(i.date) >= new Date(fromDate) : true;
    const matchTo = toDate ? new Date(i.date) <= new Date(toDate) : true;
    return matchSource && matchFrom && matchTo;
  });

  const uniqueSources = [...new Set(incomeList.map(i => i.source))];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
        <div className="max-w-6xl mx-auto px-4 py-8">

          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-8">
            Income Manager
          </h2>

          {/* ADD FORM */}
          <form
            onSubmit={addIncome}
            className="bg-white rounded-2xl shadow-lg p-5 grid gap-4 md:grid-cols-5 items-end"
          >
            <input
              className={inputStyle}
              placeholder="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select
              className={inputStyle}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option>Salary</option>
              <option>Business</option>
              <option>Investments</option>
              <option>Other</option>
            </select>

            {source === "Other" && (
              <input
                className={inputStyle}
                placeholder="Enter income type"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
              />
            )}

            <input
              className={inputStyle}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button className={primaryBtn}>Add Income</button>
          </form>

          {/* FILTER SECTION */}
          <div className="bg-white rounded-2xl shadow-lg p-5 mt-6 grid gap-4 md:grid-cols-4 items-end">
            <select
              className={inputStyle}
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="">All Sources</option>
              {uniqueSources.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <input
              className={inputStyle}
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              className={inputStyle}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

            <button
              onClick={() => {
                setFilterSource("");
                setFromDate("");
                setToDate("");
              }}
              className={outlineBtn}
            >
              Clear Filters
            </button>
          </div>

          {/* TABLE */}
          <div className="hidden md:block mt-10 bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <tr>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncome.map((i) => (
                  <tr key={i._id} className="border-t hover:bg-indigo-50">
                    <td className="p-3 font-semibold text-indigo-700">₹ {i.amount}</td>
                    <td className="p-3">{i.source}</td>
                    <td className="p-3">{i.date.split("T")[0]}</td>
                    <td className="p-3 flex justify-center gap-3">
                      <button
                        onClick={() => { setEditIncome(i); setModalOpen(true); }}
                        className={outlineBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteIncome(i._id)}
                        className={dangerBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <EditIncomeModal
            income={editIncome}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onUpdate={fetchIncome}
          />
        </div>
      </div>
    </>
  );
};

export default Income;
