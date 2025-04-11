"use client";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password constraints
  const passwordConstraints = [
    { id: 1, text: "At least 8 characters", regex: /.{8,}/ },
    { id: 2, text: "At least one uppercase letter", regex: /[A-Z]/ },
  ];

  // Check if password meets all constraints
  const validatePassword = (password) => {
    return passwordConstraints.every((constraint) =>
      constraint.regex.test(password)
    );
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Check if password meets constraints
    if (!validatePassword(newPassword)) {
      setPasswordError("Password does not meet the requirements.");
    } else {
      setPasswordError("");
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Handle form submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setIsLoading(false);
      return;
    }

    // Check if password meets constraints
    if (!validatePassword(password)) {
      toast.error("Password does not meet the requirements.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setIsLoading(false);
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      email,
      username,
      password,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/register`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error("Signup failed. Please check your details.");
      }

      const result = await response.json();
      console.log(result);

      // Show success toast
      toast.success("Signup successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error(error);

      // Show error toast
      toast.error(error.message || "An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-6 w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Create Account
            </span>
          </h2>
        </motion.div>

        {/* Email Field */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <label className="text-gray-300 font-medium flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 pl-4 w-full bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all duration-300 shadow-sm shadow-gray-900/30"
              required
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
          </div>
        </motion.div>

        {/* Username Field */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <label className="text-gray-300 font-medium flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 pl-4 w-full bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all duration-300 shadow-sm shadow-gray-900/30"
              required
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <label className="text-gray-300 font-medium flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={handlePasswordChange}
              className="p-3 pl-4 w-full bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all duration-300 shadow-sm shadow-gray-900/30"
              required
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
          </div>
        </motion.div>

        {/* Password Constraints */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <p className="text-gray-300 font-medium">Password must contain:</p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {passwordConstraints.map((constraint) => (
              <li
                key={constraint.id}
                className={`flex items-center gap-2 ${
                  constraint.regex.test(password)
                    ? "text-green-400"
                    : "text-gray-400"
                } transition-colors duration-300`}
              >
                {constraint.regex.test(password) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {constraint.text}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Confirm Password Field */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <label className="text-gray-300 font-medium flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="p-3 pl-4 w-full bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all duration-300 shadow-sm shadow-gray-900/30"
              required
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
          </div>
          {/* Password Match Error */}
          {password !== confirmPassword && confirmPassword.length > 0 && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Passwords do not match.
            </p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-2"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-md shadow-blue-900/20 group"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            {isLoading ? (
              <div className="flex items-center gap-2 relative z-10">
                <div className="w-4 h-4 border-2 border-white/80 border-t-2 border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              <span className="relative z-10 flex items-center gap-1">
                Sign Up
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </button>
        </motion.div>

        {/* Already have an account link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="text-center text-sm text-gray-400"
        >
          <span>Already have an account? </span>
          <a
            href="#"
            className="text-blue-400 hover:text-purple-400 transition-colors duration-300 relative inline-block group"
          >
            <span>Log in</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
          </a>
        </motion.div>
      </form>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
};

export default SignupForm;
