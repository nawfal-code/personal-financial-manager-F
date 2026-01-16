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
   MAIN COMPONENT
======================= */
const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("Groceries");
  const [limitAmount, setLimitAmount] = useState("");

  const [editBudget, setEditBudget] = useState(null);
  const [editLimit, setEditLimit] = useState("");

  /* =======================
     FETCH BUDGETS
  ======================= */
  const fetchBudgets = async () => {
    const res = await api.get("/budgets");
    setBudgets(res.data);
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  /* =======================
     CREATE BUDGET
  ======================= */
  const addBudget = async (e) => {
  e.preventDefault();

  try {
    await api.post("/budgets", {
      category,
      limitAmount,
      period: "monthly",
      startDate: new Date(),
    });

    toast.success("Budget created successfully");
    setLimitAmount("");
    fetchBudgets();

  } catch (error) {
    // ✅ show backend message
    const msg =
      error?.response?.data?.message ||
      "Something went wrong. Try again.";

    toast.error(msg);
    console.error("Add budget error:", error);
  }
};


  /* =======================
     DELETE BUDGET
  ======================= */
  const deleteBudget = async (id) => {
    await api.delete(`/budgets/${id}`);
    toast.success("Budget deleted");
    fetchBudgets();
  };

  /* =======================
     UPDATE LIMIT
  ======================= */
  const updateBudget = async () => {
    await api.put(`/budgets/${editBudget._id}`, {
      limitAmount: editLimit,
    });
    toast.success("Budget updated");
    setEditBudget(null);
    fetchBudgets();
  };

  /* =======================
     RECALCULATE SPENT
  ======================= */
  const recalcSpent = async (id) => {
    await api.patch(`/budgets/${id}/recalculate`);
    fetchBudgets();
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
        <div className="max-w-6xl mx-auto px-4 py-8">

          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-8">
            Budget Manager
          </h2>

          {/* ADD BUDGET */}
          <form
            onSubmit={addBudget}
            className="bg-white rounded-2xl shadow-lg p-5 grid gap-4 md:grid-cols-4 items-end"
          >
            <select className={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Groceries</option>
              <option>Food</option>
              <option>Rent</option>
              <option>Shopping</option>
              <option>Transport</option>
              <option>Other</option>
            </select>

            <input
              type="number"
              placeholder="Budget Limit"
              className={inputStyle}
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              required
            />

            <button className={`${primaryBtn} md:col-span-1 col-span-full`}>
              Add Budget
            </button>
          </form>

          {/* MOBILE VIEW */}
          <div className="grid gap-4 mt-8 md:hidden">
            {budgets.map((b) => {
              const spent = b.spentAmount || 0;
              const remaining = b.limitAmount - spent;
              const percent = Math.min(100, (spent / b.limitAmount) * 100);

              return (
                <div key={b._id} className="bg-white rounded-2xl shadow-lg p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-indigo-700">{b.category}</h3>
                    <span className="text-sm font-semibold">₹ {b.limitAmount}</span>
                  </div>

                  <p className="text-sm mt-1 text-gray-600">
                    Spent: <span className="text-rose-600 font-semibold">₹ {spent}</span>
                  </p>

                  <p className={`text-sm font-semibold ${remaining < 0 ? "text-rose-600" : "text-green-600"}`}>
                    Remaining: ₹ {remaining}
                  </p>

                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div
                      className={`h-2 rounded ${remaining < 0 ? "bg-rose-500" : "bg-indigo-500"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => recalcSpent(b._id)} className={outlineBtn}>
                      Recalculate
                    </button>
                    <button onClick={() => { setEditBudget(b); setEditLimit(b.limitAmount); }} className={outlineBtn}>
                      Edit
                    </button>
                    <button onClick={() => deleteBudget(b._id)} className={dangerBtn}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block mt-10 bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <tr>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Limit</th>
                  <th className="p-3 text-left">Spent</th>
                  <th className="p-3 text-left">Remaining</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => {
                  const spent = b.spentAmount || 0;
                  const remaining = b.limitAmount - spent;
                  const percent = Math.min(100, (spent / b.limitAmount) * 100);

                  return (
                    <tr key={b._id} className="border-t hover:bg-indigo-50">
                      <td className="p-3 font-semibold">{b.category}</td>
                      <td className="p-3">₹ {b.limitAmount}</td>
                      <td className="p-3 text-rose-600 font-semibold">₹ {spent}</td>
                      <td className={`p-3 font-semibold ${remaining < 0 ? "text-rose-600" : "text-green-600"}`}>
                        ₹ {remaining}
                      </td>
                      <td className="p-3 flex justify-center gap-3">
                        <button onClick={() => recalcSpent(b._id)} className={outlineBtn}>
                          Recalculate
                        </button>
                        <button onClick={() => { setEditBudget(b); setEditLimit(b.limitAmount); }} className={outlineBtn}>
                          Edit
                        </button>
                        <button onClick={() => deleteBudget(b._id)} className={dangerBtn}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* EDIT MODAL */}
          {editBudget && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-indigo-700 mb-4">
                  Edit Budget Limit
                </h3>

                <input
                  type="number"
                  className={inputStyle}
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                />

                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setEditBudget(null)} className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">
                    Cancel
                  </button>
                  <button onClick={updateBudget} className={primaryBtn}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Budget;
