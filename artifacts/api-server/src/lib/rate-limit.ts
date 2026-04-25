import type { NextFunction, Request, Response } from "express";

const WINDOW_MS = Number(process.env["RATE_LIMIT_WINDOW_MS"] ?? 60_000);
const MAX_REQUESTS = Number(process.env["RATE_LIMIT_MAX"] ?? 180);

const visits = new Map<string, { count: number; windowStart: number }>();

export function basicRateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip ?? "unknown";
  const entry = visits.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    visits.set(key, { count: 1, windowStart: now });
    next();
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    res.status(429).json({ message: "Too many requests. Please retry shortly." });
    return;
  }

  entry.count += 1;
  next();
}

