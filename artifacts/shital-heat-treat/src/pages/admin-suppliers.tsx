import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth-session";
import { getAdminPanelScopes } from "@/lib/admin-access";
import { loadWorkerRows } from "@/lib/worker-data";
import { exportCustomersToExcel } from "@/lib/excel-export";

const DEMO_CUSTOMERS = [
  {
    id: "placeholder-customer-1",
    name: "Acme Manufacturing Ltd.",
    email: "contact@acme-mfg.com",
    phone: "+1-555-0123",
    status: "Active",
  },
  {
    id: "placeholder-customer-2",
    name: "Pinnacle Tools International",
    email: "sales@pinnacle-tools.com",
    phone: "+1-555-0124",
    status: "Active",
  },
];

export default function AdminCustomersDetail() {
  const user = getSessionUser();
  const scopes = user ? getAdminPanelScopes(user) : [];
  const [rows] = useState(() => loadWorkerRows());

  // Calculate batch counts per customer
  const customerStats = useMemo(() => {
    const stats: Record<string, { totalBatches: number; inProcess: number; completed: number }> =
      {};
    DEMO_CUSTOMERS.forEach((customer) => {
      stats[customer.id] = { totalBatches: 0, inProcess: 0, completed: 0 };
    });
    rows.forEach((row) => {
      if (stats[row.customerId]) {
        stats[row.customerId].totalBatches++;
        if (row.currentStage === "dispatched") {
          stats[row.customerId].completed++;
        } else if (row.currentStage !== "received") {
          stats[row.customerId].inProcess++;
        }
      }
    });
    return stats;
  }, [rows]);

  if (!scopes.includes("customerList")) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-400">Access denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Vacuum Heat Treatment Customers</h1>
            <p className="text-sm text-gray-400 mt-1">
              Customer details, contact information, and treatment batch history.
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>

        <div className="border border-[#1A202C] bg-[#0D111A] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A202C] bg-[#0A0D14]">
                <th className="px-6 py-3 text-left text-sm font-semibold">Company Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Total Batches</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">In Process</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Completed</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_CUSTOMERS.map((customer) => {
                const stats = customerStats[customer.id];
                return (
                  <tr
                    key={customer.id}
                    className="border-b border-[#1A202C] hover:bg-[#0A0D14]/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold">
                      {stats.totalBatches}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-blue-300">
                      {stats.inProcess}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-green-300">
                      {stats.completed}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Vacuum Heat Treatment Process Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#1A202C] bg-[#0D111A] p-4 rounded">
              <h3 className="font-semibold text-blue-300 mb-2">Primary Services</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Vacuum Hardening & Tempering</li>
                <li>• Stress Relieving Treatment</li>
                <li>• Multi-Stage Heat Treatment</li>
                <li>• Specialized Material Processing</li>
              </ul>
            </div>
            <div className="border border-[#1A202C] bg-[#0D111A] p-4 rounded">
              <h3 className="font-semibold text-blue-300 mb-2">Common Materials Processed</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• H13, D2, M2, OHNS (Tool Steels)</li>
                <li>• Stainless Steel Alloys</li>
                <li>• High-Carbon Steels</li>
                <li>• Specialized Alloys</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
