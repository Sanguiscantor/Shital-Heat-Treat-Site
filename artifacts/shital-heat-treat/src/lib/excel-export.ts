/**
 * Utility functions for exporting data to Excel-compatible formats
 */

export interface ExportData {
  headers: string[];
  rows: (string | number | boolean)[][];
  fileName: string;
}

/**
 * Export data as CSV (Excel-compatible)
 */
export function exportToCSV(data: ExportData): void {
  const { headers, rows, fileName } = data;

  // Create CSV content
  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          // Escape quotes and wrap in quotes if contains comma or newline
          return value.includes(",") || value.includes('"') || value.includes("\n")
            ? `"${value.replace(/"/g, '""')}"`
            : `"${value}"`;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate Excel-like XLSX format (simplified - creates spreadsheet-compatible CSV)
 */
export function exportToExcel(data: ExportData): void {
  // For true XLSX support, we'd use a library like xlsx, but CSV works in all Excel versions
  exportToCSV(data);
}

/**
 * Export customers data
 */
export function exportCustomersToExcel(
  customers: Array<{
    name: string;
    email: string;
    phone: string;
    status: string;
    totalBatches?: number;
    inProcess?: number;
    completed?: number;
  }>
): void {
  const headers = [
    "Company Name",
    "Email",
    "Phone",
    "Status",
    "Total Batches",
    "In Process",
    "Completed",
  ];

  const rows = customers.map((c) => [
    c.name,
    c.email,
    c.phone,
    c.status,
    c.totalBatches ?? 0,
    c.inProcess ?? 0,
    c.completed ?? 0,
  ]);

  exportToExcel({
    headers,
    rows,
    fileName: `Customers_${new Date().toISOString().split("T")[0]}`,
  });
}

/**
 * Export production data
 */
export function exportProductionToExcel(
  jobs: Array<{
    id: string;
    name: string;
    jobType: string;
    treatmentType: string;
    materialClass: string;
    customerName: string;
    currentStage: string;
    finalInspection: string;
    remarks: string;
  }>
): void {
  const headers = [
    "Job ID",
    "Job Name",
    "Customer",
    "Job Type",
    "Treatment Type",
    "Material Class",
    "Current Stage",
    "Final Inspection",
    "Remarks",
  ];

  const rows = jobs.map((j) => [
    j.id,
    j.name,
    j.customerName,
    j.jobType,
    j.treatmentType,
    j.materialClass,
    j.currentStage,
    j.finalInspection,
    j.remarks,
  ]);

  exportToExcel({
    headers,
    rows,
    fileName: `Production_Report_${new Date().toISOString().split("T")[0]}`,
  });
}

/**
 * Export financial data
 */
export function exportFinancialToExcel(
  data: Array<{
    period: string;
    revenue: string;
    costs: string;
    margin: string;
    marginPercent: string;
  }>
): void {
  const headers = ["Period", "Revenue", "Costs", "Margin", "Margin %"];

  const rows = data.map((d) => [d.period, d.revenue, d.costs, d.margin, d.marginPercent]);

  exportToExcel({
    headers,
    rows,
    fileName: `Financial_Report_${new Date().toISOString().split("T")[0]}`,
  });
}
