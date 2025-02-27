"use client";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Password constraints
  const passwordConstraints = [
    { id: 1, text: "At least 8 characters", regex: /.{8,}/ },
    { id: 2, text: "At least one uppercase letter", regex: /[A-Z]/ },
    { id: 3, text: "At least one lowercase letter", regex: /[a-z]/ },
    { id: 4, text: "At least one number", regex: /[0-9]/ },
    { id: 5, text: "At least one special character", regex: /[!@#$%^&*]/ },
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
    }
  };

  return (
    <>
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-6 w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Sign Up
        </h2>

        <div className="flex flex-col gap-4">
          {/* Email Field */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Username Field */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Password Field */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Password Constraints */}
          <div className="text-sm text-gray-600">
            <p className="font-semibold">Password must contain:</p>
            <ul className="list-disc list-inside">
              {passwordConstraints.map((constraint) => (
                <li
                  key={constraint.id}
                  className={
                    constraint.regex.test(password)
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {constraint.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Confirm Password Field */}
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Password Match Error */}
          {password !== confirmPassword && confirmPassword.length > 0 && (
            <p className="text-sm text-red-500">Passwords do not match.</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
        >
          Sign Up
        </button>
      </form>

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
};

export default SignupForm;
