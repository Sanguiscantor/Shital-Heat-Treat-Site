import React, { useEffect, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { getSessionUser } from "@/lib/auth-session";
import { getAdminPanelScopes, getAdminTitle } from "@/lib/admin-access";

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function AdminPage() {
  const user = getSessionUser();
  const [, navigate] = useLocation();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
  }, []);

  if (!user || user.role !== "admin") {
    return <Redirect to="/admin-login" />;
  }
  const scopes = getAdminPanelScopes(user);

  const moduleConfig = [
    {
      id: "customerList",
      title: "Customer List",
      description: "View and manage customer accounts.",
      path: "/admin/customers",
    },
    {
      id: "supplierList",
      title: "Supplier List",
      description: "Track supplier details and purchase records.",
      path: "/admin/suppliers",
    },
    {
      id: "financialData",
      title: "Financial Data",
      description: "Access revenue, cost, and margin reports.",
      path: "/admin/financial",
    },
    {
      id: "productionHistory",
      title: "Production History",
      description: "Review cycle logs and batch production records.",
      path: "/admin/production",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto border border-[#1A202C] bg-[#0D111A] p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {greeting}, {user.fullName}
          </h1>
          <p className="text-sm text-gray-400 mt-3">
            Role: <span className="text-gray-200">{getAdminTitle(user)}</span>
          </p>
        </div>

        <div className="border-t border-[#1A202C] pt-6">
          <h2 className="text-lg font-semibold mb-4">Available Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moduleConfig.map((module) =>
              scopes.includes(module.id as any) ? (
                <button
                  key={module.id}
                  onClick={() => navigate(module.path)}
                  className="border border-[#1A202C] bg-[#0A0D14] p-4 hover:bg-[#16192A] hover:border-[#2A3344] transition-all cursor-pointer text-left"
                >
                  <h3 className="font-semibold text-gray-100">{module.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                </button>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

