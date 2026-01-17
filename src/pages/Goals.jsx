import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

/* =======================
   UI STYLES
======================= */
const inputStyle =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition";

const primaryBtn =
  "rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition shadow-md";

const outlineBtn =
  "rounded-xl border border-indigo-500 text-indigo-600 px-3 py-1.5 text-sm hover:bg-indigo-50 transition";

const dangerBtn =
  "rounded-xl bg-rose-500 text-white px-3 py-1.5 text-sm hover:bg-rose-600 transition";

/* =======================
   COMPONENT
======================= */
const Goals = () => {
  const [goals, setGoals] = useState([]);

  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    savedAmount: "",
    deadline: "",
    description: "",
  });

  const [addAmounts, setAddAmounts] = useState({});
  const [editGoal, setEditGoal] = useState(null);

  /* =======================
     FETCH GOALS
  ======================= */
  const fetchGoals = async () => {
    const res = await api.get("/goals");
    setGoals(res.data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  /* =======================
     CREATE GOAL (WITH INITIAL SAVED)
  ======================= */
  const addGoal = async (e) => {
    e.preventDefault();

    const target = Number(newGoal.targetAmount);
    const initialSaved = Number(newGoal.savedAmount || 0);

    if (!newGoal.title || !target || !newGoal.deadline) {
      toast.error("Title, target & deadline required");
      return;
    }

    if (initialSaved > target) {
      toast.error("Saved amount cannot exceed target");
      return;
    }

    try {
      // 1️⃣ create goal
      const res = await api.post("/goals", {
        title: newGoal.title,
        targetAmount: target,
        deadline: new Date(newGoal.deadline),
        description: newGoal.description,
      });

      const createdGoal = res.data.goal || res.data;

      // 2️⃣ apply initial saved
      if (initialSaved > 0) {
        await api.put(`/goals/${createdGoal._id}`, {
          savedAmount: initialSaved,
        });
      }

      toast.success("Goal created");
      setNewGoal({
        title: "",
        targetAmount: "",
        savedAmount: "",
        deadline: "",
        description: "",
      });

      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create goal");
    }
  };

  /* =======================
     UPDATE PROGRESS
  ======================= */
  const updateProgress = async (goal) => {
    const add = Number(addAmounts[goal._id]);
    const saved = Number(goal.savedAmount);

    if (!add || add <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    if (saved + add > goal.targetAmount) {
      toast.error("Cannot exceed target");
      return;
    }

    await api.put(`/goals/${goal._id}`, {
      savedAmount: saved + add,
    });

    toast.success("Progress updated");
    setAddAmounts({ ...addAmounts, [goal._id]: "" });
    fetchGoals();
  };

  /* =======================
     DELETE GOAL
  ======================= */
  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`);
    toast.success("Goal deleted");
    fetchGoals();
  };

  /* =======================
     EDIT GOAL (FIXED)
  ======================= */
  const updateGoalDetails = async () => {
    const target = Number(editGoal.targetAmount);
    const saved = Number(editGoal.savedAmount);

    if (target < saved) {
      toast.error("Target cannot be less than saved amount");
      return;
    }

    try {
      await api.patch(`/goals/${editGoal._id}`, {
        title: editGoal.title,
        targetAmount: target,
        deadline: new Date(editGoal.deadline),
        description: editGoal.description,
      });

      toast.success("Goal updated");
      setEditGoal(null);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
        <div className="max-w-6xl mx-auto px-4 py-8">

          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-8">
            Financial Goals
          </h2>

          {/* ADD GOAL */}
          <form
            onSubmit={addGoal}
            className="bg-white rounded-2xl shadow-lg p-5 grid gap-4 md:grid-cols-5 items-end"
          >
            <input
              placeholder="Goal title"
              className={inputStyle}
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            />

            <input
              type="number"
              placeholder="Target amount"
              className={inputStyle}
              value={newGoal.targetAmount}
              onChange={(e) =>
                setNewGoal({ ...newGoal, targetAmount: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Initial saved"
              className={inputStyle}
              value={newGoal.savedAmount}
              onChange={(e) =>
                setNewGoal({ ...newGoal, savedAmount: e.target.value })
              }
            />

            <input
              type="date"
              className={inputStyle}
              value={newGoal.deadline}
              onChange={(e) =>
                setNewGoal({ ...newGoal, deadline: e.target.value })
              }
            />

            <button className={`${primaryBtn} col-span-full md:col-span-1`}>
              Add Goal
            </button>
          </form>

          {/* GOALS LIST */}
          <div className="grid gap-4 mt-8">
            {goals.map((g) => {
              const progress = Math.min(
                100,
                (g.savedAmount / g.targetAmount) * 100
              );

              return (
                <div key={g._id} className="bg-white rounded-2xl shadow-lg p-5">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-indigo-700">{g.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setEditGoal({
                            ...g,
                            deadline: g.deadline.slice(0, 10),
                          })
                        }
                        className={outlineBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGoal(g._id)}
                        className={dangerBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3 mt-4 text-sm">
                    <p>Target: ₹ {g.targetAmount}</p>
                    <p className="text-green-600">Saved: ₹ {g.savedAmount}</p>
                    <p className="text-orange-600">
                      Remaining: ₹ {g.targetAmount - g.savedAmount}
                    </p>
                    <p className="font-semibold">{progress.toFixed(0)}%</p>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded mt-3">
                    <div
                      className="h-2 bg-indigo-500 rounded"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <input
                      type="number"
                      placeholder="Add saved"
                      className={inputStyle}
                      value={addAmounts[g._id] || ""}
                      onChange={(e) =>
                        setAddAmounts({
                          ...addAmounts,
                          [g._id]: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={() => updateProgress(g)}
                      className={primaryBtn}
                    >
                      Update
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EDIT MODAL */}
          {editGoal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-indigo-700 mb-4">
                  Edit Goal
                </h3>

                <input
                  className={inputStyle}
                  value={editGoal.title}
                  onChange={(e) =>
                    setEditGoal({ ...editGoal, title: e.target.value })
                  }
                />

                <input
                  type="number"
                  className={`${inputStyle} mt-3`}
                  value={editGoal.targetAmount}
                  onChange={(e) =>
                    setEditGoal({
                      ...editGoal,
                      targetAmount: e.target.value,
                    })
                  }
                />

                <input
                  type="date"
                  className={`${inputStyle} mt-3`}
                  value={editGoal.deadline}
                  onChange={(e) =>
                    setEditGoal({ ...editGoal, deadline: e.target.value })
                  }
                />

                <textarea
                  className={`${inputStyle} mt-3`}
                  placeholder="Description"
                  value={editGoal.description || ""}
                  onChange={(e) =>
                    setEditGoal({
                      ...editGoal,
                      description: e.target.value,
                    })
                  }
                />

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setEditGoal(null)}
                    className="px-4 py-2 rounded-xl bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button onClick={updateGoalDetails} className={primaryBtn}>
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

export default Goals;
