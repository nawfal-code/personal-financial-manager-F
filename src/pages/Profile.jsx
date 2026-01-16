import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, logout } = useAuth();
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    const saved = localStorage.getItem("currency");
    if (saved) setCurrency(saved);
  }, []);

  const saveCurrency = () => {
    localStorage.setItem("currency", currency);
    toast.success("Currency preference saved");
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-red-600">
          User not found
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-8">
          Profile
        </h1>

        {/* USER INFO */}
        <div className="bg-white shadow rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4 text-gray-700">
            Account Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </div>

        {/* SETTINGS */}
        <div className="bg-white shadow rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4 text-gray-700">
            Preferences
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>

            <button
              onClick={saveCurrency}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="text-center">
          <button
            onClick={logout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;
