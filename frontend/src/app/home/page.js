"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  LogOut, 
  User, 
  Trophy, 
  Dumbbell, 
  ChevronRight, 
  Clipboard, 
  Calendar 
} from "lucide-react";
import { 
  Alert, 
  AlertDescription 
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();
  const [workoutData, setWorkoutData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  // Check if the user is authenticated (has a token)
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/");
    }
    
    // Auto-hide notification after 5 seconds
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);

  // Fetch workout recommendations
  const fetchWorkoutRecommendations = async () => {
    const token = Cookies.get("token");

    if (!token) {
      toast.error("You must be logged in to view workout recommendations.");
      return;
    }

    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("ngrok-skip-browser-warning", "790355");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://bursting-shepherd-promoted.ngrok-free.app/api/auth/workout/recommendation",
        requestOptions
      );

      const text = await response.text();
      console.log("Raw Response:", text);

      const result = JSON.parse(text);
      console.log("Parsed JSON:", result);

      if (result.status === "success" && result.data.length > 0) {
        setWorkoutData(result.data);
      } else {
        setWorkoutData([]);
        toast.info("No workout recommendations available.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch workout recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/");
  };

  // Background elements for decoration
  const BackgroundElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-700/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 -left-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl"></div>
      
      {/* Subtle animated elements */}
      <motion.div 
        animate={{ 
          y: [0, 15, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 12,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 right-1/5 w-28 h-28 bg-indigo-600/10 rounded-full blur-2xl"
      />
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 15,
          ease: "easeInOut" 
        }}
        className="absolute bottom-1/4 left-10 w-40 h-40 bg-purple-700/10 rounded-full blur-2xl"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-900 overflow-hidden relative">
      {/* Background Elements */}
      <BackgroundElements />

      {/* Notification Banner */}
      {/*
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="relative z-50"
          >
            <Alert className="mx-auto max-w-4xl mt-4 rounded-lg border-none shadow-lg shadow-purple-900/20 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-lg">
              <AnimatePresence>
                <motion.div 
                  initial={{ x: -5, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center"
                >
                  <Activity className="h-5 w-5 mr-2 text-indigo-200" />
                  <AlertDescription className="text-white">
                    Welcome back! Your latest workout stats are available.
                  </AlertDescription>
                </motion.div>
              </AnimatePresence>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>*/}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-lg bg-slate-900/70 border-b border-gray-700/30 px-6 py-4 flex justify-between items-center shadow-lg shadow-purple-900/10 sticky top-0 z-40"
      >
        <Link href="/home" className="flex items-center group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mr-3 group-hover:shadow-blue-600/20 transition-all duration-300">
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Posture
            </span>{" "}
            <span className="text-white">Perfect</span>
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/liveWorkout">
            <Button variant="ghost" className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/20">
              <Activity className="mr-2 h-5 w-5" />
              Live Workout
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="ghost" className="text-purple-300 hover:text-purple-200 hover:bg-purple-900/20">
              <Trophy className="mr-2 h-5 w-5" />
              Leaderboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Edit Profile Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/personalizeExperience">
              <Button size="sm" className="md:px-4 bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:from-purple-700 hover:to-blue-800 shadow-md shadow-blue-900/20">
                <User className="md:mr-2 h-4 w-4" />
                <span className="hidden md:inline">Edit Profile</span>
              </Button>
            </Link>
          </motion.div>

          {/* Logout Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleLogout}
              size="sm"
              variant="destructive"
              className="md:px-4 bg-gradient-to-r from-purple-700 to-red-700 hover:from-purple-700 hover:to-red-800 shadow-md shadow-red-900/20"
            >
              <LogOut className="md:mr-2 h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 md:p-8 relative z-10 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto backdrop-blur-lg p-4 md:p-8 rounded-2xl border border-gray-700/30 shadow-[0_0_25px_rgba(76,29,149,0.15)] bg-gradient-to-br from-gray-900/80 to-gray-800/80"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                Your Dashboard
              </h2>
              <p className="text-gray-300 max-w-xl">
                Welcome back! Here's your personalized fitness journey overview. Track your progress and achieve your goals.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 text-sm">
                Member
              </Badge>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-indigo-900/40 backdrop-blur-sm rounded-xl border border-blue-700/20"></div>
              <div className="absolute inset-0 bg-blue-500/5 rounded-xl"></div>
              
              <Card className="border-0 bg-transparent shadow-xl">
                <CardHeader className="relative py-2 z-10">
                  <CardTitle className="text-xl font-semibold flex items-center text-blue-300">
                    <Activity className="h-5 w-5 mr-2 text-blue-400" />
                    Live Workout Tracking
                  </CardTitle>
                  <CardDescription className="text-blue-100/70">
                    Start tracking your activities in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-300 mb-4">
                    Our AI-powered posture detection helps you maintain proper form during exercises.
                  </p>
                  <Link href="/liveWorkout">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-900/20">
                      Start Workout
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-emerald-800/30 to-teal-900/40 backdrop-blur-sm rounded-xl border border-green-700/20"></div>
              <div className="absolute inset-0 bg-green-500/5 rounded-xl"></div>
              
              <Card className="border-0 bg-transparent shadow-xl">
                <CardHeader className="relative py-2 z-10">
                  <CardTitle className="text-xl font-semibold flex items-center text-green-300">
                    <Trophy className="h-5 w-5 mr-2 text-green-400" />
                    Community Challenge
                  </CardTitle>
                  <CardDescription className="text-green-100/70">
                    Compete with friends to stay motivated
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-300 mb-4">
                    Join weekly challenges and earn points by maintaining perfect posture during workouts.
                  </p>
                  <Link href="/leaderboard">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md shadow-green-900/20">
                      View Leaderboard
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Weekly Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 border-gray-700/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                  Weekly Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-gray-400 mb-2">{day}</span>
                      <motion.div 
                        className={`w-8 md:w-12 h-20 rounded-full ${
                          i <= 3 ? "bg-gradient-to-t from-purple-600 to-blue-500" : "bg-gray-700/40"
                        } relative overflow-hidden`}
                        initial={{ height: 0 }}
                        animate={{ height: i <= 3 ? 20 + (i * 15) : 10 }}
                        transition={{ delay: 0.5 + (i * 0.1), duration: 0.5 }}
                      />
                      <span className="text-xs text-gray-400 mt-2">
                        {i <= 3 ? `${25 * (i + 1)}m` : "--"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* View Personalized Workout Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={fetchWorkoutRecommendations}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-900/20 relative overflow-hidden group disabled:opacity-70"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
                <span className="relative flex items-center justify-center">
                  {loading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <Clipboard className="w-5 h-5 mr-2" />
                  )}
                  {loading ? "Loading..." : "View Personalized Workout"}
                </span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push("/viewWorkoutProfile")}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-blue-900/20 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
                <span className="relative flex items-center justify-center">
                  <User className="w-5 h-5 mr-2" />
                  View Workout Profile
                </span>
              </Button>
            </motion.div>
          </div>

          {/* Workout Recommendations */}
          <AnimatePresence>
            {loading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2 text-purple-400" />
                  Loading Your Workout Plan...
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-4 backdrop-blur-sm bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl border border-purple-700/20 shadow-md shadow-purple-900/10">
                      <Skeleton className="h-6 w-48 bg-purple-500/10 mb-4" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        <Skeleton className="h-4 w-20 bg-purple-500/10" />
                        <Skeleton className="h-4 w-16 bg-purple-500/10" />
                        <Skeleton className="h-4 w-24 bg-purple-500/10" />
                        <Skeleton className="h-4 w-20 bg-purple-500/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : workoutData.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2 text-purple-400" />
                  Your Personalized Workout Plan
                </h3>
                <div className="space-y-4">
                  {workoutData.map((workout, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className="p-4 backdrop-blur-sm bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl border border-purple-700/20 shadow-md shadow-purple-900/10"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h4 className="text-lg font-semibold text-purple-400 mb-2 md:mb-0">
                          {workout.exercise_name}
                        </h4>
                        <Badge className="w-fit bg-purple-800/50 text-purple-200 border border-purple-500/30">
                          {workout.day}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-900/30 border border-indigo-600/30 flex items-center justify-center mr-2">
                            <span className="text-indigo-400 text-sm">{workout.exercise_reps}</span>
                          </div>
                          <span className="text-gray-400">Reps</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-purple-900/30 border border-purple-600/30 flex items-center justify-center mr-2">
                            <span className="text-purple-400 text-sm">{workout.exercise_sets}</span>
                          </div>
                          <span className="text-gray-400">Sets</span>
                        </div>
                        <div className="flex items-center col-span-2 md:col-span-1">
                          <div className="w-8 h-8 rounded-full bg-blue-900/30 border border-blue-600/30 flex items-center justify-center mr-2">
                            <span className="text-blue-400 text-sm">{workout.duration}</span>
                          </div>
                          <span className="text-gray-400">Duration</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="p-6 text-center text-gray-400 z-10 relative w-full mt-auto backdrop-blur-lg bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 border-t border-white/10"
      >
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-lg opacity-30"></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
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
              <span className="text-white font-semibold">Posture Perfect</span>
            </div>
            
            <div className="flex justify-center gap-6">
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
              <a
                href="#"
                className="text-blue-400 hover:text-purple-400 transition-colors duration-300 relative group"
              >
                Help Center
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
            
            <div className="text-sm">
              © {new Date().getFullYear()} Posture Perfect
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Toast Container with custom styling */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}