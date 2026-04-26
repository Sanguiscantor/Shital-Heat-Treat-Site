import React, { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth-session";
import { getAdminPanelScopes } from "@/lib/admin-access";
import { loadWorkerRows } from "@/lib/worker-data";
import { exportCustomersToExcel } from "@/lib/excel-export";

const DEMO_CUSTOMERS = [
  {
    id: "placeholder-customer-1",
    name: "Demo Client One",
    email: "client.one@demo.com",
    status: "Active",
    jobs: 5,
    phone: "+1-555-0200",
  },
  {
    id: "placeholder-customer-2",
    name: "Demo Client Two",
    email: "client.two@demo.com",
    status: "Active",
    jobs: 3,
    phone: "+1-555-0201",
  },
];

export default function AdminCustomers() {
  const user = getSessionUser();
  const scopes = user ? getAdminPanelScopes(user) : [];
  const [rows] = React.useState(() => loadWorkerRows());

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

  const handleExport = () => {
    const exportData = DEMO_CUSTOMERS.map((customer) => ({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      totalBatches: customerStats[customer.id]?.totalBatches ?? 0,
      inProcess: customerStats[customer.id]?.inProcess ?? 0,
      completed: customerStats[customer.id]?.completed ?? 0,
    }));
    exportCustomersToExcel(exportData);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Customer List</h1>
            <p className="text-sm text-gray-400 mt-1">Manage customer accounts and information.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
              📥 Export to Excel
            </Button>
            <Link href="/admin">
              <Button variant="outline">Back to Admin</Button>
            </Link>
          </div>
        </div>

        <div className="border border-[#1A202C] bg-[#0D111A] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A202C] bg-[#0A0D14]">
                <th className="px-6 py-3 text-left text-sm font-semibold">Customer Name</th>
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
                      {stats?.totalBatches ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-blue-300">
                      {stats?.inProcess ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-green-300">
                      {stats?.completed ?? 0}
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
      </div>
    </div>
  );
}
