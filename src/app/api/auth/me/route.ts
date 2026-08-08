import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { json, error } from "@/lib/http";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return error("Could not validate credentials", 401);
  return json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
