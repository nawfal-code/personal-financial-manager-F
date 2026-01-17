import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

/* UI styles */
const input =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400";
const btn =
  "rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold";
const btnOutline =
  "rounded-xl border border-indigo-600 text-indigo-600 px-3 py-1.5 text-sm";
const btnDanger =
  "rounded-xl bg-rose-500 text-white px-3 py-1.5 text-sm";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [addAmounts, setAddAmounts] = useState({});
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    savedAmount: "",
    durationValue: "",
    durationUnit: "months",
    description: "",
  });

  /* FETCH GOALS */
  const fetchGoals = async () => {
    const res = await api.get("/goals");
    setGoals(res.data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  /* CREATE GOAL */
  const createGoal = async (e) => {
    e.preventDefault();

    if (+form.savedAmount > +form.targetAmount) {
      return toast.error("Saved amount cannot exceed target");
    }

    const res = await api.post("/goals", {
      title: form.title,
      targetAmount: +form.targetAmount,
      durationValue: +form.durationValue,
      durationUnit: form.durationUnit,
      description: form.description,
    });

    if (+form.savedAmount > 0) {
      await api.put(`/goals/${res.data.goal._id}`, {
        savedAmount: +form.savedAmount,
      });
    }

    toast.success("Goal created");
    setForm({
      title: "",
      targetAmount: "",
      savedAmount: "",
      durationValue: "",
      durationUnit: "months",
      description: "",
    });

    fetchGoals();
  };

  /* UPDATE SAVED AMOUNT */
  const updateProgress = async (goal) => {
    const add = Number(addAmounts[goal._id]);
    if (!add) return;

    await api.put(`/goals/${goal._id}`, {
      savedAmount: goal.savedAmount + add,
    });

    toast.success("Progress updated");
    setAddAmounts({});
    fetchGoals();
  };

  /* DELETE GOAL */
  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`);
    toast.success("Goal deleted");
    fetchGoals();
  };

  /* EDIT GOAL */
  const startEdit = (goal) => {
    setEditingGoal(goal._id);
    setForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      durationValue: goal.durationValue,
      durationUnit: goal.durationUnit,
      description: goal.description || "",
    });
  };

  const saveEdit = async () => {
    await api.patch(`/goals/${editingGoal}`, {
      title: form.title,
      targetAmount: +form.targetAmount,
      durationValue: +form.durationValue,
      durationUnit: form.durationUnit,
      description: form.description,
    });

    toast.success("Goal updated");
    setEditingGoal(null);
    setForm({
      title: "",
      targetAmount: "",
      savedAmount: "",
      durationValue: "",
      durationUnit: "months",
      description: "",
    });

    fetchGoals();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
            🎯 Financial Goals
          </h2>

          {/* ADD / EDIT FORM */}
          <form
            onSubmit={editingGoal ? (e) => e.preventDefault() : createGoal}
            className="bg-white p-5 rounded-2xl shadow grid gap-4 md:grid-cols-6"
          >
            <input className={input} placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input className={input} type="number" placeholder="Target"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
            />
            {!editingGoal && (
              <input className={input} type="number" placeholder="Initial saved"
                value={form.savedAmount}
                onChange={(e) => setForm({ ...form, savedAmount: e.target.value })}
              />
            )}
            <input className={input} type="number" placeholder="Duration"
              value={form.durationValue}
              onChange={(e) => setForm({ ...form, durationValue: e.target.value })}
            />
            <select className={input}
              value={form.durationUnit}
              onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>

            {editingGoal ? (
              <button onClick={saveEdit} className={btn}>Save</button>
            ) : (
              <button className={btn}>Add Goal</button>
            )}
          </form>

          {/* GOALS LIST */}
          <div className="grid gap-4 mt-8">
            {goals.map((g) => {
              const percent = Math.min(
                100,
                (g.savedAmount / g.targetAmount) * 100
              ).toFixed(0);

              return (
                <div key={g._id} className="bg-white p-5 rounded-2xl shadow">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-indigo-700">{g.title}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(g)} className={btnOutline}>Edit</button>
                      <button onClick={() => deleteGoal(g._id)} className={btnDanger}>Delete</button>
                    </div>
                  </div>

                  <p className="text-sm mt-1">
                    Duration: {g.durationValue} {g.durationUnit}
                  </p>

                  <div className="grid grid-cols-4 mt-3 text-sm">
                    <p>Target ₹{g.targetAmount}</p>
                    <p className="text-green-600">Saved ₹{g.savedAmount}</p>
                    <p>Remaining ₹{g.targetAmount - g.savedAmount}</p>
                    <p>{percent}%</p>
                  </div>

                  <div className="h-2 bg-gray-200 rounded mt-2">
                    <div
                      className="h-2 bg-indigo-600 rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex gap-2 mt-3">
                    <input
                      className={input}
                      type="number"
                      placeholder="Add saved"
                      onChange={(e) =>
                        setAddAmounts({ ...addAmounts, [g._id]: e.target.value })
                      }
                    />
                    <button onClick={() => updateProgress(g)} className={btn}>
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
