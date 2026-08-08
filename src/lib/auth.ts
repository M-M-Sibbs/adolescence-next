import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-key-change-in-production"
);
const EXPIRES = "1d"; // matches ACCESS_TOKEN_EXPIRE_MINUTES = 1440

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function createAccessToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const sub = payload.sub;
    if (!sub) return null;
    return parseInt(String(sub), 10);
  } catch {
    return null;
  }
}

/** Extract the bearer token from an Authorization header. */
function getBearer(req: NextRequest): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

/** Returns the authenticated user or null. Use in every protected route. */
export async function getCurrentUser(req: NextRequest): Promise<User | null> {
  const token = getBearer(req);
  if (!token) return null;
  const userId = await verifyToken(token);
  if (userId === null) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ?? null;
}

/** Convenience wrappers that throw a typed result the routes can turn into responses. */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireUser(req: NextRequest): Promise<User> {
  const user = await getCurrentUser(req);
  if (!user) throw new AuthError("Could not validate credentials", 401);
  return user;
}

export async function requireAdmin(req: NextRequest): Promise<User> {
  const user = await requireUser(req);
  if (user.role !== "admin") throw new AuthError("Admin access required", 403);
  return user;
}
