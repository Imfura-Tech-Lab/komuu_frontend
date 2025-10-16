"use client";

import { PaymentsResponse } from "@/types/payment";

interface PaymentPaginationProps {
  paymentsData: PaymentsResponse;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function PaymentPagination({ 
  paymentsData, 
  currentPage, 
  onPageChange 
}: PaymentPaginationProps) {
  if (!paymentsData || paymentsData.last_page <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing {paymentsData.from} to {paymentsData.to} of {paymentsData.total} payments
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!paymentsData.prev_page_url}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {Array.from({ length: Math.min(paymentsData.last_page, 10) }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              page === paymentsData.current_page
                ? "bg-[#00B5A5] text-white"
                : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!paymentsData.next_page_url}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}