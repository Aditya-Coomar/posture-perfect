"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronLeft, ChevronRight, Lock, Mail } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignUpForm";


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
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -15, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl"
        ></motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen relative z-10">
        {/* Left Section - Product Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center items-center p-8"
        >
          <Card className="max-w-md w-full backdrop-blur-lg border-gray-700/30 shadow-[0_0_25px_rgba(76,29,149,0.2)] bg-gradient-to-br from-gray-900/80 to-gray-800/80">
            <CardContent className="p-8">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white ml-3 flex items-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                      Posture
                    </span>
                    <span className="ml-2 text-white">Perfect</span>
                  </h1>
                </div>
                <p className="text-gray-300 leading-relaxed mb-8">
                  The Posture Perfect Portal is your all-in-one platform for
                  managing your posture health and enhancing your physical
                  wellbeing. Easily track, correct, and maintain proper alignment
                  while ensuring consistent improvement and professional guidance
                  for long-term posture wellness.
                </p>
                <div className="space-y-5 text-gray-300">
                  {[
                    "Intuitive fitness management system for all your needs.",
                    "Streamlined engagement for operational excellence",
                    "Secure, fast, and reliable platform for physical and mental growth"
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                      className="flex items-start"
                    >
                      <div className="flex-shrink-0 h-6 w-6 text-purple-400 mr-3">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Check className="w-5 h-5" />
                        </motion.div>
                      </div>
                      <p className="text-gray-300">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Section - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center items-center p-8"
        >
          <Card className="max-w-md w-full backdrop-blur-lg border-gray-700/30 shadow-[0_0_25px_rgba(76,29,149,0.2)] bg-gradient-to-br from-gray-900/80 to-gray-800/80">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLogin ? <LoginForm /> : <SignupForm />}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Toggle Between Login and Signup */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            onClick={() => setIsLogin(!isLogin)}
            className="mt-6 text-blue-400 hover:text-purple-400 transition-all duration-300 font-medium group flex items-center"
          >
            {isLogin ? (
              <>
                <span className="flex items-center">
                  Don't have an account?{" "}
                  <span className="ml-1 relative inline-block group-hover:text-purple-400 transition-colors duration-300 font-semibold">
                    Sign Up
                  </span>
                </span>
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ x: -3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </motion.div>
                <span className="flex items-center">
                  Already have an account?{" "}
                  <span className="ml-1 relative inline-block group-hover:text-purple-400 transition-colors duration-300 font-semibold">
                    Login
                  </span>
                </span>
              </>
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
              {["Privacy Policy", "Terms of Service"].map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-blue-400 hover:text-purple-400 transition-colors duration-300 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;