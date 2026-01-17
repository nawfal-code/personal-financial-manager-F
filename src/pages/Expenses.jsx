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
const EditModal = ({ expense, isOpen, onClose, onUpdate }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (!expense) return;

    setAmount(expense.amount);
    setDescription(expense.description || "");
    setDate(expense.date?.split("T")[0] || "");

    if (
      ["Groceries", "Food", "Rent", "Transport", "Shopping"].includes(
        expense.category
      )
    ) {
      setCategory(expense.category);
      setCustomCategory("");
    } else {
      setCategory("Other");
      setCustomCategory(expense.category);
    }
  }, [expense]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalCategory =
      category === "Other" ? customCategory.trim() : category;

    if (!finalCategory) {
      toast.error("Category required");
      return;
    }

    await api.put(`/expenses/${expense._id}`, {
      amount,
      category: finalCategory,
      description,
      date,
    });

    toast.success("Expense updated");
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-indigo-700 mb-4">
          Edit Expense
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input className={inputStyle} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

          <select className={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Groceries</option>
            <option>Food</option>
            <option>Rent</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Other</option>
          </select>

          {category === "Other" && (
            <input
              className={inputStyle}
              placeholder="Enter category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          )}

          <input className={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className={inputStyle} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="flex justify-end gap-3 pt-2">
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
const Expenses = () => {
  const [expenses, setExpenses] = useState([]);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  /* SEARCH FILTER */
  const [search, setSearch] = useState("");

  const [editExpense, setEditExpense] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();

    const finalCategory =
      category === "Other" ? customCategory.trim() : category;

    if (!finalCategory) {
      toast.error("Category required");
      return;
    }

    await api.post("/expenses", {
      amount,
      category: finalCategory,
      description,
      date,
    });

    toast.success("Expense added");

    setAmount("");
    setCategory("Groceries");
    setCustomCategory("");
    setDescription("");
    setDate("");

    fetchExpenses();
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    toast.success("Expense deleted");
    fetchExpenses();
  };

  /* SEARCH FILTER LOGIC (LIKE INCOME) */
  const filteredExpenses = expenses.filter((e) =>
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
        <div className="max-w-6xl mx-auto px-4 py-8">

          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-8">
            Expense Manager
          </h2>

          {/* ADD FORM */}
          <form onSubmit={addExpense} className="bg-white rounded-2xl shadow-lg p-5 grid gap-4 md:grid-cols-5 items-end">
            <input className={inputStyle} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />

            <select className={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Groceries</option>
              <option>Food</option>
              <option>Rent</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Other</option>
            </select>

            {category === "Other" && (
              <input className={inputStyle} placeholder="Enter category" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
            )}

            <input className={inputStyle} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

            <button className={primaryBtn}>Add Expense</button>
          </form>

          {/* SEARCH FILTER */}
          <div className="bg-white rounded-2xl shadow-lg p-5 mt-6">
            <input
              className={inputStyle}
              placeholder="Search by category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* MOBILE VIEW */}
          <div className="grid gap-4 mt-8 md:hidden">
            {filteredExpenses.map((e) => (
              <div key={e._id} className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-2xl p-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold">₹ {e.amount}</p>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                    {e.category}
                  </span>
                </div>

                <p className="text-sm mt-2 opacity-90">{e.description || "No description"}</p>

                <div className="flex gap-3 mt-4">
                  <button onClick={() => { setEditExpense(e); setModalOpen(true); }} className="flex-1 bg-white/20 py-2 rounded-xl">
                    Edit
                  </button>
                  <button onClick={() => deleteExpense(e._id)} className="flex-1 bg-rose-500 py-2 rounded-xl">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block mt-10 bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <tr>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((e) => (
                  <tr key={e._id} className="border-t hover:bg-indigo-50">
                    <td className="p-3 font-semibold text-indigo-700">₹ {e.amount}</td>
                    <td className="p-3">{e.category}</td>
                    <td className="p-3">{e.description || "-"}</td>
                    <td className="p-3 flex justify-center gap-3">
                      <button onClick={() => { setEditExpense(e); setModalOpen(true); }} className={outlineBtn}>
                        Edit
                      </button>
                      <button onClick={() => deleteExpense(e._id)} className={dangerBtn}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <EditModal
            expense={editExpense}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onUpdate={fetchExpenses}
          />
        </div>
      </div>
    </>
  );
};

export default Expenses;
