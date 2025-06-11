"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { login } from "@/utils/api";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageComponent />
    </Suspense>
  );
}

const LoginPageComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { fetchUser } = useUser() ?? {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(false);
      setSuccess(false);

      const res = await login(username, password);

      if (!res || res.status !== 200) {
        setError(true);
        return;
      }

      setSuccess(true);
      localStorage.setItem("cachedUser", JSON.stringify(res.data));

      const redirectTo = searchParams.get("redirect") || "/";
      await fetchUser?.();
      setTimeout(() => router.replace(redirectTo), 1000); // Redirect after short delay
    } catch (err) {
      setError(true);
      console.error("Login failed", err);
    }

    console.log("Submitted", { username, password });
  };

  return (
    <main className="main-flex flex flex-col items-center justify-center w-full h-screen gap-6 text-center">
      <h1 className="text-2xl font-bold">Login Page</h1>
      <section className="section-flex flex-col items-center justify-center gap-4 px-4 text-center">
        {error && (
          <div className="max-w-80 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            Login failed. Please check your username and password.
          </div>
        )}

        {success && (
          <div className="max-w-80 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded">
            Logged in successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 max-w-80 px-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="nes-input"
            autoComplete="username"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="nes-input"
            autoComplete="current-password"
            required
          />
          <button type="submit" className="nes-btn is-primary w-full">
            Login
          </button>
        </form>

        <h2>
          New user?{" "}
          <Link     
            href={{
              pathname: "/register",
              query: searchParams.has("redirect")
                ? { redirect: searchParams.get("redirect") }
                : undefined,
            }} className="text-blue-600 underline"
          >
            Register here
          </Link>
        </h2>
      </section>
    </main>
  );
};
