"use client";

interface PDFLoadingOverlayProps {
  isVisible: boolean;
}

export default function PDFLoadingOverlay({ isVisible }: PDFLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5A5] mb-4"></div>
        <p className="text-gray-900 dark:text-white font-medium">Generating PDF...</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Please wait while we prepare your document
        </p>
      </div>
    </div>
  );
}