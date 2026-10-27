import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

// Anonymous-first sessions (SDR-002/R1): a signed cookie creates a subject; identity upgrades
// (Telegram, guardian) attach later and never gate the hero flow.
export const SESSION_COOKIE = "hk_session";
const MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

function secret(): Uint8Array {
  const s = env().SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not configured");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(subjectId: string, sessionId: string): Promise<string> {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subjectId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<{ subjectId: string; sessionId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.sid !== "string") return null;
    return { subjectId: payload.sub, sessionId: payload.sid };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: MAX_AGE_SECONDS };
}
