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

  /* ================= FETCH GOALS ================= */
  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals");
      setGoals(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load goals");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  /* ================= ADD GOAL ================= */
  const addGoal = async (e) => {
    e.preventDefault();

    const { title, targetAmount, deadline, description } = newGoal;

    // 🔒 Frontend validation (matches backend schema)
    if (!title.trim() || !targetAmount || !deadline) {
      toast.error("Title, target amount and deadline are required");
      return;
    }

    if (Number(targetAmount) <= 0) {
      toast.error("Target amount must be greater than 0");
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        targetAmount: Number(targetAmount),
        savedAmount: 0,
        deadline: new Date(deadline), // 🔑 IMPORTANT FIX
        description: description?.trim() || "",
      };

      const res = await api.post("/goals", payload);

      setGoals([res.data.goal || res.data, ...goals]);

      setNewGoal({
        title: "",
        targetAmount: "",
        deadline: "",
        description: "",
      });

      toast.success("Goal created successfully");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to create goal"
      );
    }
  };

  /* ================= DELETE GOAL ================= */
  const deleteGoal = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      setGoals(goals.filter((g) => g._id !== id));
      toast.success("Goal deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete goal");
    }
  };

  /* ================= UPDATE PROGRESS ================= */
  const updateProgress = async (goal) => {
    const amount = Number(updateAmounts[goal._id]);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (goal.savedAmount + amount > goal.targetAmount) {
      toast.error("Saved amount cannot exceed target");
      return;
    }

    try {
      const res = await api.put(`/goals/${goal._id}`, {
        savedAmount: goal.savedAmount + amount,
      });

      setGoals(
        goals.map((g) =>
          g._id === goal._id ? res.data.goal || res.data : g
        )
      );

      setUpdateAmounts((prev) => ({ ...prev, [goal._id]: "" }));
      toast.success("Progress updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update progress");
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            🎯 Financial Goals
          </h1>
          <p className="text-gray-500 mt-1">
            Track your savings goals and monitor progress
          </p>
        </div>

        {/* ADD GOAL */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Create New Goal
          </h2>

          <form
            onSubmit={addGoal}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Goal title"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400"
              value={newGoal.title}
              onChange={(e) =>
                setNewGoal({ ...newGoal, title: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Target amount"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400"
              value={newGoal.targetAmount}
              onChange={(e) =>
                setNewGoal({ ...newGoal, targetAmount: e.target.value })
              }
            />

            <input
              type="date"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400"
              value={newGoal.deadline}
              onChange={(e) =>
                setNewGoal({ ...newGoal, deadline: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Description (optional)"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-400"
              value={newGoal.description}
              onChange={(e) =>
                setNewGoal({ ...newGoal, description: e.target.value })
              }
            />

            <button className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition">
              Add Goal
            </button>
          </form>
        </div>

        {/* GOALS LIST */}
        <div className="grid gap-6">
          {goals.length === 0 && (
            <p className="text-center text-gray-500">
              No goals created yet
            </p>
          )}

          {goals.map((goal) => {
            const progress = Math.min(
              (goal.savedAmount / goal.targetAmount) * 100,
              100
            ).toFixed(0);

            const isCompleted = progress >= 100;

            return (
              <div
                key={goal._id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Deadline: {goal.deadline?.slice(0, 10)}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteGoal(goal._id)}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                  <p>Target: ₹{goal.targetAmount}</p>
                  <p className="text-green-600">
                    Saved: ₹{goal.savedAmount}
                  </p>
                  <p className="text-orange-500">
                    Remaining: ₹{goal.targetAmount - goal.savedAmount}
                  </p>
                  <p className="font-semibold">
                    {progress}%
                  </p>
                </div>

                <div className="mt-4 bg-gray-200 h-3 rounded-full">
                  <div
                    className={`h-3 rounded-full ${
                      isCompleted ? "bg-green-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-5 flex gap-3">
                  <input
                    type="number"
                    placeholder="Add saved amount"
                    className="border rounded-lg px-4 py-2 flex-1"
                    value={updateAmounts[goal._id] || ""}
                    onChange={(e) =>
                      setUpdateAmounts({
                        ...updateAmounts,
                        [goal._id]: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={() => updateProgress(goal)}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg"
                  >
                    Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Goals;
