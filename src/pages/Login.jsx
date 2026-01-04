import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (error) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('../src/images/login-bg.jpg')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-xl rounded-2xl p-8">

          <h2 className="text-3xl font-bold text-center text-white drop-shadow-lg">
            EHLANZENI STAR SCHOOL
          </h2>
          <p className="text-center text-white/80 text-sm mt-1">Admin Login</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            {error && (
              <div className="bg-red-500/20 text-red-200 border border-red-400/40 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/90">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg bg-white/30 border border-white/40 text-white placeholder-white/70 
                focus:ring-2 focus:ring-blue-300 focus:outline-none backdrop-blur-md"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/90">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg bg-white/30 border border-white/40 text-white placeholder-white/70 
                focus:ring-2 focus:ring-blue-300 focus:outline-none backdrop-blur-md"
                placeholder="••••••••"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold tracking-wide
              hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            
            <Link to="/admin/signup" className="hover:text-blue-600 transition"> Need an admin account?{" "}
              <span className="text-blue-300">Contact system administrator</span></Link>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
