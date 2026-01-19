import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

/* =======================
   STYLES
======================= */
const inputStyle =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition";

const primaryBtn =
  "rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold shadow-md";

const outlineBtn =
  "rounded-xl border border-indigo-500 text-indigo-600 px-3 py-1.5 text-sm";

const dangerBtn =
  "rounded-xl bg-rose-500 text-white px-3 py-1.5 text-sm";

/* =======================
   COMPONENT
======================= */
const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("Groceries");
  const [limitAmount, setLimitAmount] = useState("");

  // ✅ NEW (ONLY ADDITION)
  const [customCategory, setCustomCategory] = useState("");

  const [editBudget, setEditBudget] = useState(null);
  const [editLimit, setEditLimit] = useState("");

  const fetchBudgets = async () => {
    const res = await api.get("/budgets");
    setBudgets(res.data);
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const addBudget = async (e) => {
    e.preventDefault();

    // ✅ ONLY LOGIC CHANGE
    const finalCategory =
      category === "Other" ? customCategory.trim() : category;

    if (!finalCategory) {
      toast.error("Please enter category name");
      return;
    }

    try {
      await api.post("/budgets", {
        category: finalCategory,
        limitAmount,
        period: "monthly",
        startDate: new Date(),
      });

      toast.success("Budget created");
      setLimitAmount("");
      setCategory("Groceries");
      setCustomCategory("");
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const deleteBudget = async (id) => {
    await api.delete(`/budgets/${id}`);
    toast.success("Budget deleted");
    fetchBudgets();
  };

  const updateBudget = async () => {
    await api.put(`/budgets/${editBudget._id}`, {
      limitAmount: editLimit,
    });
    toast.success("Budget updated");
    setEditBudget(null);
    fetchBudgets();
  };

  const recalcAllBudgets = async () => {
    await api.patch("/budgets/recalculate-all");
    toast.success("All budgets recalculated");
    fetchBudgets();
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
        <div className="max-w-6xl mx-auto px-4 py-8">

          <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">
            Budget Manager
          </h2>

          <div className="flex justify-end mb-4">
            <button onClick={recalcAllBudgets} className={primaryBtn}>
              Recalculate All Budgets
            </button>
          </div>

          {/* ADD BUDGET */}
          <form
            onSubmit={addBudget}
            className="bg-white rounded-2xl shadow-lg p-5 grid gap-4 md:grid-cols-4 items-end"
          >
            <select
              className={inputStyle}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Groceries</option>
              <option>Food</option>
              <option>Rent</option>
              <option>Shopping</option>
              <option>Transport</option>
              <option>Other</option>
            </select>

            {/* ✅ NEW (ONLY UI ADDITION) */}
            {category === "Other" && (
              <input
                type="text"
                placeholder="Enter category name"
                className={inputStyle}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}

            <input
              type="number"
              placeholder="Budget Limit"
              className={inputStyle}
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              required
            />

            <button className={primaryBtn}>Add Budget</button>
          </form>

          {/* LIST */}
          <div className="grid gap-4 mt-8">
            {budgets.map((b) => {
              const spent = b.spentAmount || 0;
              const remaining = b.limitAmount - spent;
              const percent = Math.min(100, (spent / b.limitAmount) * 100);

              return (
                <div key={b._id} className="bg-white rounded-2xl shadow-lg p-4">
                  <h3 className="font-bold text-indigo-700">{b.category}</h3>
                  <p>Limit: ₹ {b.limitAmount}</p>
                  <p className="text-rose-600">Spent: ₹ {spent}</p>
                  <p className={remaining < 0 ? "text-rose-600" : "text-green-600"}>
                    Remaining: ₹ {remaining}
                  </p>

                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div
                      className="bg-indigo-500 h-2 rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setEditBudget(b);
                        setEditLimit(b.limitAmount);
                      }}
                      className={outlineBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBudget(b._id)}
                      className={dangerBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EDIT MODAL */}
          {editBudget && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl w-full max-w-md">
                <h3 className="font-bold mb-3">Edit Budget</h3>
                <input
                  className={inputStyle}
                  type="number"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setEditBudget(null)}>Cancel</button>
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
