import React, { useMemo, useState } from "react";
import { Redirect } from "wouter";
import { getSessionUser } from "@/lib/auth-session";

type InspectionState = "ok" | "not_ok";
type TemperingLevel = "1" | "2" | "3" | "4";

type WorkerRow = {
  id: string;
  name: string;
  jobType: string;
  treatmentType: string;
  materialClass: string;
  inspection: InspectionState;
  stressRelieving: boolean;
  hardening: boolean;
  tempering: TemperingLevel;
  finalInspection: InspectionState;
  readyForDispatch: boolean;
  dispatched: boolean;
};

const PLACEHOLDER_ROWS: WorkerRow[] = [
  {
    id: "HT-2401",
    name: "Acme Gears / HT-2401",
    jobType: "Gear Hardening Batch",
    treatmentType: "Vacuum Hardening + Tempering",
    materialClass: "20MnCr5",
    inspection: "ok",
    stressRelieving: true,
    hardening: true,
    tempering: "2",
    finalInspection: "not_ok",
    readyForDispatch: false,
    dispatched: false,
  },
  {
    id: "HT-2402",
    name: "Pinnacle Tools / HT-2402",
    jobType: "Die Treatment",
    treatmentType: "Stress Relieving + Hardening",
    materialClass: "H13",
    inspection: "ok",
    stressRelieving: true,
    hardening: false,
    tempering: "1",
    finalInspection: "ok",
    readyForDispatch: false,
    dispatched: false,
  },
  {
    id: "HT-2403",
    name: "Orbit Components / HT-2403",
    jobType: "Shaft Nitriding Support",
    treatmentType: "Hardening + Multi Temper",
    materialClass: "SS Alloy",
    inspection: "ok",
    stressRelieving: false,
    hardening: true,
    tempering: "3",
    finalInspection: "ok",
    readyForDispatch: true,
    dispatched: true,
  },
];

function Tick({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center border ${
        checked
          ? "bg-[#F39200]/20 border-[#F39200] text-[#F39200]"
          : "bg-transparent border-[#2B3342] text-gray-500"
      }`}
    >
      {checked ? "✓" : ""}
    </span>
  );
}

export default function WorkerPage() {
  const user = getSessionUser();
  if (!user || (user.role !== "operator" && user.role !== "admin")) {
    return <Redirect to="/worker-login" />;
  }

  const [rows, setRows] = useState<WorkerRow[]>(PLACEHOLDER_ROWS);

  const updateRow = <K extends keyof WorkerRow>(
    rowId: string,
    field: K,
    value: WorkerRow[K],
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  };

  const summary = useMemo(() => {
    const total = rows.length;
    const inProcess = rows.filter((row) => row.hardening || row.stressRelieving).length;
    const dispatchReady = rows.filter((row) => row.readyForDispatch).length;
    const dispatched = rows.filter((row) => row.dispatched).length;
    return { total, inProcess, dispatchReady, dispatched };
  }, [rows]);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold">Worker Page</h1>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          Hidden internal single-station board (placeholder checklist for now).
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="border border-[#1A202C] bg-[#0D111A] p-3 text-sm">
            <p className="text-gray-400">Total jobs</p>
            <p className="text-xl font-semibold">{summary.total}</p>
          </div>
          <div className="border border-[#1A202C] bg-[#0D111A] p-3 text-sm">
            <p className="text-gray-400">In process</p>
            <p className="text-xl font-semibold">{summary.inProcess}</p>
          </div>
          <div className="border border-[#1A202C] bg-[#0D111A] p-3 text-sm">
            <p className="text-gray-400">Ready dispatch</p>
            <p className="text-xl font-semibold">{summary.dispatchReady}</p>
          </div>
          <div className="border border-[#1A202C] bg-[#0D111A] p-3 text-sm">
            <p className="text-gray-400">Dispatched</p>
            <p className="text-xl font-semibold">{summary.dispatched}</p>
          </div>
        </div>

        <div className="border border-[#1A202C] bg-[#0D111A] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#121826]">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Inspection</th>
                <th className="text-left p-3">Stress Relieving</th>
                <th className="text-left p-3">Hardening</th>
                <th className="text-left p-3">Tempering</th>
                <th className="text-left p-3">Final Inspection</th>
                <th className="text-left p-3">Ready for dispatch</th>
                <th className="text-left p-3">Dispatched</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-t border-[#1A202C]">
                  <td className="p-3">
                    <div className="space-y-2 min-w-[320px]">
                      <input
                        className="w-full h-8 bg-[#0A0D14] border border-[#1A202C] px-2 text-sm"
                        value={row.name}
                        onChange={(event) => updateRow(row.id, "name", event.target.value)}
                      />
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          className="w-full h-8 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                          value={row.jobType}
                          onChange={(event) => updateRow(row.id, "jobType", event.target.value)}
                          placeholder="Job type"
                        />
                        <input
                          className="w-full h-8 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                          value={row.treatmentType}
                          onChange={(event) =>
                            updateRow(row.id, "treatmentType", event.target.value)
                          }
                          placeholder="Treatment type"
                        />
                        <input
                          className="w-full h-8 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                          value={row.materialClass}
                          onChange={(event) =>
                            updateRow(row.id, "materialClass", event.target.value)
                          }
                          placeholder="Material class"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      className="h-9 bg-[#0A0D14] border border-[#1A202C] px-2 min-w-[90px]"
                      value={row.inspection}
                      onChange={(event) =>
                        updateRow(row.id, "inspection", event.target.value as InspectionState)
                      }
                    >
                      <option value="ok">OK</option>
                      <option value="not_ok">Not OK</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={row.stressRelieving}
                        onChange={(event) =>
                          updateRow(row.id, "stressRelieving", event.target.checked)
                        }
                      />
                      <Tick checked={row.stressRelieving} />
                    </label>
                  </td>
                  <td className="p-3">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={row.hardening}
                        onChange={(event) => updateRow(row.id, "hardening", event.target.checked)}
                      />
                      <Tick checked={row.hardening} />
                    </label>
                  </td>
                  <td className="p-3">
                    <select
                      className="h-9 bg-[#0A0D14] border border-[#1A202C] px-2 min-w-[80px]"
                      value={row.tempering}
                      onChange={(event) =>
                        updateRow(row.id, "tempering", event.target.value as TemperingLevel)
                      }
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      className="h-9 bg-[#0A0D14] border border-[#1A202C] px-2 min-w-[90px]"
                      value={row.finalInspection}
                      onChange={(event) =>
                        updateRow(row.id, "finalInspection", event.target.value as InspectionState)
                      }
                    >
                      <option value="ok">OK</option>
                      <option value="not_ok">Not OK</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={row.readyForDispatch}
                        onChange={(event) =>
                          updateRow(row.id, "readyForDispatch", event.target.checked)
                        }
                      />
                      <Tick checked={row.readyForDispatch} />
                    </label>
                  </td>
                  <td className="p-3">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={row.dispatched}
                        onChange={(event) => updateRow(row.id, "dispatched", event.target.checked)}
                      />
                      <Tick checked={row.dispatched} />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

