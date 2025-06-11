"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/api";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await logout();
      if (res && res.status === 200) {
        localStorage.removeItem("cachedUser");
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error", err);
    }
  }

  return (
    <div className="absolute inset-0 z-50 h-[var(--navbar-height)] px-10 pt-10 flex justify-between items-center">
      {/* Left side: Logo */}
      <Link
        href="/"
        className="font-bold hover:underline"
        style={{ color: "black" }}
      >
        doodly
      </Link>

      {/* Right side: Links */}
      <div className="flex items-center space-x-4">
        <Link href="/leaderboard" className="hover:underline">
          Leaderboard
        </Link>
        <button
          onClick={handleLogout}
          className="hover:underline cursor-pointer nes-btn is-normal !px-1 !py-1"
          type="button"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
