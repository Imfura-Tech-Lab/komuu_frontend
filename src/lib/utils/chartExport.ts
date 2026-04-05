/**
 * Export chart/dashboard data as PNG or CSV.
 */

// Export a DOM element as PNG image
export async function exportChartAsPng(elementId: string, filename: string = "chart") {
  try {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Use html2canvas dynamically
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
    });

    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch {
    // Fallback: export SVG elements directly
    const element = document.getElementById(elementId);
    if (!element) return;

    const svgs = element.querySelectorAll("svg");
    if (svgs.length === 0) return;

    const svg = svgs[0];
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = `${filename}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

// Export data as CSV
export function exportDataAsCsv(
  data: Record<string, string | number>[],
  filename: string = "data"
) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
      }).join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.download = `${filename}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

// Export dashboard section as PNG
export async function exportDashboardSection(sectionId: string, title: string) {
  await exportChartAsPng(sectionId, title.toLowerCase().replace(/\s+/g, "-"));
}
