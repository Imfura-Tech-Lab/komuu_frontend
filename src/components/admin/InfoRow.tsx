// ============================================================================
// INFO ROW COMPONENT
// ============================================================================

interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}

export function InfoRow({ label, value, highlight = false }: InfoRowProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p
        className={`text-sm font-medium ${
          highlight
            ? "text-[#00B5A5] dark:text-[#00B5A5]"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value || "N/A"}
      </p>
    </div>
  );
}