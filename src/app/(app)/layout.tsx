"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AppLayout from "@/components/AppLayout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <p className="text-slate-400 font-mono text-sm">Loading…</p>
      </div>
    );
  }
  if (!user) return null;

  return <AppLayout>{children}</AppLayout>;
}
