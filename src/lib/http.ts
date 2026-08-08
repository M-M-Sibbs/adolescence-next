import { NextResponse } from "next/server";
import { AuthError } from "./auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(detail: string, status = 400) {
  return NextResponse.json({ detail }, { status });
}

/** Wrap a route handler so thrown AuthErrors become proper HTTP responses. */
export function handleAuthError(e: unknown) {
  if (e instanceof AuthError) return error(e.message, e.status);
  const message = e instanceof Error ? e.message : "Internal server error";
  return error(message, 500);
}
