// import React, { useState } from "react";
// import api from "../../service/api.js";
// import { useNavigate } from "react-router-dom";

// const AdminLogin = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.AdminLogineventDefault();

//     try {
//       const res = await api.post("/user/login", formData);

//       const user = res.data.user;

//       if (user.role !== "admin") {
//         alert("Access denied! Not an admin");
//         return;
//       }

//       localStorage.setItem("user", JSON.stringify(user));

//       alert("Admin login successful");
//       navigate("/admin/desboard");

//     } catch (error) {
//       alert(error.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">

//         <h2 className="text-xl font-bold mb-4">Admin Login</h2>

//         <input
//           name="email"
//           placeholder="Email"
//           className="w-full border p-2 mb-3"
//           onChange={handleChange}
//         />

//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           className="w-full border p-2 mb-3"
//           onChange={handleChange}
//         />

//         <button className="w-full bg-green-600 text-white p-2">
//           Login as Admin
//         </button>

//       </form>
//     </div>
//   );
// };

// export default AdminLogin;
import React, { useState } from "react";
import api from "../../service/api.js";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  // State for visual feedback instead of raw browser alerts
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.AdminLogineventDefault();
    setStatus({ type: "", message: "" });
    setIsLoading(true);

    try {
      const res = await api.post("/user/login", formData);
      const user = res.data.user;

      if (user.role !== "admin") {
        setStatus({ type: "error", message: "Access denied! Insufficient administrative AdminLoginivileges." });
        setIsLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      setStatus({ type: "success", message: "Verification successful. Redirecting..." });
      
      // Short delay so they can see the success state before navigating
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);

    } catch (error) {
      setStatus({ 
        type: "error", 
        message: error.response?.data?.message || "Authentication failed. Please try again." 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Top Decorative Color Accent */}
        <div className="h-2 bg-emerald-600 w-full" />

        <div className="p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Gateway</h1>
            <p className="text-slate-500 text-sm mt-1">Authorized personnel login only</p>
          </div>

          {/* Form Status Messages */}
          {status.message && (
            <div className={`p-3 text-xs rounded-lg text-center font-medium transition-all ${
              status.type === "error" 
                ? "bg-red-50 text-red-600 border border-red-100" 
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}>
              {status.message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Control Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                placeholder="admin@system.com"
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Security Key
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                placeholder="••••••••"
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 shadow-md flex items-center justify-center gap-2 text-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Verify Secure Session"
              )}
            </button>
            
          </form>
           <button 
              onClick={() => navigate("/admin/signup")} 
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors focus:outline-none focus:underline"
            >
              Sign In Here
            </button>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;