"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setSuccess(false);

    try {
      const res = await axios.post(
        "http://localhost:3001/api/login",
        { username, password },
        { withCredentials: true }
      );

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Registration failed", err);
      setError(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-6">
      <h1 className="text-2xl font-bold">Register Page</h1>

      {error && (
        <div className="w-80 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
          Registration failed. Please try a different username.
        </div>
      )}
      {success && (
        <div className="w-80 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded">
          Registered successfully! Redirecting to login...
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="nes-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="nes-input"
          required
        />
        <button type="submit" className="nes-btn is-success">
          Register
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 underline">
          Login here
        </a>
      </p>
    </div>
  );
}
