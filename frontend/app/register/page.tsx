"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login, register } from "@/utils/api";
import { useUser } from "@/contexts/UserContext";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageComponent />
    </Suspense>
  );
}

const RegisterPageComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { fetchUser } = useUser() ?? {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setSuccess(false);

    try {
      const res = await register(username, password);
      if (res && (res.status === 200 || res.status === 201)) {
        const loginRes = await login(username, password);
        if (loginRes && loginRes.status === 200) {
          setSuccess(true);
          localStorage.setItem("cachedUser", JSON.stringify(loginRes.data));
          const redirectTo = searchParams.get("redirect") || "/";
          await fetchUser?.();
          setTimeout(() => router.replace(redirectTo), 1000); // Redirect after short delay
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Registration failed", err);
      setError(true);
    }
  };

  return (
    <main className="main-flex flex flex-col items-center justify-center w-full h-screen gap-6 text-center">
      <h1 className="text-2xl font-bold">Register Page</h1>
      <section className="section-flex flex-col items-center justify-center gap-4 px-4 text-center">
        {error && (
          <div className="max-w-80 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            Registration failed. Please try a different username.
          </div>
        )}
        {success && (
          <div className="max-w-80 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded">
            Registered successfully! Logging you in...
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
            maxLength={12}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="nes-input"
            autoComplete="new-password"
            required
          />
          <button type="submit" className="nes-btn is-success w-full">
            Register
          </button>
        </form>

        <h2>
          Already have an account?{" "}
          <Link
            href={{
              pathname: "/login",
              query: searchParams.has("redirect")
                ? { redirect: searchParams.get("redirect") }
                : undefined,
            }}
            className="text-blue-600 underline"
          >
            Login here
          </Link>
        </h2>
      </section>
    </main>
  );
}
