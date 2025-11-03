"use client";

import { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, Loader2, ExternalLink } from "lucide-react";

interface PDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PDFViewer({ pdfUrl, fileName = "document.pdf", isOpen, onClose }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download PDF");
    }
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-7xl max-h-screen m-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {fileName}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Download PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B5A5] mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading PDF...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
                >
                  Try Download Instead
                </button>
              </div>
            </div>
          )}
          
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={fileName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError("Failed to load PDF. You can try downloading it instead.");
            }}
          />
        </div>
      </div>
    </div>
  );
}