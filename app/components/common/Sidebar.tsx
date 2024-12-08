"use client";

import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const { user } = useAuthContext();
  const { logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-gray-100 text-gray-800 flex flex-col">
      <div className="p-5">
        <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
      </div>
      <nav className="flex-grow">
        <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-200">
          Home
        </Link>
      </nav>
      <button
        onClick={logout}
        className="block w-full py-2 px-4 bg-gray-300 hover:bg-gray-400 text-center"
      >
        Logout
      </button>
    </aside>
  );
}
