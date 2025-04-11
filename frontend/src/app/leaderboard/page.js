"use client";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";

export default function LeaderboardPage() {
  const [overallLeaderboard, setOverallLeaderboard] = useState([]);
  const [todayLeaderboard, setTodayLeaderboard] = useState([]);
  const [exerciseLeaderboards, setExerciseLeaderboards] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overall");
  const [activeTimeFrame, setActiveTimeFrame] = useState("overall");

  const exerciseTypes = ["Squats", "Pushups", "Crunches", "Bicep Curls"];

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const token = Cookies.get("token");

      if (!token) {
        toast.error("You must be logged in to view the leaderboard.");
        return;
      }

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
          "https://bursting-shepherd-promoted.ngrok-free.app/api/auth/leaderboard",
          requestOptions
        );

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data.");
        }

        const result = await response.json();

        if (result.status === "success") {
          // Process overall leaderboard data
          const processedOverallLeaderboard = result.data.overall_leaderboard
            .map((user) => {
              // Calculate total points across all exercises
              const totalScore = Object.values(user.total_points).reduce(
                (sum, points) => sum + points,
                0
              );

              return {
                ...user,
                totalScore,
                total_points: user.total_points, // Keep the original breakdown
              };
            })
            .sort((a, b) => b.totalScore - a.totalScore);

          setOverallLeaderboard(processedOverallLeaderboard);

          // Process today's leaderboard data
          const processedTodayLeaderboard = result.data.today_leaderboard
            .map((user) => {
              // Calculate total points for today across all exercises
              const todayScore = Object.values(user.today_points).reduce(
                (sum, points) => sum + points,
                0
              );

              return {
                ...user,
                todayScore,
                today_points: user.today_points, // Keep the original breakdown
              };
            })
            .sort((a, b) => b.todayScore - a.todayScore);

          setTodayLeaderboard(processedTodayLeaderboard);

          // Create exercise-specific leaderboards
          const exerciseBoards = {};

          // For each exercise type, create a leaderboard
          exerciseTypes.forEach((exercise) => {
            // Overall leaderboard for this exercise
            exerciseBoards[`${exercise}_overall`] =
              result.data.overall_leaderboard
                .map((user) => ({
                  username: user.username,
                  points: user.total_points[exercise] || 0,
                }))
                .sort((a, b) => b.points - a.points);

            // Today's leaderboard for this exercise
            exerciseBoards[`${exercise}_today`] = result.data.today_leaderboard
              .map((user) => ({
                username: user.username,
                points: user.today_points[exercise] || 0,
              }))
              .sort((a, b) => b.points - a.points);
          });

          setExerciseLeaderboards(exerciseBoards);
        } else {
          toast.error("Failed to fetch leaderboard data.");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Function to get medal for top 3 positions
  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  // Function to render tab content based on active tab and time frame
  const renderTabContent = () => {
    if (activeTab === "overall") {
      // Show overall leaderboard
      const leaderboardData =
        activeTimeFrame === "overall" ? overallLeaderboard : todayLeaderboard;

      return (
        <div className="space-y-4">
          {leaderboardData.length > 0 ? (
            leaderboardData.map((user, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-4 rounded-lg transition-all duration-300 transform hover:scale-102 hover:shadow-glow cursor-pointer backdrop-blur-sm ${
                  index < 3
                    ? `bg-gradient-to-r ${
                        index === 0
                          ? "from-yellow-900/50 to-yellow-700/30 border-l-4 border-yellow-500"
                          : index === 1
                          ? "from-gray-800/50 to-gray-600/30 border-l-4 border-gray-400"
                          : "from-amber-900/50 to-amber-700/30 border-l-4 border-amber-700"
                      }`
                    : "bg-gray-700/50 hover:bg-gray-700/70"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {getMedal(index) ? (
                      <div className="text-2xl">{getMedal(index)}</div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold bg-gray-700">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-lg ${
                      index < 3 ? "text-white font-semibold" : "text-white"
                    }`}
                  >
                    {user.username}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-lg font-bold ${
                      index === 0
                        ? "text-yellow-400"
                        : index === 1
                        ? "text-gray-300"
                        : index === 2
                        ? "text-amber-600"
                        : "text-blue-400"
                    }`}
                  >
                    {activeTimeFrame === "overall"
                      ? user.totalScore
                      : user.todayScore}{" "}
                    points
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    {Object.entries(
                      activeTimeFrame === "overall"
                        ? user.total_points
                        : user.today_points
                    ).map(([exercise, points], i) => (
                      <span key={exercise}>
                        {exercise}: {points}
                        {i <
                        Object.entries(
                          activeTimeFrame === "overall"
                            ? user.total_points
                            : user.today_points
                        ).length -
                          1
                          ? " • "
                          : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No data available.</p>
          )}
        </div>
      );
    } else {
      // Show exercise-specific leaderboard
      const leaderboardKey = `${activeTab}_${activeTimeFrame}`;
      const leaderboardData = exerciseLeaderboards[leaderboardKey] || [];

      return (
        <div className="space-y-4">
          {leaderboardData.length > 0 ? (
            leaderboardData.map((user, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-4 rounded-lg transition-all duration-300 transform hover:scale-102 hover:shadow-glow cursor-pointer backdrop-blur-sm ${
                  index < 3
                    ? `bg-gradient-to-r ${
                        index === 0
                          ? "from-yellow-900/50 to-yellow-700/30 border-l-4 border-yellow-500"
                          : index === 1
                          ? "from-gray-800/50 to-gray-600/30 border-l-4 border-gray-400"
                          : "from-amber-900/50 to-amber-700/30 border-l-4 border-amber-700"
                      }`
                    : "bg-gray-700/50 hover:bg-gray-700/70"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {getMedal(index) ? (
                      <div className="text-2xl">{getMedal(index)}</div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold bg-gray-700">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-lg ${
                      index < 3 ? "text-white font-semibold" : "text-white"
                    }`}
                  >
                    {user.username}
                  </span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    index === 0
                      ? "text-yellow-400"
                      : index === 1
                      ? "text-gray-300"
                      : index === 2
                      ? "text-amber-600"
                      : "text-blue-400"
                  }`}
                >
                  {user.points} points
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">
              No data available for this exercise.
            </p>
          )}
        </div>
      );
    }
  };

  const getExerciseEmoji = (exercise) => {
    switch (exercise) {
      case "Squats":
        return "🏋️";
      case "Pushups":
        return "💪";
      case "Crunches":
        return "🧘";
      case "Bicep Curls":
        return "💪";
      default:
        return "🏆";
    }
  };

  // Function to render podium for top 3 users (when available)
  const renderPodium = () => {
    const leaderboardData =
      activeTab === "overall"
        ? activeTimeFrame === "overall"
          ? overallLeaderboard
          : todayLeaderboard
        : exerciseLeaderboards[`${activeTab}_${activeTimeFrame}`] || [];

    if (leaderboardData.length < 3) return null;

    const top3 = leaderboardData.slice(0, 3);
    const getScore = (user) => {
      if (activeTab === "overall") {
        return activeTimeFrame === "overall"
          ? user.totalScore
          : user.todayScore;
      } else {
        return user.points;
      }
    };

    return (
      <div className="mb-8 pt-4">
        <div className="flex justify-center items-end h-48 mb-4">
          {/* Silver - 2nd Place */}
          <div className="w-24 mx-2 flex flex-col items-center">
            <div className="text-xl mb-2">🥈</div>
            <div
              className="bg-gradient-to-t from-gray-600 to-gray-400 w-full rounded-t-lg flex flex-col items-center pt-2 pb-1 shadow-lg"
              style={{ height: "110px" }}
            >
              <div className="text-white font-bold truncate w-20 text-center">
                {top3[1]?.username}
              </div>
              <div className="text-white text-sm mt-1">{getScore(top3[1])}</div>
            </div>
          </div>

          {/* Gold - 1st Place */}
          <div className="w-28 mx-2 flex flex-col items-center">
            <div className="text-xl mb-2">🥇</div>
            <div
              className="bg-gradient-to-t from-yellow-600 to-yellow-400 w-full rounded-t-lg flex flex-col items-center pt-2 pb-1 shadow-lg"
              style={{ height: "140px" }}
            >
              <div className="text-white font-bold truncate w-24 text-center">
                {top3[0]?.username}
              </div>
              <div className="text-white text-sm mt-1">{getScore(top3[0])}</div>
            </div>
          </div>

          {/* Bronze - 3rd Place */}
          <div className="w-20 mx-2 flex flex-col items-center">
            <div className="text-xl mb-2">🥉</div>
            <div
              className="bg-gradient-to-t from-amber-800 to-amber-600 w-full rounded-t-lg flex flex-col items-center pt-2 pb-1 shadow-lg"
              style={{ height: "80px" }}
            >
              <div className="text-white font-bold truncate w-16 text-center">
                {top3[2]?.username}
              </div>
              <div className="text-white text-sm mt-1">{getScore(top3[2])}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto ">
        {/* Header with animated gradient text */}
        <header className="w-full py-12 bg-gradient-to-r from-blue-900/80 via-purple-900/80 to-pink-900/80 mb-10 rounded-2xl backdrop-blur-lg border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 animate-gradient-x tracking-tight">
              Fitness Leaderboard
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-300 max-w-3xl mx-auto">
              Compete, challenge, and conquer your fitness goals!
            </p>
            <div className="mt-8 h-1 w-32 mx-auto bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full shadow-sm"></div>
          </div>
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-4 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tabs for Exercise Types */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab("overall")}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === "overall"
                    ? "bg-blue-500 text-white shadow-glow-blue"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                🏆 Overall
              </button>

              {exerciseTypes.map((exercise) => (
                <button
                  key={exercise}
                  onClick={() => setActiveTab(exercise)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    activeTab === exercise
                      ? "bg-blue-500 text-white shadow-glow-blue"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {getExerciseEmoji(exercise)} {exercise}
                </button>
              ))}
            </div>

            {/* Time Frame Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-800 p-1 rounded-full">
                <button
                  onClick={() => setActiveTimeFrame("overall")}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    activeTimeFrame === "overall"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setActiveTimeFrame("today")}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    activeTimeFrame === "today"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Today
                </button>
              </div>
            </div>

            {/* Podium for Top 3 */}
            {!loading && renderPodium()}

            {/* Leaderboard Card */}
            <div className="bg-gray-800/30 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700/30 transition-all duration-500 hover:shadow-blue-900/20 hover:border-blue-900/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-blue-400">
                  {activeTab === "overall" ? "🏆" : getExerciseEmoji(activeTab)}
                </span>
                {activeTab === "overall" ? "Overall" : activeTab} Leaderboard
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({activeTimeFrame === "overall" ? "All Time" : "Today"})
                </span>
              </h2>

              {renderTabContent()}
            </div>

            {/* Tips Section */}
            <div className="bg-gray-800/30 backdrop-blur-lg p-6 rounded-xl shadow-xl border border-gray-700/30 mt-8">
              <h3 className="text-xl font-bold text-white mb-4">
                💡 Fitness Tips
              </h3>
              <div className="text-gray-300 text-sm">
                <p>
                  • Consistency is key - small daily efforts lead to big results
                </p>
                <p>• Compete with yourself first, then with others</p>
                <p>• Mix different exercise types for balanced fitness</p>
              </div>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer position="bottom-right" theme="dark" />
      </div>

      {/* Custom CSS for extra effects */}
      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }

        .shadow-glow {
          box-shadow: 0 0 15px rgba(66, 153, 225, 0.5);
        }

        .shadow-glow-blue {
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
