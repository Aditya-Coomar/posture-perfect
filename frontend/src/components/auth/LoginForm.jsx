"use client";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Check if the user is already logged in (token exists)
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/home"); // Redirect to home if token exists
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      email,
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
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        requestOptions
      );

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const result = await response.json();
      console.log(result);

      // Store the JWT token in cookies
      Cookies.set("token", result.data, { expires: 1 }); // Expires in 1 day

      // Show success toast
      toast.success("Login successful! Redirecting to home...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        router.push("/home");
      }, 3000);
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
    }
  };

  return (
    <>
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-6 w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
        >
          Login
        </button>
      </form>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
};

export default LoginForm;
