"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Users, Trash2, Loader2, Shield, GraduationCap, Search } from "lucide-react";
import { useAuth, AuthUser } from "@/lib/AuthContext";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string | null;
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/admin/users").then((r) => setUsers(r)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user? All their progress will be lost.")) return;
    setDeleting(id);
    try {
      await api.del(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const admins = filtered.filter((u) => u.role === "admin");
  const students = filtered.filter((u) => u.role === "student");

  return (
    <div className="px-4 py-5 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Users</h1>
        <p className="text-slate-400 text-sm mt-1">{users.length} registered users</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
            <GraduationCap size={20} className="text-indigo-500" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-ink-900">{users.filter((u) => u.role === "student").length}</p>
            <p className="text-xs text-slate-500">Students</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Shield size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-ink-900">{users.filter((u) => u.role === "admin").length}</p>
            <p className="text-xs text-slate-500">Admins</p>
          </div>
        </div>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9" placeholder="Search users by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={36} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No users found</p>
        </div>
      ) : (
        <div className="space-y-5">
          {admins.length > 0 && (
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Shield size={14} /> Admins
              </h2>
              <div className="space-y-2">
                {admins.map((u) => (
                  <UserRow key={u.id} user={u} currentUser={currentUser} onDelete={deleteUser} deleting={deleting} />
                ))}
              </div>
            </div>
          )}
          {students.length > 0 && (
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <GraduationCap size={14} /> Students ({students.length})
              </h2>
              <div className="space-y-2">
                {students.map((u) => (
                  <UserRow key={u.id} user={u} currentUser={currentUser} onDelete={deleteUser} deleting={deleting} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  currentUser,
  onDelete,
  deleting,
}: {
  user: AdminUser;
  currentUser: AuthUser | null;
  onDelete: (id: number) => void;
  deleting: number | null;
}) {
  const isMe = user.id === currentUser?.id;
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const date = user.created_at ? new Date(user.created_at).toLocaleDateString() : "—";

  return (
    <div className="card flex items-center gap-4 hover:border-surface-500 transition-all">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-display font-bold flex-shrink-0 text-white ${
          user.role === "admin" ? "bg-indigo-600" : "bg-indigo-500"
        }`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-ink-900 text-sm truncate">{user.name}</p>
          {isMe && <span className="badge text-xs bg-surface-600 text-slate-400">You</span>}
        </div>
        <p className="text-slate-500 text-xs truncate">{user.email}</p>
      </div>
      <div className="text-right hidden md:block">
        <p className="text-xs text-slate-500">Joined</p>
        <p className="text-xs text-slate-400">{date}</p>
      </div>
      <span className={user.role === "admin" ? "badge-purple" : "badge-blue"}>{user.role}</span>
      {!isMe && (
        <button
          onClick={() => onDelete(user.id)}
          disabled={deleting === user.id}
          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors flex-shrink-0"
        >
          {deleting === user.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      )}
    </div>
  );
}
