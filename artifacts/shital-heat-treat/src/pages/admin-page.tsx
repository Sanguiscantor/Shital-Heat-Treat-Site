import React from "react";
import { Redirect } from "wouter";
import { getSessionUser } from "@/lib/auth-session";
import { getAdminPanelScopes, getAdminTitle } from "@/lib/admin-access";

export default function AdminPage() {
  const user = getSessionUser();
  if (!user || user.role !== "admin") {
    return <Redirect to="/admin-login" />;
  }
  const scopes = getAdminPanelScopes(user);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto border border-[#1A202C] bg-[#0D111A] p-6">
        <h1 className="text-2xl font-bold">Admin Page</h1>
        <p className="text-sm text-gray-400 mt-1 mb-5">
          Signed in as {getAdminTitle(user)}. Modules shown based on role access.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scopes.includes("customerList") ? (
            <div className="border border-[#1A202C] bg-[#0A0D14] p-4">
              <h2 className="font-semibold">Customer List</h2>
              <p className="text-sm text-gray-400 mt-1">View and manage customer accounts.</p>
            </div>
          ) : null}
          {scopes.includes("supplierList") ? (
            <div className="border border-[#1A202C] bg-[#0A0D14] p-4">
              <h2 className="font-semibold">Supplier List</h2>
              <p className="text-sm text-gray-400 mt-1">Track supplier details and purchase records.</p>
            </div>
          ) : null}
          {scopes.includes("financialData") ? (
            <div className="border border-[#1A202C] bg-[#0A0D14] p-4">
              <h2 className="font-semibold">Financial Data</h2>
              <p className="text-sm text-gray-400 mt-1">Access revenue, cost, and margin reports.</p>
            </div>
          ) : null}
          {scopes.includes("productionHistory") ? (
            <div className="border border-[#1A202C] bg-[#0A0D14] p-4">
              <h2 className="font-semibold">Production History</h2>
              <p className="text-sm text-gray-400 mt-1">Review cycle logs and batch production records.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

