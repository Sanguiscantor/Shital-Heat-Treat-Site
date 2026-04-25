import type { User } from "@workspace/api-client-react";

export type AdminPanelScope =
  | "customerList"
  | "supplierList"
  | "financialData"
  | "productionHistory";

const ADMIN_SCOPE_BY_EMAIL: Record<string, AdminPanelScope[]> = {
  "website.admin@demo.com": [
    "customerList",
    "supplierList",
    "financialData",
    "productionHistory",
  ],
  "director@demo.com": ["financialData", "productionHistory"],
  "finance.advisor@demo.com": ["financialData"],
  "production.head@demo.com": ["productionHistory"],
};

const ADMIN_TITLE_BY_EMAIL: Record<string, string> = {
  "website.admin@demo.com": "Website Admin",
  "director@demo.com": "Director",
  "finance.advisor@demo.com": "Financial Advisor",
  "production.head@demo.com": "Production Head",
};

export function getAdminPanelScopes(user: User): AdminPanelScope[] {
  return ADMIN_SCOPE_BY_EMAIL[user.email.toLowerCase()] ?? [];
}

export function getAdminTitle(user: User): string {
  return ADMIN_TITLE_BY_EMAIL[user.email.toLowerCase()] ?? "Admin";
}
