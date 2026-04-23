"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/discover", label: "Discover", icon: "🔎" },
  { href: "/starred", label: "Starred", icon: "⭐" },
  { href: "/calendar", label: "Calendar", icon: "🗓️" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/95 px-3 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-orange-100 text-orange-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}