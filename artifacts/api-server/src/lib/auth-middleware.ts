import type { NextFunction, Request, Response } from "express";
import { extractAuthToken, verifyAuthToken } from "./auth";

declare global {
  namespace Express {
    interface Request {
      auth?: ReturnType<typeof verifyAuthToken>;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractAuthToken(req);
  if (!token) {
    res.status(401).json({ message: "Missing auth token." });
    return;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({ message: "Invalid auth token." });
    return;
  }

  req.auth = payload;
  next();
}

export function requireRoles(...roles: Array<"admin" | "operator" | "viewer" | "client">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ message: "Insufficient permissions." });
      return;
    }
    next();
  };
}

