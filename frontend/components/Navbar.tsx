"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/api";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await logout();
      if (res.status === 200) {
        router.push("/login");
      } else {
        console.error("Logout failed", res.statusText);
      }
    } catch (err) {
      console.error("Logout error", err);
    }
  }

  return (
    <div className="absolute inset-0 z-50 h-16 px-10 pt-10 flex items-center justify-between">
      <Link
        href="/"
        className="font-bold hover:underline"
        style={{ color: "black" }}
      >
        doodly
      </Link>
      <nav className="space-x-4 flex flex-row items-center">
        <Link href="/profile" className="hover:underline">
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="hover:underline cursor-pointer nes-btn is-normal"
          type="button"
          aria-label="Logout"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}
