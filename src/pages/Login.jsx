import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/users/login", {
        email: email.trim(),
        password,
      });

      // ✅ use backend response directly
      login(res.data.token, res.data.user);

      toast.success("Login successful");
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Simple Navbar */}
      <nav className="bg-gray-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-blue-400">
            Personal Finance Manager
          </h1>
        </div>
      </nav>

      {/* Login Card */}
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
            Welcome Back
          </h2>

          <p className="text-sm text-gray-500 text-center mb-4">
            Login to continue managing your finances
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="mt-1 border p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-600">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  className="border p-2 w-full rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded-lg w-full hover:bg-blue-700 transition disabled:opacity-60 font-medium"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-5 text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
