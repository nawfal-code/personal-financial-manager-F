import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    description: "",
  });

  const [updateAmounts, setUpdateAmounts] = useState({});
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editGoal, setEditGoal] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    description: "",
  });

  /* ================= FETCH GOALS ================= */
  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals");
      setGoals(res.data);
    } catch (err) {
      toast.error("Failed to load goals");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  /* ================= ADD GOAL ================= */
  const addGoal = async (e) => {
    e.preventDefault();

    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      toast.error("Title, target amount and deadline are required");
      return;
    }

    if (Number(newGoal.targetAmount) <= 0) {
      toast.error("Target amount must be positive");
      return;
    }

    try {
      const res = await api.post("/goals", {
        ...newGoal,
        targetAmount: Number(newGoal.targetAmount),
        deadline: new Date(newGoal.deadline),
      });

      setGoals([res.data.goal, ...goals]);
      setNewGoal({ title: "", targetAmount: "", deadline: "", description: "" });
      toast.success("Goal created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create goal");
    }
  };

  /* ================= DELETE GOAL ================= */
  const deleteGoal = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      setGoals(goals.filter((g) => g._id !== id));
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  /* ================= UPDATE PROGRESS ================= */
  const updateProgress = async (goal) => {
    const amount = Number(updateAmounts[goal._id]);

    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    if (goal.savedAmount + amount > goal.targetAmount) {
      toast.error("Cannot exceed target amount");
      return;
    }

    try {
      const res = await api.put(`/goals/${goal._id}`, {
        savedAmount: goal.savedAmount + amount,
      });

      setGoals(goals.map((g) => (g._id === goal._id ? res.data.goal : g)));
      setUpdateAmounts({ ...updateAmounts, [goal._id]: "" });
      toast.success("Progress updated");
    } catch {
      toast.error("Failed to update progress");
    }
  };

  /* ================= EDIT GOAL ================= */
  const startEdit = (goal) => {
    setEditingGoalId(goal._id);
    setEditGoal({
      title: goal.title,
      targetAmount: goal.targetAmount,
      deadline: goal.deadline.slice(0, 10),
      description: goal.description || "",
    });
  };

  const saveEdit = async (id) => {
    if (!editGoal.title || !editGoal.targetAmount || !editGoal.deadline) {
      toast.error("All required fields must be filled");
      return;
    }

    try {
      const res = await api.put(`/goals/${id}/edit`, {
        ...editGoal,
        targetAmount: Number(editGoal.targetAmount),
        deadline: new Date(editGoal.deadline),
      });

      setGoals(goals.map((g) => (g._id === id ? res.data.goal : g)));
      setEditingGoalId(null);
      toast.success("Goal updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update goal");
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">🎯 Financial Goals</h1>

        {/* CREATE GOAL */}
        <form onSubmit={addGoal} className="bg-white p-6 rounded-xl shadow mb-8 grid gap-4 md:grid-cols-2">
          <input
            placeholder="Title"
            className="border p-3 rounded"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
          />
          <input
            type="number"
            placeholder="Target Amount"
            className="border p-3 rounded"
            value={newGoal.targetAmount}
            onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
          />
          <input
            type="date"
            className="border p-3 rounded"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
          />
          <input
            placeholder="Description"
            className="border p-3 rounded"
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
          />
          <button className="md:col-span-2 bg-indigo-600 text-white py-3 rounded">
            Add Goal
          </button>
        </form>

        {/* GOALS LIST */}
        {goals.map((goal) => {
          const progress = ((goal.savedAmount / goal.targetAmount) * 100).toFixed(0);

          return (
            <div key={goal._id} className="bg-white p-6 rounded-xl shadow mb-6">
              {editingGoalId === goal._id ? (
                <>
                  <input
                    className="border p-2 rounded w-full mb-2"
                    value={editGoal.title}
                    onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                  />
                  <input
                    type="number"
                    className="border p-2 rounded w-full mb-2"
                    value={editGoal.targetAmount}
                    onChange={(e) => setEditGoal({ ...editGoal, targetAmount: e.target.value })}
                  />
                  <input
                    type="date"
                    className="border p-2 rounded w-full mb-2"
                    value={editGoal.deadline}
                    onChange={(e) => setEditGoal({ ...editGoal, deadline: e.target.value })}
                  />
                  <textarea
                    className="border p-2 rounded w-full mb-3"
                    value={editGoal.description}
                    onChange={(e) => setEditGoal({ ...editGoal, description: e.target.value })}
                  />
                  <div className="flex gap-3">
                    <button onClick={() => saveEdit(goal._id)} className="bg-green-600 text-white px-4 py-2 rounded">
                      Save
                    </button>
                    <button onClick={() => setEditingGoalId(null)} className="bg-gray-400 text-white px-4 py-2 rounded">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <h2 className="text-xl font-semibold">{goal.title}</h2>
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(goal)} className="text-blue-600">
                        Edit
                      </button>
                      <button onClick={() => deleteGoal(goal._id)} className="text-red-600">
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-500">Deadline: {goal.deadline.slice(0, 10)}</p>
                  <p>Target: ₹{goal.targetAmount}</p>
                  <p className="text-green-600">Saved: ₹{goal.savedAmount}</p>

                  <div className="bg-gray-200 h-3 rounded mt-2">
                    <div className="bg-indigo-600 h-3 rounded" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <input
                      type="number"
                      placeholder="Add amount"
                      className="border p-2 rounded flex-1"
                      value={updateAmounts[goal._id] || ""}
                      onChange={(e) =>
                        setUpdateAmounts({ ...updateAmounts, [goal._id]: e.target.value })
                      }
                    />
                    <button onClick={() => updateProgress(goal)} className="bg-green-600 text-white px-4 rounded">
                      Update
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Goals;
