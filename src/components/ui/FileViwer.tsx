"use client";

import { useState } from "react";
import { X, Download, ExternalLink, FileText, File as FileIcon } from "lucide-react";

interface FileViewerProps {
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FileViewer({
  fileUrl,
  fileName = "document",
  fileType,
  isOpen,
  onClose,
}: FileViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFileType = () => {
    if (fileType) return fileType;
    
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    const url = fileUrl.toLowerCase();
    
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) return 'image';
    if (url.match(/\.(pdf)$/i)) return 'pdf';
    if (url.match(/\.(doc|docx)$/i)) return 'document';
    if (url.match(/\.(xls|xlsx)$/i)) return 'spreadsheet';
    if (url.match(/\.(ppt|pptx)$/i)) return 'presentation';
    if (url.match(/\.(txt|csv)$/i)) return 'text';
    if (url.match(/\.(mp4|webm|ogg|mov)$/i)) return 'video';
    if (url.match(/\.(mp3|wav|ogg|m4a)$/i)) return 'audio';
    
    return 'unknown';
  };

  const detectedFileType = getFileType();

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
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
      setError("Failed to download file");
    }
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, "_blank");
  };

  const renderContent = () => {
    switch (detectedFileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-4">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain rounded-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError("Failed to load image");
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-4">
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-full rounded-lg"
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError("Failed to load video");
              }}
            >
              Your browser does not support video playback.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-xl">
              <div className="mb-4 flex items-center justify-center">
                <div className="w-24 h-24 bg-[#00B5A5]/10 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#00B5A5]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                  </svg>
                </div>
              </div>
              <audio
                src={fileUrl}
                controls
                className="w-full"
                onLoadedData={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setError("Failed to load audio");
                }}
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title={fileName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError("Failed to load PDF");
            }}
          />
        );

      case 'document':
      case 'spreadsheet':
      case 'presentation':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md p-8">
              <div className="w-20 h-20 bg-[#00B5A5]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-[#00B5A5]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {fileName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Preview not available for this file type
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md p-8">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileIcon className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {fileName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Unable to preview this file type
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-6xl max-h-[90vh] m-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <h2 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white truncate">
              {fileName}
            </h2>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#00B5A5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
              <div className="text-center max-w-md p-8">
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Instead
                </button>
              </div>
            </div>
          )}
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}