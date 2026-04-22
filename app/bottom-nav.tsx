"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/discover", label: "Discover", icon: "🔎" },
  { href: "/starred", label: "Starred", icon: "⭐" },
  { href: "/calendar", label: "Calendar", icon: "🗓️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-bold transition ${
                isActive
                  ? "bg-orange-100 text-orange-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}