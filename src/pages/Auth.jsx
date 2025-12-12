import React, { useState } from "react";
import api from "../config/axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fade, setFade] = useState(false);
  
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    passwordStrength: "", 
    passwordMatch: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleLogoutWithConfirmation = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });


    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (!isLogin && name === "password") {
       const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
       if (!strongPasswordRegex.test(value)) {
          setErrors((prev) => ({ 
            ...prev, 
            passwordStrength: "Must have 8+ chars, 1 uppercase, 1 lowercase, & 1 number." 
          }));
       } else {
          setErrors((prev) => ({ ...prev, passwordStrength: "" }));
       }
    }

    if (!isLogin && (name === "password" || name === "confirmPassword")) {
      const passwordToCheck = name === "password" ? value : form.password;
      const confirmToCheck = name === "confirmPassword" ? value : form.confirmPassword;

      if (confirmToCheck && passwordToCheck !== confirmToCheck) {
        setErrors((prev) => ({ ...prev, passwordMatch: "Passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, passwordMatch: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (errors.email || (!isLogin && (errors.passwordMatch || errors.passwordStrength))) {
      alert("Please fix the errors shown in red before continuing.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        console.log('🚀 Step 1: Sending Login Request...');
        const response = await api.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });

        console.log('📥 Step 2: Server Response:', response.data);

        if (response.data.user && response.data.token) {
          const userData = response.data.user;
          const token = response.data.token;
          
          console.log('🔑 Step 3: Token Found:', token);

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));

          await login(userData, token);
          
          console.log('✅ Step 4: Login Complete. Redirecting...');
          
          if (userData.role === "customer") navigate("/customer");
          else if (userData.role === "receptionist") navigate("/receptionist");
          else if (userData.role === "owner") navigate("/owner");
          else navigate("/");

        } else {
          console.error("❌ Login Failed: Missing token or user in response");
          alert(response.data.message || "Login failed - No token received");
        }

      } else {
        if (form.password !== form.confirmPassword) {
          alert("Passwords do not match");
          setIsLoading(false);
          return;
        }

        const res = await api.post("/api/auth/signup", {
          username: form.username,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });

        if (res.data.success || res.data.message.includes('success')) {
          alert("Signup successful! You can now login.");
          handleSwitchMode();
        } else {
          alert(res.data.message || "Signup failed");
        }
      }
    } catch (err) {
      console.error('Auth Error:', err);
      const msg = err.response?.data?.message || "Connection failed. Check server.";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (errors.email) {
      alert("Please fix the email format.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/auth/forgot-password", {
        email: form.email,
      });
      alert("If an account exists for this email, a reset link has been sent.");
      
      setFade(true);
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsLogin(true);
        setForm({ username: "", email: "", password: "", confirmPassword: "" });
        setErrors({ email: "", passwordMatch: "", passwordStrength: "" });
        setFade(false);
      }, 250);
    } catch {
      alert("If an account exists for this email, a reset link has been sent.");
      setFade(true);
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsLogin(true);
        setForm({ username: "", email: "", password: "", confirmPassword: "" });
        setErrors({ email: "", passwordMatch: "", passwordStrength: "" });
        setFade(false);
      }, 250);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setFade(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsForgotPassword(false); 
      setForm({ username: "", email: "", password: "", confirmPassword: "" });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({ email: "", passwordMatch: "", passwordStrength: "" });
      setFade(false);
    }, 250);
  };

  const toggleForgotPassword = () => {
    setFade(true);
    setTimeout(() => {
      setIsForgotPassword(!isForgotPassword);
      setIsLogin(true); 
      setForm({ username: "", email: "", password: "", confirmPassword: "" });
      setErrors({ email: "", passwordMatch: "", passwordStrength: "" });
      setFade(false);
    }, 250);
  };

  return (
    <>
      <div
        className="relative flex justify-center items-center h-screen transition-all duration-500"
        style={{
          backgroundImage: `url(/images/bg.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        <form
          onSubmit={
            isForgotPassword ? handleForgotPasswordRequest : handleSubmit
          }
          className={`relative z-10 bg-lp-light-bg/90 p-6 md:p-8 rounded-xl shadow-xl w-full max-w-md mx-4 transition-all duration-300 ${
            fade ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          {isForgotPassword ? (
            <>
              <div className="text-center mb-6">
                <img 
                    src="/images/Lp.png" 
                    alt="La Piscina Logo" 
                    className="h-24 w-auto mx-auto mb-4 object-contain"
                />
                <h1 className="text-xl md:text-2xl font-bold">Reset Password</h1>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Enter your email to receive a reset link.
                </p>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-2 mb-2 border rounded text-sm md:text-base"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 mb-2">{errors.email}</p>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full p-2 mb-4 rounded bg-lp-orange text-white text-sm md:text-base ${
                  isLoading 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:bg-lp-orange-hover"
                }`}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
              
              <p className="text-center">
                <span
                  onClick={!isLoading ? toggleForgotPassword : undefined}
                  className={`text-lp-blue flex items-center justify-center gap-1 text-sm ${
                    isLoading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <ArrowLeft size={16} /> Back to Login
                </span>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <img 
                    src="/images/Lp.png" 
                    alt="La Piscina Logo" 
                    className="h-24 w-auto mx-auto mb-4 object-contain"
                />
                <h1 className="text-xl md:text-2xl font-bold">{isLogin ? "Login" : "Sign Up"}</h1>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Welcome to La Piscina!
                </p>
              </div>

              {isLogin && (
                <>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border rounded text-sm md:text-base"
                    required
                  />
                  <div className="relative mb-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full p-2 border rounded pr-10 text-sm md:text-base"
                      required
                    />
                    {form.password && (
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </span>
                    )}
                  </div>
                  <div className="text-right mb-4">
                    <span
                      onClick={!isLoading ? toggleForgotPassword : undefined}
                      className={`text-xs md:text-sm text-lp-blue hover:underline ${
                        isLoading ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      Forgot Password?
                    </span>
                  </div>
                </>
              )}

              {!isLogin && (
                <>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full p-2 mb-4 border rounded text-sm md:text-base"
                    required
                  />
                  <div className="mb-2">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-sm md:text-base"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 text-left">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="relative mb-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full p-2 border rounded pr-10 text-sm md:text-base"
                      required
                    />
                    {form.password && (
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </span>
                    )}
                  </div>
                  {errors.passwordStrength && (
                      <p className="text-red-500 text-xs mt-1 mb-2 text-left break-words leading-tight">
                        {errors.passwordStrength}
                      </p>
                  )}

                  <div className="relative mb-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-2 border rounded pr-10 text-sm md:text-base"
                      required
                    />
                    {form.confirmPassword && (
                      <span
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 cursor-pointer text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </span>
                    )}
                  </div>

                  {errors.passwordMatch && (
                    <p className="text-red-500 text-xs mt-1 text-left">
                      {errors.passwordMatch}
                    </p>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full p-2 mt-2 mb-4 rounded bg-lp-orange text-white text-sm md:text-base ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-lp-orange-hover"
                }`}
              >
                {isLoading
                  ? isLogin
                    ? "Logging in..."
                    : "Signing up..."
                  : isLogin
                  ? "Login"
                  : "Sign Up"}
              </button>

              <p className="text-center text-sm md:text-base">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <span
                  onClick={!isLoading ? handleSwitchMode : undefined}
                  className={`text-lp-blue ${
                    isLoading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {isLogin ? "Sign Up" : "Login"}
                </span>
              </p>
            </>
          )}
        </form>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to logout?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2 px-4 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Auth;