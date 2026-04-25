import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, users } from "@workspace/db";
import { hashPassword, signAuthToken, verifyPassword } from "../lib/auth";
import { requireAuth, requireRoles } from "../lib/auth-middleware";

const router: IRouter = Router();

router.post("/auth/bootstrap-admin", async (req, res) => {
  const { email, password, fullName } = req.body as {
    email?: string;
    password?: string;
    fullName?: string;
  };
  if (!email || !password || !fullName) {
    res.status(400).json({ message: "email, password, and fullName are required." });
    return;
  }

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.role, "admin"),
  });
  if (existingAdmin) {
    res.status(409).json({ message: "Admin already exists." });
    return;
  }

  const [created] = await db
    .insert(users)
    .values({
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      role: "admin",
      passwordHash: hashPassword(password),
    })
    .returning();

  res.status(201).json({
    id: created.id,
    email: created.email,
    role: created.role,
  });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ message: "email and password are required." });
    return;
  }
  const normalizedEmail = email.toLowerCase().trim();

  const user = await db.query.users.findFirst({
    where: and(eq(users.email, normalizedEmail), eq(users.isActive, true)),
  });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  const token = signAuthToken({
    sub: user.id,
    role: user.role,
    customerId: user.customerId,
    email: user.email,
  });

  res.cookie("session_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: 1000 * 60 * 60 * 12,
  });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      customerId: user.customerId,
    },
  });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("session_token");
  res.status(204).send();
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.auth!.sub),
  });
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    customerId: user.customerId,
  });
});

router.post("/auth/register-worker", requireAuth, requireRoles("admin"), async (req, res) => {
  const { email, password, fullName, role } = req.body as {
    email?: string;
    password?: string;
    fullName?: string;
    role?: "operator" | "viewer" | "admin";
  };
  if (!email || !password || !fullName || !role) {
    res.status(400).json({ message: "email, password, fullName, role are required." });
    return;
  }

  const [created] = await db
    .insert(users)
    .values({
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      role,
      passwordHash: hashPassword(password),
    })
    .onConflictDoNothing()
    .returning();

  if (!created) {
    res.status(409).json({ message: "User already exists." });
    return;
  }

  res.status(201).json({
    id: created.id,
    email: created.email,
    fullName: created.fullName,
    role: created.role,
  });
});

export default router;

