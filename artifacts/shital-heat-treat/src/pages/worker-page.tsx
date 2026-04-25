import React, { useEffect, useMemo, useRef, useState } from "react";
import { Redirect } from "wouter";
import { getSessionUser } from "@/lib/auth-session";
import {
  HEAT_STAGE_LABELS,
  HeatStage,
  InspectionState,
  TemperingLevel,
  WorkerRow,
  loadArchivedWorkerRows,
  loadClientNotificationEvents,
  getStageIndex,
  loadWorkerRows,
  saveArchivedWorkerRows,
  saveClientNotificationEvents,
  saveWorkerRows,
} from "@/lib/worker-data";

const MATERIAL_OPTIONS = [
  "Stavax",
  "H13",
  "D2",
  "M2",
  "OHNS",
];
const CLIENT_OPTIONS = [
  { id: "placeholder-customer-1", name: "Demo Client One" },
  { id: "placeholder-customer-2", name: "Demo Client Two" },
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

  const [rows, setRows] = useState<WorkerRow[]>(() => loadWorkerRows());
  const [archivedRows, setArchivedRows] = useState<WorkerRow[]>(() => loadArchivedWorkerRows());
  const [notificationEvents, setNotificationEvents] = useState(() =>
    loadClientNotificationEvents(),
  );
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const rowsRef = useRef(rows);
  const archivedRowsRef = useRef(archivedRows);
  const notificationEventsRef = useRef(notificationEvents);
  const unsavedRef = useRef(hasUnsavedChanges);

  useEffect(() => {
    rowsRef.current = rows;
    archivedRowsRef.current = archivedRows;
    notificationEventsRef.current = notificationEvents;
    unsavedRef.current = hasUnsavedChanges;
  }, [rows, archivedRows, notificationEvents, hasUnsavedChanges]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (unsavedRef.current) {
        saveWorkerRows(rowsRef.current);
        saveArchivedWorkerRows(archivedRowsRef.current);
        saveClientNotificationEvents(notificationEventsRef.current);
        setHasUnsavedChanges(false);
      }
    }, 120000);

    const onBeforeUnload = () => {
      if (unsavedRef.current) {
        saveWorkerRows(rowsRef.current);
        saveArchivedWorkerRows(archivedRowsRef.current);
        saveClientNotificationEvents(notificationEventsRef.current);
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  type WorkerStageChoice = "received" | "in_process" | "ready_for_dispatch" | "dispatched";
  const WORKER_STAGE_OPTIONS: Array<{ value: WorkerStageChoice; label: string }> = [
    { value: "received", label: "Recieved" },
    { value: "in_process", label: "In Process" },
    { value: "ready_for_dispatch", label: "Ready for Dispatch" },
    { value: "dispatched", label: "Dispatched" },
  ];

  const toChoice = (stage: HeatStage): WorkerStageChoice => {
    if (stage === "received" || stage === "inspection") return "received";
    if (stage === "ready_for_dispatch") return "ready_for_dispatch";
    if (stage === "dispatched") return "dispatched";
    return "in_process";
  };

  const fromChoice = (choice: WorkerStageChoice): HeatStage => {
    if (choice === "received") return "received";
    if (choice === "in_process") return "heating";
    if (choice === "ready_for_dispatch") return "ready_for_dispatch";
    return "dispatched";
  };

  const updateRow = <K extends keyof WorkerRow>(
    rowId: string,
    field: K,
    value: WorkerRow[K],
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
    setHasUnsavedChanges(true);
  };

  const updateStage = (rowId: string, nextChoice: WorkerStageChoice) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        const nextStage = fromChoice(nextChoice);
        if (row.id !== rowId || row.currentStage === nextStage) {
          return row;
        }
        const note = stageNotes[row.id]?.trim();
        const nextHistory = [
          ...row.stageHistory,
          {
            stage: nextStage,
            timestamp: new Date().toISOString(),
            note: note || undefined,
            updatedBy: user.fullName,
          },
        ];
        return {
          ...row,
          currentStage: nextStage,
          stageHistory: nextHistory,
          readyForDispatch: nextStage === "ready_for_dispatch" || nextStage === "dispatched",
          dispatched: nextStage === "dispatched",
        };
      }),
    );
    setStageNotes((current) => ({ ...current, [rowId]: "" }));
    setHasUnsavedChanges(true);
  };

  const summary = useMemo(() => {
    const total = rows.length;
    const inProcess = rows.filter((row) => toChoice(row.currentStage) === "in_process").length;
    const dispatchReady = rows.filter(
      (row) => toChoice(row.currentStage) === "ready_for_dispatch",
    ).length;
    const dispatched = rows.filter((row) => row.dispatched).length;
    return { total, inProcess, dispatchReady, dispatched };
  }, [rows]);

  const setInitialInspection = (rowId: string, inspection: InspectionState) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) return row;
        if (inspection === "not_ok") {
          return {
            ...row,
            inspection: "not_ok",
            stressRelieving: false,
            hardening: false,
            tempering: "0",
            finalInspection: "not_ok",
            currentStage: "final_inspection",
            readyForDispatch: false,
            dispatched: false,
            stageHistory: [
              ...row.stageHistory,
              {
                stage: "final_inspection",
                timestamp: new Date().toISOString(),
                note: "Initial inspection failed. Moved to final inspection for remarks.",
                updatedBy: user.fullName,
              },
            ],
          };
        }
        return {
          ...row,
          inspection: "ok",
        };
      }),
    );
    setHasUnsavedChanges(true);
  };

  const submitRow = (rowId: string) => {
    const submitTime = new Date().toISOString();
    const sourceRow = rows.find((row) => row.id === rowId);
    if (!sourceRow) return;

    const note =
      sourceRow.finalInspection === "not_ok" ? sourceRow.remarks.trim() : "Job completed OK";
    const submitted: WorkerRow = {
      ...sourceRow,
      stageHistory: [
        ...sourceRow.stageHistory,
        {
          stage: sourceRow.currentStage,
          timestamp: submitTime,
          note,
          updatedBy: user.fullName,
        },
      ],
    };

    setRows((currentRows) =>
      currentRows
        .filter((row) => row.id !== rowId)
        .concat(submitted.currentStage === "dispatched" ? [] : [submitted]),
    );

    setNotificationEvents((current) => [
      {
        id: `notif-${submitted.id}-${Date.now()}`,
        customerId: submitted.customerId,
        jobId: submitted.id,
        title: "Job status updated",
        message: `${submitted.name}: ${HEAT_STAGE_LABELS[submitted.currentStage]}`,
        createdAt: submitTime,
        stage: submitted.currentStage,
      },
      ...current,
    ]);

    if (submitted.currentStage === "dispatched") {
      setArchivedRows((current) => [submitted, ...current]);
    }
    setHasUnsavedChanges(true);
  };

  const addNewJob = () => {
    const newId = `HT-${Date.now().toString().slice(-6)}`;
    const newRow: WorkerRow = {
      id: newId,
      customerId: "placeholder-customer-1",
      customerName: "Demo Client One",
      name: "Customer Name / Batch No.",
      jobType: "",
      treatmentType: "",
      materialClass: "",
      currentStage: "received",
      stageHistory: [{ stage: "received", timestamp: new Date().toISOString(), updatedBy: user.fullName }],
      inspection: "ok",
      stressRelieving: false,
      hardening: false,
      tempering: "2",
      finalInspection: "ok",
      remarks: "",
      readyForDispatch: false,
      dispatched: false,
    };
    setRows((current) => [newRow, ...current]);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold">Worker Page</h1>
        <p className="text-sm text-gray-400 mt-1 mb-6">
          Factory-floor tracker with live heat-treatment stage progression.
        </p>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            className="h-10 px-4 border border-[#1A202C] bg-[#111827] text-white"
            onClick={addNewJob}
          >
            Add New Job
          </button>
          <p className="text-xs text-gray-400">
            Archived dispatched jobs: <span className="text-white">{archivedRows.length}</span>
          </p>
        </div>
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

        <div className="border border-[#1A202C] bg-[#0D111A]">
          <table className="w-full text-xs md:text-sm table-fixed">
            <thead className="bg-[#121826]">
              <tr>
                <th className="text-left p-2 md:p-3 w-[32%]">Details</th>
                <th className="text-left p-2 md:p-3 w-[8%]">Initial Insp.</th>
                <th className="text-left p-2 md:p-3 w-[7%]">Stress</th>
                <th className="text-left p-2 md:p-3 w-[7%]">Hardening</th>
                <th className="text-left p-2 md:p-3 w-[7%]">Temper</th>
                <th className="text-left p-2 md:p-3 w-[8%]">Final Insp.</th>
                <th className="text-left p-2 md:p-3 w-[10%]">Stage</th>
                <th className="text-left p-2 md:p-3 w-[13%]">Remarks / Note</th>
                <th className="text-left p-2 md:p-3 w-[8%]">Submit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#1A202C]">
                  {(() => {
                    const missingRemarksForNotOk =
                      row.finalInspection === "not_ok" && row.remarks.trim().length === 0;
                    const submitEnabled =
                      row.finalInspection === "ok" ||
                      (row.finalInspection === "not_ok" && row.remarks.trim().length > 0);
                    return (
                      <>
                  <td className="p-2 md:p-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-gray-400">Customer Name / Batch No.</label>
                      <input
                        className="w-full h-8 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                        value={row.name}
                        onChange={(event) => updateRow(row.id, "name", event.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-1">
                        <label className="text-[11px] text-gray-400">
                          Job Type
                          <input
                            className="w-full h-8 mt-1 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                            value={row.jobType}
                            onChange={(event) => updateRow(row.id, "jobType", event.target.value)}
                            placeholder="Job type"
                          />
                        </label>
                        <label className="text-[11px] text-gray-400">
                          Treatment Type
                          <input
                            className="w-full h-8 mt-1 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                            value={row.treatmentType}
                            onChange={(event) =>
                              updateRow(row.id, "treatmentType", event.target.value)
                            }
                            placeholder="Treatment type"
                          />
                        </label>
                        <label className="text-[11px] text-gray-400">
                          Material
                          <input
                            list={`material-options-${row.id}`}
                            className="w-full h-8 mt-1 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                            value={row.materialClass}
                            onChange={(event) =>
                              updateRow(row.id, "materialClass", event.target.value)
                            }
                            placeholder="Material"
                          />
                        </label>
                      </div>
                      <label className="text-[11px] text-gray-400 block">
                        Client
                        <select
                          className="w-full h-8 mt-1 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                          value={row.customerId}
                          onChange={(event) => {
                            const client = CLIENT_OPTIONS.find((item) => item.id === event.target.value);
                            if (!client) return;
                            setRows((currentRows) =>
                              currentRows.map((currentRow) =>
                                currentRow.id === row.id
                                  ? {
                                      ...currentRow,
                                      customerId: client.id,
                                      customerName: client.name,
                                    }
                                  : currentRow,
                              ),
                            );
                            setHasUnsavedChanges(true);
                          }}
                        >
                          {CLIENT_OPTIONS.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <datalist id={`material-options-${row.id}`}>
                        {MATERIAL_OPTIONS.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </div>
                  </td>
                  <td className="p-2 md:p-3 align-top">
                    <select
                      className="h-9 bg-[#0A0D14] border border-[#1A202C] px-1.5 w-full"
                      value={row.inspection}
                      onChange={(event) =>
                        setInitialInspection(row.id, event.target.value as InspectionState)
                      }
                    >
                      <option value="ok">OK</option>
                      <option value="not_ok">Not OK</option>
                    </select>
                  </td>
                  <td className="p-2 md:p-3 align-top">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={row.stressRelieving}
                        disabled={row.inspection === "not_ok" || missingRemarksForNotOk}
                        onChange={(event) =>
                          updateRow(row.id, "stressRelieving", event.target.checked)
                        }
                      />
                      <Tick checked={row.stressRelieving} />
                    </label>
                  </td>
                  <td className="p-2 md:p-3 align-top">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={row.hardening}
                        disabled={row.inspection === "not_ok" || missingRemarksForNotOk}
                        onChange={(event) => updateRow(row.id, "hardening", event.target.checked)}
                      />
                      <Tick checked={row.hardening} />
                    </label>
                  </td>
                  <td className="p-2 md:p-3 align-top">
                    <select
                      className="h-9 bg-[#0A0D14] border border-[#1A202C] px-1.5 w-full"
                      value={row.tempering}
                      disabled={row.inspection === "not_ok" || missingRemarksForNotOk}
                      onChange={(event) =>
                        updateRow(row.id, "tempering", event.target.value as TemperingLevel)
                      }
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </td>
                  <td className="p-2 md:p-3 align-top">
                    <select
                      className="h-9 bg-[#0A0D14] border border-[#1A202C] px-1.5 w-full"
                      value={row.finalInspection}
                      disabled={row.inspection === "not_ok"}
                      onChange={(event) =>
                        updateRow(row.id, "finalInspection", event.target.value as InspectionState)
                      }
                    >
                      <option value="ok">OK</option>
                      <option value="not_ok">Not OK</option>
                    </select>
                  </td>
                  <td className="p-2 md:p-3 align-top">
                    <select
                      className="h-9 bg-[#0A0D14] border border-[#1A202C] px-1.5 w-full"
                      value={toChoice(row.currentStage)}
                      disabled={row.inspection === "not_ok" || missingRemarksForNotOk}
                      onChange={(event) =>
                        updateStage(row.id, event.target.value as WorkerStageChoice)
                      }
                    >
                      {WORKER_STAGE_OPTIONS.map((stage) => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 md:p-3 align-top">
                    {row.finalInspection === "not_ok" ? (
                        <input
                        className="w-full h-9 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                        value={row.remarks}
                        onChange={(event) => updateRow(row.id, "remarks", event.target.value)}
                        placeholder="Remarks"
                        />
                    ) : (
                      <input
                        className="w-full h-9 bg-[#0A0D14] border border-[#1A202C] px-2 text-xs"
                        value={stageNotes[row.id] ?? ""}
                        onChange={(event) =>
                          setStageNotes((current) => ({ ...current, [row.id]: event.target.value }))
                        }
                        placeholder="Optional stage note"
                      />
                    )}
                  </td>
                  <td className="p-2 md:p-3 align-top">
                    <button
                      type="button"
                      className="h-9 px-2 w-full border border-[#1A202C] bg-[#111827] text-white disabled:opacity-50"
                      onClick={() => submitRow(row.id)}
                      disabled={!submitEnabled}
                    >
                      Submit
                    </button>
                  </td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
