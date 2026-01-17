import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

/* UI */
const input = "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400";
const btn = "rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold";
const btnOutline = "rounded-xl border border-indigo-600 text-indigo-600 px-3 py-1.5 text-sm";
const btnDanger = "rounded-xl bg-rose-500 text-white px-3 py-1.5 text-sm";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [addAmounts, setAddAmounts] = useState({});
  const [editGoal, setEditGoal] = useState(null);

  /* ADD FORM STATE */
  const [addForm, setAddForm] = useState({
    title: "",
    targetAmount: "",
    savedAmount: "",
    durationValue: "",
    durationUnit: "months",
    description: "",
  });

  /* EDIT FORM STATE */
  const [editForm, setEditForm] = useState({
    title: "",
    targetAmount: "",
    durationValue: "",
    durationUnit: "months",
    description: "",
  });

  /* TRACK WHICH GOAL'S HISTORY IS VISIBLE */
  const [showHistory, setShowHistory] = useState({});

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

    if (+addForm.savedAmount > +addForm.targetAmount) {
      return toast.error("Saved amount cannot exceed target");
    }

    const res = await api.post("/goals", {
      title: addForm.title,
      targetAmount: +addForm.targetAmount,
      durationValue: +addForm.durationValue,
      durationUnit: addForm.durationUnit,
      description: addForm.description,
    });

    if (+addForm.savedAmount > 0) {
      await api.put(`/goals/${res.data.goal._id}`, {
        savedAmount: +addForm.savedAmount,
      });
    }

    toast.success("Goal created");
    setAddForm({ title: "", targetAmount: "", savedAmount: "", durationValue: "", durationUnit: "months", description: "" });
    fetchGoals();
  };

  /* UPDATE SAVED AMOUNT */
  const updateProgress = async (goal) => {
    const add = Number(addAmounts[goal._id]);
    if (!add || add <= 0) return toast.error("Enter valid amount");

    const newSaved = goal.savedAmount + add;
    if (newSaved > goal.targetAmount) return toast.error("Cannot exceed target amount");

    await api.put(`/goals/${goal._id}`, { savedAmount: newSaved });

    toast.success("Saved amount updated");
    setAddAmounts({ ...addAmounts, [goal._id]: "" });
    fetchGoals();
  };

  /* DELETE */
  const deleteGoal = async (id) => {
    await api.delete(`/goals/${id}`);
    toast.success("Goal deleted");
    fetchGoals();
  };

  /* OPEN EDIT MODAL */
  const openEditModal = (goal) => {
    setEditGoal(goal);
    setEditForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      durationValue: goal.durationValue,
      durationUnit: goal.durationUnit,
      description: goal.description || "",
    });
  };

  /* SAVE EDIT */
  const saveEdit = async () => {
    await api.patch(`/goals/${editGoal._id}`, {
      title: editForm.title,
      targetAmount: +editForm.targetAmount,
      durationValue: +editForm.durationValue,
      durationUnit: editForm.durationUnit,
      description: editForm.description,
    });

    toast.success("Goal updated");
    setEditGoal(null);
    fetchGoals();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Financial Goals</h2>

          {/* ADD GOAL */}
          <form onSubmit={createGoal} className="bg-white p-5 rounded-2xl shadow grid gap-4 md:grid-cols-6">
            <input className={input} placeholder="Title"
              value={addForm.title}
              onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
            />
            <input className={input} type="number" placeholder="Target"
              value={addForm.targetAmount}
              onChange={(e) => setAddForm({ ...addForm, targetAmount: e.target.value })}
            />
            <input className={input} type="number" placeholder="Initial saved"
              value={addForm.savedAmount}
              onChange={(e) => setAddForm({ ...addForm, savedAmount: e.target.value })}
            />
            <input className={input} type="number" placeholder="Duration"
              value={addForm.durationValue}
              onChange={(e) => setAddForm({ ...addForm, durationValue: e.target.value })}
            />
            <select className={input}
              value={addForm.durationUnit}
              onChange={(e) => setAddForm({ ...addForm, durationUnit: e.target.value })}
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
            <button className={btn}>Add Goal</button>
          </form>

          {/* GOALS LIST */}
          <div className="grid gap-4 mt-8">
            {goals.map((g) => {
              const percent = Math.min(100, (g.savedAmount / g.targetAmount) * 100).toFixed(0);

              return (
                <div key={g._id} className="bg-white p-5 rounded-2xl shadow">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-indigo-700">{g.title}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(g)} className={btnOutline}>Edit</button>
                      <button onClick={() => deleteGoal(g._id)} className={btnDanger}>Delete</button>
                    </div>
                  </div>

                  <p className="text-sm mt-1">Duration: {g.durationValue} {g.durationUnit}</p>

                  <div className="grid grid-cols-4 mt-3 text-sm">
                    <p>Target ₹{g.targetAmount}</p>
                    <p className="text-green-600">Saved ₹{g.savedAmount}</p>
                    <p>Remaining ₹{g.targetAmount - g.savedAmount}</p>
                    <p>{percent}%</p>
                  </div>

                  <div className="h-2 bg-gray-200 rounded mt-2">
                    <div className="h-2 bg-indigo-600 rounded" style={{ width: `${percent}%` }} />
                  </div>

                  <div className="flex gap-2 mt-3">
                    <input
                      className={input}
                      type="number"
                      placeholder="Add saved amount"
                      value={addAmounts[g._id] || ""}
                      onChange={(e) => setAddAmounts({ ...addAmounts, [g._id]: e.target.value })}
                    />
                    <button onClick={() => updateProgress(g)} className={btn}>Update</button>
                  </div>

                  {/* 🔹 View Savings History Link */}
                  {g.savingsHistory?.length > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                      <button
                        className="text-indigo-600 underline text-sm"
                        onClick={() => setShowHistory({ ...showHistory, [g._id]: !showHistory[g._id] })}
                      >
                        {showHistory[g._id] ? "Hide History" : "View History"}
                      </button>

                      {showHistory[g._id] && (
                        <ul className="list-disc ml-5 mt-1">
                          {g.savingsHistory.map((h, i) => (
                            <li key={i}>₹{h.amount} added on {new Date(h.date).toLocaleDateString()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* EDIT MODAL */}
          {editGoal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-indigo-700 mb-4">Edit Goal</h3>

                <input className={input} placeholder="Title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                <input className={`${input} mt-3`} type="number" placeholder="Target"
                  value={editForm.targetAmount}
                  onChange={(e) => setEditForm({ ...editForm, targetAmount: e.target.value })}
                />
                <input className={`${input} mt-3`} type="number" placeholder="Duration"
                  value={editForm.durationValue}
                  onChange={(e) => setEditForm({ ...editForm, durationValue: e.target.value })}
                />
                <select className={`${input} mt-3`}
                  value={editForm.durationUnit}
                  onChange={(e) => setEditForm({ ...editForm, durationUnit: e.target.value })}
                >
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>

                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setEditGoal(null)} className="px-4 py-2 rounded-xl bg-gray-200">Cancel</button>
                  <button onClick={saveEdit} className={btn}>Save</button>
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
