"use client";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignUpForm";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const AuthLayout = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-900 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-700/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen relative z-10">
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center items-center p-8"
        >
          <div className="max-w-md w-full backdrop-blur-lg p-8 rounded-2xl border border-gray-700/30 shadow-[0_0_15px_rgba(76,29,149,0.15)] bg-gradient-to-br from-gray-900/80 to-gray-800/80">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white ml-3">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Posture
                  </span>{" "}
                  Perfect
                </h1>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                The Posture Perfect Portal is your all-in-one platform for
                managing your posture health and enhancing your physical
                wellbeing. Easily track, correct, and maintain proper alignment
                while ensuring consistent improvement and professional guidance
                for long-term posture wellness.
              </p>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-purple-400 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p>Intuitive fitness management system for all your needs.</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-purple-400 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p>Streamlined engagement for operational excellence</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-purple-400 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p>Secure, fast, and reliable platform for physical and mental growth</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center items-center p-8"
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="max-w-md w-full backdrop-blur-lg p-8 rounded-2xl border border-gray-700/30 shadow-[0_0_15px_rgba(76,29,149,0.15)] bg-gradient-to-br from-gray-900/80 to-gray-800/80"
          >
            {isLogin ? <LoginForm /> : <SignupForm />}
          </motion.div>

          {/* Toggle Between Login and Signup */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onClick={() => setIsLogin(!isLogin)}
            className="mt-6 text-blue-400 hover:text-purple-400 transition-all duration-300 font-medium group"
          >
            {isLogin ? (
              <span className="flex items-center">
                Don't have an account?{" "}
                <span className="ml-1 relative inline-block">
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Sign Up
                  </span>
                  <span className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 text-purple-400 font-semibold transition-opacity duration-300">
                    Create Account
                  </span>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Already have an account?{" "}
                <span className="ml-1 relative inline-block">
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Login
                  </span>
                  <span className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 text-purple-400 font-semibold transition-opacity duration-300">
                    Sign In
                  </span>
                </span>
              </span>
            )}
          </motion.button>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 text-center text-sm text-gray-400"
          >
            <div className="text-gray-500">© {currentYear} Posture Perfect</div>
            <div className="flex justify-center gap-6 mt-2">
              <a
                href="#"
                className="text-blue-400 hover:text-purple-400 transition-colors duration-300 relative group"
              >
                Privacy Policy
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a
                href="#"
                className="text-blue-400 hover:text-purple-400 transition-colors duration-300 relative group"
              >
                Terms of Service
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
