import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

/* UI STYLES */
const inputStyle =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition";

const primaryBtn =
  "rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-semibold shadow-md";

const outlineBtn =
  "rounded-xl border border-indigo-500 text-indigo-600 px-3 py-1.5 text-sm hover:bg-indigo-50";

const dangerBtn =
  "rounded-xl bg-rose-500 text-white px-3 py-1.5 text-sm";

const Goals = () => {
  const [goals, setGoals] = useState([]);

  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    savedAmount: "",
    durationValue: "",
    durationUnit: "months",
    description: "",
  });

  const [addAmounts, setAddAmounts] = useState({});
  const [editGoal, setEditGoal] = useState(null);

  const fetchGoals = async () => {
    const res = await api.get("/goals");
    setGoals(res.data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  /* CREATE GOAL */
  const addGoal = async (e) => {
    e.preventDefault();

    const target = Number(newGoal.targetAmount);
    const saved = Number(newGoal.savedAmount || 0);

    if (saved > target) {
      toast.error("Saved cannot exceed target");
      return;
    }

    try {
      const res = await api.post("/goals", {
        title: newGoal.title,
        targetAmount: target,
        durationValue: Number(newGoal.durationValue),
        durationUnit: newGoal.durationUnit,
        description: newGoal.description,
      });

      if (saved > 0) {
        await api.put(`/goals/${res.data.goal._id}`, {
          savedAmount: saved,
        });
      }

      toast.success("Goal created");
      setNewGoal({
        title: "",
        targetAmount: "",
        savedAmount: "",
        durationValue: "",
        durationUnit: "months",
        description: "",
      });

      fetchGoals();
    } catch (err) {
      toast.error("Failed to create goal");
    }
  };

  /* UPDATE PROGRESS */
  const updateProgress = async (goal) => {
    const add = Number(addAmounts[goal._id]);

    if (!add) return;

    await api.put(`/goals/${goal._id}`, {
      savedAmount: goal.savedAmount + add,
    });

    toast.success("Progress updated");
    fetchGoals();
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-violet-50">
        <div className="max-w-6xl mx-auto px-4 py-8">

          <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">
            🎯 Financial Goals
          </h2>

          {/* ADD GOAL */}
          <form
            onSubmit={addGoal}
            className="bg-white rounded-2xl shadow-lg p-5 grid gap-4 md:grid-cols-6"
          >
            <input placeholder="Goal title" className={inputStyle}
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            />

            <input type="number" placeholder="Target" className={inputStyle}
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
            />

            <input type="number" placeholder="Initial saved" className={inputStyle}
              value={newGoal.savedAmount}
              onChange={(e) => setNewGoal({ ...newGoal, savedAmount: e.target.value })}
            />

            <input type="number" placeholder="Duration" className={inputStyle}
              value={newGoal.durationValue}
              onChange={(e) => setNewGoal({ ...newGoal, durationValue: e.target.value })}
            />

            <select className={inputStyle}
              value={newGoal.durationUnit}
              onChange={(e) => setNewGoal({ ...newGoal, durationUnit: e.target.value })}
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>

            <button className={primaryBtn}>Add Goal</button>
          </form>

          {/* GOALS LIST */}
          <div className="grid gap-4 mt-8">
            {goals.map((g) => {
              const progress = Math.min(
                100,
                (g.savedAmount / g.targetAmount) * 100
              ).toFixed(0);

              return (
                <div key={g._id} className="bg-white rounded-2xl shadow-lg p-5">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-indigo-700">{g.title}</h3>
                    <button onClick={() => deleteGoal(g._id)} className={dangerBtn}>
                      Delete
                    </button>
                  </div>

                  <p className="text-sm mt-2">
                    Duration: {g.durationValue} {g.durationUnit}
                  </p>

                  <div className="grid grid-cols-4 mt-4 text-sm">
                    <p>Target: ₹{g.targetAmount}</p>
                    <p className="text-green-600">Saved: ₹{g.savedAmount}</p>
                    <p>Remaining: ₹{g.targetAmount - g.savedAmount}</p>
                    <p>{progress}%</p>
                  </div>

                  <div className="bg-gray-200 h-2 rounded mt-2">
                    <div
                      className="bg-indigo-500 h-2 rounded"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex gap-2 mt-3">
                    <input
                      type="number"
                      placeholder="Add saved"
                      className={inputStyle}
                      onChange={(e) =>
                        setAddAmounts({ ...addAmounts, [g._id]: e.target.value })
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

        </div>
      </div>
    </>
  );
};

export default Goals;
