import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth-session";
import { getAdminPanelScopes } from "@/lib/admin-access";
import { exportFinancialToExcel } from "@/lib/excel-export";

const DEMO_FINANCIAL_DATA = [
  {
    period: "Q1 2026",
    revenue: "$245,000",
    costs: "$156,000",
    margin: "$89,000",
    marginPercent: "36.3%",
  },
  {
    period: "Q2 2026",
    revenue: "$268,500",
    costs: "$171,000",
    margin: "$97,500",
    marginPercent: "36.3%",
  },
  {
    period: "Q3 2026",
    revenue: "$312,000",
    costs: "$198,000",
    margin: "$114,000",
    marginPercent: "36.5%",
  },
  {
    period: "Q4 2026",
    revenue: "$289,000",
    costs: "$184,000",
    margin: "$105,000",
    marginPercent: "36.3%",
  },
];

export default function AdminFinancial() {
  const user = getSessionUser();
  const scopes = user ? getAdminPanelScopes(user) : [];

  if (!scopes.includes("financialData")) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-400">Access denied</p>
        </div>
      </div>
    );
  }

  const totalRevenue = DEMO_FINANCIAL_DATA.reduce(
    (sum, row) => sum + parseInt(row.revenue.replace(/[$,]/g, "")),
    0
  );
  const totalCosts = DEMO_FINANCIAL_DATA.reduce(
    (sum, row) => sum + parseInt(row.costs.replace(/[$,]/g, "")),
    0
  );
  const totalMargin = totalRevenue - totalCosts;

  const handleExport = () => {
    exportFinancialToExcel(DEMO_FINANCIAL_DATA);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Financial Data</h1>
            <p className="text-sm text-gray-400 mt-1">Revenue, cost, and margin reports.</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-[#1A202C] bg-[#0D111A] p-5 rounded-lg">
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold mt-2">
              ${(totalRevenue / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="border border-[#1A202C] bg-[#0D111A] p-5 rounded-lg">
            <p className="text-gray-400 text-sm">Total Costs</p>
            <p className="text-2xl font-bold mt-2">
              ${(totalCosts / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="border border-[#1A202C] bg-[#0D111A] p-5 rounded-lg">
            <p className="text-gray-400 text-sm">Total Margin</p>
            <p className="text-2xl font-bold text-green-400 mt-2">
              ${(totalMargin / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        <div className="border border-[#1A202C] bg-[#0D111A] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A202C] bg-[#0A0D14]">
                <th className="px-6 py-3 text-left text-sm font-semibold">Period</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Revenue</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Costs</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Margin</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_FINANCIAL_DATA.map((row) => (
                <tr
                  key={row.period}
                  className="border-b border-[#1A202C] hover:bg-[#0A0D14]/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium">{row.period}</td>
                  <td className="px-6 py-4 text-sm text-right">{row.revenue}</td>
                  <td className="px-6 py-4 text-sm text-right">{row.costs}</td>
                  <td className="px-6 py-4 text-sm text-right text-green-400">{row.margin}</td>
                  <td className="px-6 py-4 text-sm text-right text-green-400">{row.marginPercent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
