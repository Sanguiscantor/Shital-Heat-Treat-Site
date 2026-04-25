export type InspectionState = "ok" | "not_ok";
export type TemperingLevel = "0" | "1" | "2" | "3" | "4";
export type HeatStage =
  | "received"
  | "inspection"
  | "loading"
  | "heating"
  | "soaking"
  | "quenching"
  | "tempering"
  | "final_inspection"
  | "ready_for_dispatch"
  | "dispatched";

export const HEAT_STAGE_SEQUENCE: HeatStage[] = [
  "received",
  "inspection",
  "loading",
  "heating",
  "soaking",
  "quenching",
  "tempering",
  "final_inspection",
  "ready_for_dispatch",
  "dispatched",
];

export const HEAT_STAGE_LABELS: Record<HeatStage, string> = {
  received: "Received",
  inspection: "Inspection",
  loading: "Loading",
  heating: "Heating",
  soaking: "Soaking",
  quenching: "Quenching",
  tempering: "Tempering",
  final_inspection: "Final Inspection",
  ready_for_dispatch: "Ready for Dispatch",
  dispatched: "Dispatched",
};

export type StageHistoryEntry = {
  stage: HeatStage;
  timestamp: string;
  note?: string;
  updatedBy?: string;
};

export type ClientNotificationEvent = {
  id: string;
  customerId: string;
  jobId: string;
  title: string;
  message: string;
  createdAt: string;
  stage: HeatStage;
};

export type WorkerRow = {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  jobType: string;
  treatmentType: string;
  materialClass: string;
  currentStage: HeatStage;
  stageHistory: StageHistoryEntry[];
  inspection: InspectionState;
  stressRelieving: boolean;
  hardening: boolean;
  tempering: TemperingLevel;
  finalInspection: InspectionState;
  remarks: string;
  readyForDispatch: boolean;
  dispatched: boolean;
};

const STORAGE_KEY = "sht_worker_rows";
const ARCHIVE_STORAGE_KEY = "sht_worker_archived_rows";
const NOTIFICATION_STORAGE_KEY = "sht_client_notification_events";

const DEFAULT_ROWS: WorkerRow[] = [
  {
    id: "HT-2401",
    customerId: "placeholder-customer-1",
    customerName: "Demo Client One",
    name: "Acme Gears / HT-2401",
    jobType: "Gear Hardening Batch",
    treatmentType: "Vacuum Hardening + Tempering",
    materialClass: "20MnCr5",
    currentStage: "final_inspection",
    stageHistory: [
      { stage: "received", timestamp: "2026-04-21T08:30:00.000Z" },
      { stage: "inspection", timestamp: "2026-04-21T09:10:00.000Z" },
      { stage: "loading", timestamp: "2026-04-21T11:00:00.000Z" },
      { stage: "heating", timestamp: "2026-04-21T12:05:00.000Z" },
      { stage: "soaking", timestamp: "2026-04-21T14:00:00.000Z" },
      { stage: "quenching", timestamp: "2026-04-21T16:00:00.000Z" },
      { stage: "tempering", timestamp: "2026-04-21T18:15:00.000Z" },
      {
        stage: "final_inspection",
        timestamp: "2026-04-22T10:20:00.000Z",
        note: "Hardness mismatch on one part. Re-check scheduled.",
      },
    ],
    inspection: "ok",
    stressRelieving: true,
    hardening: true,
    tempering: "2",
    finalInspection: "not_ok",
    remarks: "Surface hardness below target in one lot.",
    readyForDispatch: false,
    dispatched: false,
  },
  {
    id: "HT-2402",
    customerId: "placeholder-customer-2",
    customerName: "Demo Client Two",
    name: "Pinnacle Tools / HT-2402",
    jobType: "Die Treatment",
    treatmentType: "Stress Relieving + Hardening",
    materialClass: "H13",
    currentStage: "ready_for_dispatch",
    stageHistory: [
      { stage: "received", timestamp: "2026-04-22T08:20:00.000Z" },
      { stage: "inspection", timestamp: "2026-04-22T09:00:00.000Z" },
      { stage: "loading", timestamp: "2026-04-22T10:45:00.000Z" },
      { stage: "heating", timestamp: "2026-04-22T12:10:00.000Z" },
      { stage: "soaking", timestamp: "2026-04-22T14:30:00.000Z" },
      { stage: "quenching", timestamp: "2026-04-22T16:05:00.000Z" },
      { stage: "tempering", timestamp: "2026-04-22T18:00:00.000Z" },
      { stage: "final_inspection", timestamp: "2026-04-23T09:40:00.000Z" },
      { stage: "ready_for_dispatch", timestamp: "2026-04-23T11:00:00.000Z" },
    ],
    inspection: "ok",
    stressRelieving: true,
    hardening: false,
    tempering: "2",
    finalInspection: "ok",
    remarks: "",
    readyForDispatch: true,
    dispatched: false,
  },
  {
    id: "HT-2403",
    customerId: "placeholder-customer-1",
    customerName: "Demo Client One",
    name: "Orbit Components / HT-2403",
    jobType: "Shaft Nitriding Support",
    treatmentType: "Hardening + Multi Temper",
    materialClass: "SS Alloy",
    currentStage: "dispatched",
    stageHistory: [
      { stage: "received", timestamp: "2026-04-19T08:00:00.000Z" },
      { stage: "inspection", timestamp: "2026-04-19T08:40:00.000Z" },
      { stage: "loading", timestamp: "2026-04-19T11:30:00.000Z" },
      { stage: "heating", timestamp: "2026-04-19T12:40:00.000Z" },
      { stage: "soaking", timestamp: "2026-04-19T15:10:00.000Z" },
      { stage: "quenching", timestamp: "2026-04-19T17:05:00.000Z" },
      { stage: "tempering", timestamp: "2026-04-19T19:25:00.000Z" },
      { stage: "final_inspection", timestamp: "2026-04-20T09:30:00.000Z" },
      { stage: "ready_for_dispatch", timestamp: "2026-04-20T11:15:00.000Z" },
      { stage: "dispatched", timestamp: "2026-04-20T16:20:00.000Z" },
    ],
    inspection: "ok",
    stressRelieving: false,
    hardening: true,
    tempering: "3",
    finalInspection: "ok",
    remarks: "",
    readyForDispatch: true,
    dispatched: true,
  },
];

function normalizeLegacyRow(row: WorkerRow | Record<string, unknown>): WorkerRow {
  const parsed = row as Partial<WorkerRow>;
  const now = new Date().toISOString();
  const history: StageHistoryEntry[] = Array.isArray(parsed.stageHistory)
    ? (parsed.stageHistory as StageHistoryEntry[])
    : [{ stage: "received" as HeatStage, timestamp: now }];
  const currentStage: HeatStage =
    (parsed.currentStage as HeatStage | undefined) ??
    history[history.length - 1]?.stage ??
    "received";

  return {
    id: parsed.id ?? `HT-${Math.random().toString().slice(2, 6)}`,
    customerId: parsed.customerId ?? "placeholder-customer-1",
    customerName: parsed.customerName ?? "Demo Client One",
    name: parsed.name ?? "Unnamed Job",
    jobType: parsed.jobType ?? "",
    treatmentType: parsed.treatmentType ?? "",
    materialClass: parsed.materialClass ?? "",
    currentStage,
    stageHistory: history,
    inspection: parsed.inspection ?? "ok",
    stressRelieving: parsed.stressRelieving ?? false,
    hardening: parsed.hardening ?? false,
    tempering: parsed.tempering ?? "2",
    finalInspection: parsed.finalInspection ?? "ok",
    remarks: parsed.remarks ?? "",
    readyForDispatch:
      parsed.readyForDispatch ??
      (currentStage === "ready_for_dispatch" || currentStage === "dispatched"),
    dispatched: parsed.dispatched ?? currentStage === "dispatched",
  };
}

export function loadWorkerRows(): WorkerRow[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_ROWS;
  }
  try {
    const parsed = JSON.parse(raw) as Array<WorkerRow | Record<string, unknown>>;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_ROWS;
    }
    return parsed.map((row) => normalizeLegacyRow(row));
  } catch {
    return DEFAULT_ROWS;
  }
}

export function saveWorkerRows(rows: WorkerRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function loadArchivedWorkerRows(): WorkerRow[] {
  const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<WorkerRow | Record<string, unknown>>;
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed.map((row) => normalizeLegacyRow(row));
  } catch {
    return [];
  }
}

export function saveArchivedWorkerRows(rows: WorkerRow[]) {
  localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(rows));
}

export function loadClientNotificationEvents(): ClientNotificationEvent[] {
  const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ClientNotificationEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveClientNotificationEvents(events: ClientNotificationEvent[]) {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(events));
}

export function getStageIndex(stage: HeatStage): number {
  return HEAT_STAGE_SEQUENCE.indexOf(stage);
}

export function getTimelineProgress(stage: HeatStage): number {
  const idx = getStageIndex(stage);
  return idx < 0 ? 0 : idx + 1;
}
