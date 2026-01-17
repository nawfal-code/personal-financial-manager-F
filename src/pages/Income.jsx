import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

/* =======================
   STYLES
======================= */
const inputStyle =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400";

const primaryBtn =
  "rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold";

const outlineBtn =
  "rounded-xl border border-indigo-600 text-indigo-600 px-3 py-1.5 text-sm";

const dangerBtn =
  "rounded-xl bg-rose-500 text-white px-3 py-1.5 text-sm";

/* =======================
   MAIN
======================= */
const Income = () => {
  const [incomeList, setIncomeList] = useState([]);

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  /* FILTER STATES (UNCHANGED) */
  const [filterSource, setFilterSource] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchIncome = async () => {
    const res = await api.get("/income");
    setIncomeList(res.data);
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  /* ADD INCOME */
  const addIncome = async (e) => {
    e.preventDefault();

    const finalSource =
      source === "Other" ? customSource.trim() : source;

    if (!finalSource) {
      return toast.error("Please enter income type");
    }

    await api.post("/income", {
      amount,
      source: finalSource,
      description,
      date,
    });

    toast.success("Income added");

    setAmount("");
    setSource("Salary");
    setCustomSource("");
    setDescription("");
    setDate("");

    fetchIncome();
  };

  const deleteIncome = async (id) => {
    await api.delete(`/income/${id}`);
    toast.success("Income deleted");
    fetchIncome();
  };

  /* FILTER LOGIC (UNCHANGED) */
  const filteredIncome = incomeList.filter((i) => {
    const matchSource = filterSource ? i.source === filterSource : true;
    const matchFrom = fromDate ? new Date(i.date) >= new Date(fromDate) : true;
    const matchTo = toDate ? new Date(i.date) <= new Date(toDate) : true;
    return matchSource && matchFrom && matchTo;
  });

  /* UNIQUE SOURCES FOR FILTER */
  const uniqueSources = [...new Set(incomeList.map(i => i.source))];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
            Income Manager
          </h2>

          {/* ADD FORM */}
          <form
            onSubmit={addIncome}
            className="bg-white p-5 rounded-2xl shadow grid gap-4 md:grid-cols-5"
          >
            <input
              className={inputStyle}
              type="number"
              placeholder="Amount"
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

            {/* 🆕 DYNAMIC TYPE INPUT */}
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

          {/* FILTER SECTION (UNCHANGED) */}
          <div className="bg-white p-5 rounded-2xl shadow mt-6 grid gap-4 md:grid-cols-4">
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

          {/* LIST */}
          <div className="mt-8 bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncome.map((i) => (
                  <tr key={i._id} className="border-t">
                    <td className="p-3">₹ {i.amount}</td>
                    <td className="p-3">{i.source}</td>
                    <td className="p-3">{i.date.split("T")[0]}</td>
                    <td className="p-3 text-center">
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

        </div>
      </div>
    </>
  );
};

export default Income;
