import type { User } from "@workspace/api-client-react";

type LoginKind = "client" | "worker" | "admin";

type PlaceholderAuthConfig = {
  email: string;
  password: string;
  role: User["role"];
  name: string;
};

const configs: Record<LoginKind, PlaceholderAuthConfig> = {
  client: {
    email: import.meta.env.VITE_PLACEHOLDER_CLIENT_EMAIL ?? "client@demo.com",
    password: import.meta.env.VITE_PLACEHOLDER_CLIENT_PASSWORD ?? "demo1234",
    role: "client",
    name: "Demo Client",
  },
  worker: {
    email: import.meta.env.VITE_PLACEHOLDER_WORKER_EMAIL ?? "worker@demo.com",
    password: import.meta.env.VITE_PLACEHOLDER_WORKER_PASSWORD ?? "worker1234",
    role: "operator",
    name: "Worker Station",
  },
  admin: {
    email: import.meta.env.VITE_PLACEHOLDER_ADMIN_EMAIL ?? "admin@demo.com",
    password: import.meta.env.VITE_PLACEHOLDER_ADMIN_PASSWORD ?? "admin1234",
    role: "admin",
    name: "Demo Admin",
  },
};

export function getPlaceholderCredentials(kind: LoginKind) {
  return {
    email: configs[kind].email,
    password: configs[kind].password,
  };
}

export function tryPlaceholderLogin(
  kind: LoginKind,
  email: string,
  password: string,
): { token: string; user: User } | null {
  const config = configs[kind];
  if (email.trim().toLowerCase() !== config.email.toLowerCase()) {
    return null;
  }
  if (password !== config.password) {
    return null;
  }
  return {
    token: `placeholder-${kind}-token`,
    user: {
      id: `placeholder-${kind}-id`,
      email: config.email,
      fullName: config.name,
      role: config.role,
      customerId: config.role === "client" ? "placeholder-customer" : null,
    },
  };
}

