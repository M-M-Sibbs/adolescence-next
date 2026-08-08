"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-ink-900">Adolescence</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink-900">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start your AI-powered learning journey</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Full Name</label>
              <input name="name" value={form.name} onChange={handle} required className="input" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} required className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} required className="input" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Confirm Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handle} required className="input" placeholder="Repeat password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account? <Link href="/login" className="text-indigo-500 hover:text-indigo-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
