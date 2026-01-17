import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

/* =======================
   UI STYLES
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
   EDIT MODAL
======================= */
const EditIncomeModal = ({ income, isOpen, onClose, onUpdate }) => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("Salary");
  const [customSource, setCustomSource] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (income) {
      setAmount(income.amount);
      setSource(
        ["Salary", "Business", "Investments"].includes(income.source)
          ? income.source
          : "Other"
      );
      setCustomSource(
        ["Salary", "Business", "Investments"].includes(income.source)
          ? ""
          : income.source
      );
      setDescription(income.description || "");
      setDate(income.date?.split("T")[0] || "");
    }
  }, [income]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalSource =
      source === "Other" ? customSource.trim() : source;

    if (!finalSource) {
      return toast.error("Enter income type");
    }

    try {
      await api.put(`/income/${income._id}`, {
        amount,
        source: finalSource,
        description,
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-indigo-700 mb-4">Edit Income</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input className={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

          <select className={inputStyle} value={source} onChange={(e) => setSource(e.target.value)}>
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

          <input className={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className={inputStyle} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-200">
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
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

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

    if (!finalSource) {
      return toast.error("Enter income type");
    }

    try {
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
    } catch {
      toast.error("Failed to add income");
    }
  };

  const deleteIncome = async (id) => {
    await api.delete(`/income/${id}`);
    toast.success("Income deleted");
    fetchIncome();
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
            Income Manager
          </h2>

          {/* ADD INCOME */}
          <form
            onSubmit={addIncome}
            className="bg-white p-5 rounded-2xl shadow grid gap-4 md:grid-cols-5"
          >
            <input className={inputStyle} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />

            <select className={inputStyle} value={source} onChange={(e) => setSource(e.target.value)}>
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

            <input className={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button className={primaryBtn}>Add Income</button>
          </form>

          {/* LIST */}
          <div className="mt-8 bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomeList.map((i) => (
                  <tr key={i._id} className="border-t">
                    <td className="p-3">₹ {i.amount}</td>
                    <td className="p-3">{i.source}</td>
                    <td className="p-3">{i.date.split("T")[0]}</td>
                    <td className="p-3 flex justify-center gap-2">
                      <button onClick={() => { setEditIncome(i); setModalOpen(true); }} className={outlineBtn}>
                        Edit
                      </button>
                      <button onClick={() => deleteIncome(i._id)} className={dangerBtn}>
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
