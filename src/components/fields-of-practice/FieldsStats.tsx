import React from "react";
import { FieldOfPractice } from "./hooks/useFieldsOfPractice";

interface FieldsStatsProps {
  fields: FieldOfPractice[];
}

export function FieldsStats({ fields }: FieldsStatsProps) {
  const totalFields = fields.length;
  
  // Count total sub-fields across all main fields
  const totalSubFields = fields.reduce((sum, field) => sum + field.sub_fields.length, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {totalFields}
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Main Fields
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          {totalSubFields}
        </div>
        <p className="text-gray-600 dark:text-gray-400">Total Sub-fields</p>
      </div>
    </div>
  );
}