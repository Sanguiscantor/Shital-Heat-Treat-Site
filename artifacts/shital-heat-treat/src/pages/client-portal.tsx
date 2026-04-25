import React from "react";
import { Redirect, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { clearSession, getSessionUser } from "@/lib/auth-session";
import {
  getStageIndex,
  loadWorkerRows,
} from "@/lib/worker-data";

export default function ClientPortal() {
  const user = getSessionUser();
  const [, navigate] = useLocation();
  const rows = loadWorkerRows();

  if (!user) {
    return <Redirect to="/login" />;
  }
  if (user.role !== "client") {
    return <Redirect to="/" />;
  }

  const customerRows = rows.filter((row) => row.customerId === user.customerId);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Client Portal</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome, {user.fullName}. Read-only job view.</p>
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

        <h2 className="text-lg font-semibold mb-3">Your Jobs (Read-only)</h2>
        <div className="space-y-4">
          {customerRows.map((job) => {
            const currentStageIndex = getStageIndex(job.currentStage);
            const hardeningDone =
              job.hardening || currentStageIndex >= getStageIndex("quenching");
            return (
              <article key={job.id} className="border border-[#1A202C] bg-[#0D111A] p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{job.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{job.jobType}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.treatmentType} | {job.materialClass}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-400">Dispatch Status</p>
                    <p className="font-medium text-[#F39200]">
                      {job.dispatched ? "Dispatched" : job.readyForDispatch ? "Ready for Dispatch" : "In Process"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
                  <div className="border border-[#1A202C] p-2">
                    <p className="text-gray-400">Stress Relieving</p>
                    <p>{job.stressRelieving ? "Done" : "Not Done"}</p>
                  </div>
                  <div className="border border-[#1A202C] p-2">
                    <p className="text-gray-400">Hardening (Heating + Soaking + Quenching)</p>
                    <p>{hardeningDone ? "Done" : "Not Done"}</p>
                  </div>
                  <div className="border border-[#1A202C] p-2">
                    <p className="text-gray-400">Tempering Cycles</p>
                    <p>{job.tempering}</p>
                  </div>
                  <div className="border border-[#1A202C] p-2">
                    <p className="text-gray-400">Remarks</p>
                    <p>{job.remarks || "-"}</p>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-400">
                  Last update:{" "}
                  {job.stageHistory[job.stageHistory.length - 1]?.timestamp
                    ? new Date(job.stageHistory[job.stageHistory.length - 1].timestamp).toLocaleString()
                    : "-"}
                </div>
              </article>
            );
          })}
          {customerRows.length === 0 ? (
            <div className="border border-[#1A202C] bg-[#0D111A] p-4 text-gray-400">
              No job data available for your account yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
