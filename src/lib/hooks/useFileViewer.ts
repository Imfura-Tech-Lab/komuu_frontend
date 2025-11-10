import { useState, useCallback } from "react";

export function useFileViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<"pdf" | "image" | "document">("pdf");

  const openFile = useCallback((url: string, name: string, type: "pdf" | "image" | "document" = "pdf") => {
    setFileUrl(url);
    setFileName(name);
    setFileType(type);
    setIsOpen(true);
  }, []);

  const closeFile = useCallback(() => {
    setIsOpen(false);
    // Clear data after animation completes
    setTimeout(() => {
      setFileUrl("");
      setFileName("");
      setFileType("pdf");
    }, 300);
  }, []);

  return {
    isOpen,
    fileUrl,
    fileName,
    fileType,
    openFile,
    closeFile,
  };
}