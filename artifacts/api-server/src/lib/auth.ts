import crypto from "node:crypto";
import type { Request } from "express";
import type { userRoleEnum } from "@workspace/db/schema";

type UserRole = (typeof userRoleEnum.enumValues)[number];

export type AuthPayload = {
  sub: string;
  role: UserRole;
  customerId: string | null;
  email: string;
  exp: number;
};

const AUTH_SECRET = process.env["AUTH_SECRET"] ?? "change-me-in-production";
const AUTH_TTL_SECONDS = Number(process.env["AUTH_TTL_SECONDS"] ?? 60 * 60 * 12);

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, digest] = passwordHash.split(":");
  if (!salt || !digest) {
    return false;
  }
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(candidate, "hex"));
}

export function signAuthToken(payload: Omit<AuthPayload, "exp">): string {
  const fullPayload: AuthPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + AUTH_TTL_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string): AuthPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }
  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as AuthPayload;
  if (parsed.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return parsed;
}

export function extractAuthToken(req: Request): string | null {
  const authHeader = req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  if (typeof req.cookies?.session_token === "string" && req.cookies.session_token.length > 0) {
    return req.cookies.session_token;
  }
  return null;
}

