import type { User } from "@workspace/api-client-react";

type LoginKind = "client" | "worker" | "admin";

export type PlaceholderAuthConfig = {
  email: string;
  password: string;
  role: User["role"];
  name: string;
  customerId?: string | null;
};

const configs: Record<LoginKind, PlaceholderAuthConfig[]> = {
  client: [
    {
      email: import.meta.env.VITE_PLACEHOLDER_CLIENT_EMAIL_1 ?? "client.one@demo.com",
      password: import.meta.env.VITE_PLACEHOLDER_CLIENT_PASSWORD_1 ?? "client1234",
      role: "client",
      name: "Demo Client One",
      customerId: "placeholder-customer-1",
    },
    {
      email: import.meta.env.VITE_PLACEHOLDER_CLIENT_EMAIL_2 ?? "client.two@demo.com",
      password: import.meta.env.VITE_PLACEHOLDER_CLIENT_PASSWORD_2 ?? "client1234",
      role: "client",
      name: "Demo Client Two",
      customerId: "placeholder-customer-2",
    },
  ],
  worker: [
    {
      email: import.meta.env.VITE_PLACEHOLDER_WORKER_EMAIL ?? "worker@demo.com",
      password: import.meta.env.VITE_PLACEHOLDER_WORKER_PASSWORD ?? "worker1234",
      role: "operator",
      name: "Worker Station",
    },
  ],
  admin: [
    {
      email: import.meta.env.VITE_PLACEHOLDER_ADMIN_WEBSITE_EMAIL ?? "website.admin@demo.com",
      password: import.meta.env.VITE_PLACEHOLDER_ADMIN_WEBSITE_PASSWORD ?? "admin1234",
      role: "admin",
      name: "Website Admin",
    },
    {
      email: import.meta.env.VITE_PLACEHOLDER_ADMIN_DIRECTOR_EMAIL ?? "director@demo.com",
      password: import.meta.env.VITE_PLACEHOLDER_ADMIN_DIRECTOR_PASSWORD ?? "director1234",
      role: "admin",
      name: "Director",
    },
    {
      email: import.meta.env.VITE_PLACEHOLDER_ADMIN_MARKETING_EMAIL ?? "marketing@demo.com",
      password: import.meta.env.VITE_PLACEHOLDER_ADMIN_MARKETING_PASSWORD ?? "marketing1234",
      role: "admin",
      name: "Marketing Manager",
    },
    {
      email: import.meta.env.VITE_PLACEHOLDER_ADMIN_PRODUCTION_EMAIL ?? "production.head@demo.com",
      password: import.meta.env.VITE_PLACEHOLDER_ADMIN_PRODUCTION_PASSWORD ?? "production1234",
      role: "admin",
      name: "Production Head",
    },
  ],
};

export function getPlaceholderCredentials(kind: LoginKind) {
  const [first] = configs[kind];
  return {
    email: first.email,
    password: first.password,
  };
}

export function getPlaceholderCredentialList(kind: LoginKind) {
  return configs[kind].map((config) => ({
    email: config.email,
    password: config.password,
    name: config.name,
  }));
}

export function tryPlaceholderLogin(
  kind: LoginKind,
  email: string,
  password: string,
): { token: string; user: User } | null {
  const config = configs[kind].find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
  );
  if (!config) {
    return null;
  }
  return {
    token: `placeholder-${kind}-${config.email.toLowerCase()}-token`,
    user: {
      id: `placeholder-${kind}-${config.email.toLowerCase()}-id`,
      email: config.email,
      fullName: config.name,
      role: config.role,
      customerId: config.role === "client" ? config.customerId ?? null : null,
    },
  };
}

