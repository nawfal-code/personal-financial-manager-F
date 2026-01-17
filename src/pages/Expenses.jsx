import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

/* UI STYLES */
const inputStyle =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

const primaryBtn =
  "rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 font-semibold";

const outlineBtn =
  "rounded-xl border border-indigo-500 text-indigo-600 px-3 py-1.5";

const dangerBtn =
  "rounded-xl bg-rose-500 text-white px-3 py-1.5";

/* EDIT MODAL */
const EditModal = ({ expense, isOpen, onClose, refresh }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount);
      setCategory(
        ["Groceries","Food","Rent","Transport","Shopping"].includes(expense.category)
          ? expense.category
          : "Other"
      );
      setCustomCategory(
        ["Groceries","Food","Rent","Transport","Shopping"].includes(expense.category)
          ? ""
          : expense.category
      );
      setDescription(expense.description || "");
      setDate(expense.date?.split("T")[0]);
    }
  }, [expense]);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    const finalCategory = category === "Other" ? customCategory : category;

    await api.put(`/expenses/${expense._id}`, {
      amount,
      category: finalCategory,
      description,
      date,
    });

    toast.success("Expense updated");
    refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-3">
        <h3 className="text-lg font-bold">Edit Expense</h3>

        <input className={inputStyle} value={amount} onChange={(e)=>setAmount(e.target.value)} />
        
        <select className={inputStyle} value={category} onChange={(e)=>setCategory(e.target.value)}>
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
            placeholder="Custom category"
            value={customCategory}
            onChange={(e)=>setCustomCategory(e.target.value)}
          />
        )}

        <input className={inputStyle} type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        <input className={inputStyle} placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleUpdate} className={primaryBtn}>Update</button>
        </div>
      </div>
    </div>
  );
};

/* MAIN */
const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Groceries");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [filterCategory, setFilterCategory] = useState("");

  const [editExpense, setEditExpense] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();

    const finalCategory = category === "Other" ? customCategory : category;

    await api.post("/expenses", {
      amount,
      category: finalCategory,
      description,
      date,
    });

    toast.success("Expense added");
    setAmount("");
    setCustomCategory("");
    fetchExpenses();
  };

  const filtered = expenses.filter(e =>
    filterCategory
      ? e.category.toLowerCase().includes(filterCategory.toLowerCase())
      : true
  );

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-6">Expenses</h2>

        {/* ADD FORM */}
        <form onSubmit={addExpense} className="grid md:grid-cols-5 gap-3 bg-white p-5 rounded-2xl shadow">
          <input className={inputStyle} value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount" />
          
          <select className={inputStyle} value={category} onChange={(e)=>setCategory(e.target.value)}>
            <option>Groceries</option>
            <option>Food</option>
            <option>Rent</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Other</option>
          </select>

          {category === "Other" && (
            <input className={inputStyle} placeholder="Custom category" value={customCategory} onChange={(e)=>setCustomCategory(e.target.value)} />
          )}

          <input className={inputStyle} type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          <button className={primaryBtn}>Add</button>
        </form>

        {/* FILTER */}
        <input
          className={`${inputStyle} mt-6`}
          placeholder="Filter by category"
          value={filterCategory}
          onChange={(e)=>setFilterCategory(e.target.value)}
        />

        {/* LIST */}
        <div className="mt-6 space-y-3">
          {filtered.map(e => (
            <div key={e._id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
              <div>
                <p className="font-bold">₹ {e.amount}</p>
                <p className="text-sm text-gray-500">{e.category}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>{setEditExpense(e);setOpen(true)}} className={outlineBtn}>Edit</button>
                <button onClick={()=>api.delete(`/expenses/${e._id}`).then(fetchExpenses)} className={dangerBtn}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditModal
        expense={editExpense}
        isOpen={open}
        onClose={()=>setOpen(false)}
        refresh={fetchExpenses}
      />
    </>
  );
};

export default Expenses;
