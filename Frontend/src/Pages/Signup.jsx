import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api.js";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role:"admin"
  });

  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", formData);
      console.log("Response:", res.data);
      alert(res.data.message);
      navigate("/admin/dashboard");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Server Error",
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans antialiased text-white">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
            Create an account
          </h1>
          <p className="text-neutral-400 text-sm">
            Enter your details below to get started.
          </p>
        </div>

        {/* Status Alert */}
        {status.message && (
          <div
            className={`p-3 mb-6 text-xs rounded-lg border ${
              status.type === "error"
                ? "bg-red-950/30 text-red-400 border-red-900/50"
                : "bg-emerald-950/30 text-emerald-400 border-emerald-900/50"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#121212] border border-neutral-800 text-white placeholder-neutral-600 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#121212] border border-neutral-800 text-white placeholder-neutral-600 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#121212] border border-neutral-800 text-white placeholder-neutral-600 px-3.5 py-2.5 pr-14 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 mt-2 shadow-sm"
          >
            Sign Up
          </button>

          {/* Redirect Link */}
          <p className="text-center text-xs text-neutral-400 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-fuchsia-400 hover:text-fuchsia-300 font-medium cursor-pointer transition-colors"
            >
              Log In
            </span>
          </p>
        </form>

        {/* Footer Terms */}
        <div className="mt-8 pt-4 border-t border-neutral-900 text-center">
          <p className="text-[11px] text-neutral-600 leading-normal">
            By clicking continue, you agree to our{" "}
            <a href="#terms" className="hover:text-neutral-400 transition-colors underline underline-offset-2">Terms of Service</a> &{" "}
            <a href="#privacy" className="hover:text-neutral-400 transition-colors underline underline-offset-2">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;