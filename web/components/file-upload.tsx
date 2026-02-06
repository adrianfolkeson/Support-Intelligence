"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}

export function FileUpload({ onFileSelect, accept = ".csv", className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors",
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
        className
      )}
    >
      <Upload className="h-12 w-12 text-gray-400" />
      <p className="mt-4 text-sm text-gray-600">
        Drag and drop your CSV file here, or{" "}
        <label className="cursor-pointer text-blue-600 hover:text-blue-700">
          browse
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </label>
      </p>
      <p className="mt-2 text-xs text-gray-500">Supports CSV files only</p>
    </div>
  );
}
