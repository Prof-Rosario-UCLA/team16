"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/api";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Optional: use Lucide icons



export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);


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
    <div className="absolute inset-x-0 top-0 z-50 h-[var(--navbar-height)] px-4 py-3 flex items-center justify-between bg-[var(--navbar-color)]">
      {/* Logo */}
      <Link
        href="/"
        className="font-bold !text-black text-lg hover:underline"
      >
        doodly
      </Link>

      {/* Desktop Links */}
      <div className="hidden sm:flex items-center space-x-4">
        <Link href="/leaderboard" className="hover:underline !text-black !text-sm">
          Leaderboard
        </Link>
        <button
          onClick={handleLogout}
          className="nes-btn is-normal !text-sm !px-1 !py-1"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="nes-btn p-2 focus:outline-none sm:!hidden"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-4 mt-2 w-40 bg-white shadow-lg rounded-md sm:!hidden z-50">
          <Link
            href="/leaderboard"
            className="block text-xs sm:text-sm px-4 py-2 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Leaderboard
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="block w-full text-left px-4 py-2 !text-xs sm:text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );

}
