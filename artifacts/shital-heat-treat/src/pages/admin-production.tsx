import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth-session";
import { getAdminPanelScopes, getAdminTitle } from "@/lib/admin-access";
import {
  loadWorkerRows,
  saveWorkerRows,
  HEAT_STAGE_LABELS,
  WorkerRow,
  HeatStage,
  HEAT_STAGE_SEQUENCE,
} from "@/lib/worker-data";
import { exportProductionToExcel } from "@/lib/excel-export";
import { toast } from "@/hooks/use-toast";

export default function AdminProduction() {
  const user = getSessionUser();
  const scopes = user ? getAdminPanelScopes(user) : [];
  const [rows, setRows] = useState<WorkerRow[]>(() => loadWorkerRows());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<WorkerRow>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Only Director, Production Head, and Website Admin can edit
  const canEdit =
    user &&
    ["director@demo.com", "production.head@demo.com", "website.admin@demo.com"].includes(
      user.email.toLowerCase()
    );

  if (!scopes.includes("productionHistory")) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-400">Access denied</p>
        </div>
      </div>
    );
  }

  const handleEdit = (row: WorkerRow) => {
    setEditingId(row.id);
    setEditData(row);
  };

  const handleSave = async () => {
    if (!editingId || !editData.id) return;
    
    setIsSaving(true);
    try {
      const updatedRows = rows.map((r) =>
        r.id === editingId ? { ...r, ...editData } : r
      );
      setRows(updatedRows);
      saveWorkerRows(updatedRows);

      // Attempt to sync with backend API if available
      try {
        const response = await fetch(
          `/api/work-orders/${editingId}/worker-fields`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              remarks: editData.remarks || null,
              notes: editData.remarks || null,
            }),
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to sync with backend");
        }
      } catch (apiError) {
        // Backend sync failed, but local update succeeded
        console.warn("Backend sync warning:", apiError);
      }

      toast({
        title: "Success",
        description: "Production record updated successfully.",
      });

      setEditingId(null);
      setEditData({});
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleExport = () => {
    const exportData = rows.map((row) => ({
      id: row.id,
      name: row.name,
      customerName: row.customerName,
      jobType: row.jobType,
      treatmentType: row.treatmentType,
      materialClass: row.materialClass,
      currentStage: HEAT_STAGE_LABELS[row.currentStage],
      finalInspection: row.finalInspection === "ok" ? "✓ OK" : "✗ Not OK",
      remarks: row.remarks,
    }));
    exportProductionToExcel(exportData);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Production History</h1>
            <p className="text-sm text-gray-400 mt-1">
              {canEdit
                ? "You can edit production records."
                : "Review-only: Contact Director or Production Head to make changes."}
            </p>
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

        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="border border-[#1A202C] bg-[#0D111A] p-5 rounded-lg"
            >
              {editingId === row.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Job Name
                      </label>
                      <input
                        type="text"
                        value={editData.name || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full bg-[#0A0D14] border border-[#1A202C] rounded px-3 py-2 text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Current Stage
                      </label>
                      <select
                        value={editData.currentStage || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            currentStage: e.target.value as HeatStage,
                          })
                        }
                        className="w-full bg-[#0A0D14] border border-[#1A202C] rounded px-3 py-2 text-gray-100"
                      >
                        {HEAT_STAGE_SEQUENCE.map((stage) => (
                          <option key={stage} value={stage}>
                            {HEAT_STAGE_LABELS[stage]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Remarks
                      </label>
                      <textarea
                        value={editData.remarks || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, remarks: e.target.value })
                        }
                        className="w-full bg-[#0A0D14] border border-[#1A202C] rounded px-3 py-2 text-gray-100"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Material Class
                      </label>
                      <input
                        type="text"
                        value={editData.materialClass || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            materialClass: e.target.value,
                          })
                        }
                        className="w-full bg-[#0A0D14] border border-[#1A202C] rounded px-3 py-2 text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave} 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-100">{row.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                      <div>
                        <span className="text-gray-400">Job Type:</span>
                        <span className="text-gray-200 ml-2">{row.jobType}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Treatment Type:</span>
                        <span className="text-gray-200 ml-2">{row.treatmentType}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Material Class:</span>
                        <span className="text-gray-200 ml-2">{row.materialClass}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Current Stage:</span>
                        <span className="text-gray-200 ml-2">
                          {HEAT_STAGE_LABELS[row.currentStage]}
                        </span>
                      </div>
                    </div>
                    {row.remarks && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-400">Remarks:</span>
                        <p className="text-gray-200 mt-1">{row.remarks}</p>
                      </div>
                    )}
                  </div>
                  {canEdit && (
                    <Button
                      onClick={() => handleEdit(row)}
                      className="mt-4 md:mt-0 md:ml-4 bg-blue-600 hover:bg-blue-700"
                    >
                      Edit Production
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
