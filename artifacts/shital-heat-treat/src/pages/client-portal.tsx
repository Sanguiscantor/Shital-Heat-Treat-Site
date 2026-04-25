import React from "react";
import { Redirect, useLocation } from "wouter";
import { useListWorkOrders } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { clearSession, getSessionUser } from "@/lib/auth-session";

export default function ClientPortal() {
  const user = getSessionUser();
  const [, navigate] = useLocation();
  const query = useListWorkOrders();
  const orders = query.data?.items ?? [];
  const currentOrders = orders.filter(
    (item) => item.status !== "completed" && item.status !== "dispatched",
  );
  const pastOrders = orders.filter(
    (item) => item.status === "completed" || item.status === "dispatched",
  );

  if (!user) {
    return <Redirect to="/login" />;
  }
  if (user.role !== "client") {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Client Portal</h1>
            <p className="text-sm text-gray-400 mt-1">
              Welcome, {user.fullName}. Live status for your in-process materials.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              clearSession();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </div>

        <h2 className="text-lg font-semibold mb-3">Current Orders</h2>
        <div className="border border-[#1A202C] bg-[#0D111A] overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead className="bg-[#121826]">
              <tr>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Process</th>
                <th className="text-left p-3">Qty</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Due</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((item) => (
                <tr key={item.id} className="border-t border-[#1A202C]">
                  <td className="p-3 font-medium">{item.orderCode}</td>
                  <td className="p-3">{item.processType}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3 uppercase tracking-wide">{item.status.replace("_", " ")}</td>
                  <td className="p-3">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              {!query.isLoading && currentOrders.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={5}>
                    No current orders right now.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {query.isLoading ? <p className="p-4 text-gray-400">Loading work orders...</p> : null}
        </div>

        <h2 className="text-lg font-semibold mb-3">Past Orders</h2>
        <div className="border border-[#1A202C] bg-[#0D111A] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#121826]">
              <tr>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Process</th>
                <th className="text-left p-3">Qty</th>
                <th className="text-left p-3">Final Status</th>
                <th className="text-left p-3">Due</th>
              </tr>
            </thead>
            <tbody>
              {pastOrders.map((item) => (
                <tr key={item.id} className="border-t border-[#1A202C]">
                  <td className="p-3 font-medium">{item.orderCode}</td>
                  <td className="p-3">{item.processType}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3 uppercase tracking-wide">{item.status.replace("_", " ")}</td>
                  <td className="p-3">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              {!query.isLoading && pastOrders.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-400" colSpan={5}>
                    No past orders found yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

