"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen, LayoutDashboard, Users, LogOut, Sparkles, GraduationCap } from "lucide-react";
import { ReactNode, useState } from "react";

const studentNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/lessons", icon: BookOpen, label: "Lessons" },
];

const adminNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Home" },
  { to: "/admin/lessons", icon: BookOpen, label: "Lessons" },
  { to: "/admin/users", icon: Users, label: "Users" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = user?.role === "admin" ? adminNav : studentNav;
  const initials = (user?.name || "?").charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (to: string) =>
    to === "/admin" || to === "/dashboard" ? pathname === to : pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-surface-900">
      {/* Desktop sidebar (hidden on phones) */}
      <aside className="hidden lg:flex flex-col bg-white border-r border-cream-300 w-64 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-cream-300">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-ink-900">Adolescence</span>
        </div>

        <div className="px-6 py-3 border-b border-cream-300">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-display font-bold text-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-900 truncate">{user?.name}</p>
              <p className="text-xs text-ink-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              href={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(to)
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-ink-500 hover:text-ink-900 hover:bg-cream-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-500 hover:text-red-600 hover:bg-red-50 transition-all w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-cream-300 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="font-display font-bold text-base text-ink-900">Adolescence</span>
            </div>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Account menu"
              className="w-10 h-10 -mr-1 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <span className="w-9 h-9 rounded-full bg-indigo-500 text-white font-display font-bold text-sm flex items-center justify-center">
                {initials}
              </span>
            </button>
          </div>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-3 top-[calc(3.5rem+env(safe-area-inset-top))] z-20 w-56 bg-white border border-cream-300 rounded-xl shadow-lift overflow-hidden">
                <div className="px-4 py-3 border-b border-cream-200">
                  <p className="text-sm font-medium text-ink-900 truncate">{user?.name}</p>
                  <p className="text-xs text-ink-400 truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full capitalize">
                    <GraduationCap size={11} /> {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-3.5 text-sm font-medium text-red-600 active:bg-red-50"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          )}
        </header>

        <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-cream-300 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-stretch justify-around h-[4.25rem]">
            {nav.map(({ to, icon: Icon, label }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  href={to}
                  className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                >
                  <span className={`flex items-center justify-center h-8 w-14 rounded-full transition-colors ${active ? "bg-indigo-50" : ""}`}>
                    <Icon size={21} className={active ? "text-indigo-600" : "text-ink-400"} strokeWidth={active ? 2.4 : 2} />
                  </span>
                  <span className={`text-[11px] font-medium ${active ? "text-indigo-600" : "text-ink-400"}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
