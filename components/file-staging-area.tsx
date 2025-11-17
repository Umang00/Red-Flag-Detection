"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export type StagedFile = {
  id: string;
  file: File;
  preview?: string;
  status: "pending" | "uploading" | "uploaded" | "error";
  url?: string;
  error?: string;
};

type FileStagingAreaProps = {
  files: StagedFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (id: string) => void;
  maxFiles?: number;
  className?: string;
};

export function FileStagingArea({
  files,
  onFilesAdded,
  onFileRemoved,
  maxFiles = 5,
  className,
}: FileStagingAreaProps) {
  const canAddMore = files.length < maxFiles;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remainingSlots = maxFiles - files.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      onFilesAdded(filesToAdd);
    },
    [files.length, maxFiles, onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: !canAddMore,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return "🖼️";
    }
    if (file.type === "application/pdf") {
      return "📄";
    }
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: StagedFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "uploaded":
        return <span className="text-green-500">✓</span>;
      case "error":
        return <span className="text-red-500">✗</span>;
      default:
        return null;
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Drop Zone */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          {isDragActive ? (
            <p className="font-medium text-sm">Drop files here...</p>
          ) : (
            <>
              <p className="mb-2 font-medium text-sm">
                Drag & drop files here, or click to select
              </p>
              <p className="text-muted-foreground text-xs">
                JPG, PNG, PDF • Max 100MB per file • {maxFiles - files.length}{" "}
                remaining
              </p>
            </>
          )}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between font-medium text-sm">
            <span>
              Staged Files ({files.length}/{maxFiles})
            </span>
          </div>
          <div className="grid gap-2">
            {files.map((stagedFile) => (
              <div
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
                key={stagedFile.id}
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {stagedFile.preview ? (
                    // biome-ignore lint/performance/noImgElement: Client-side preview uses blob URLs
                    // biome-ignore lint/nursery/useImageSize: Preview thumbnails have fixed dimensions via Tailwind
                    <img
                      alt={stagedFile.file.name}
                      className="h-12 w-12 rounded object-cover"
                      src={stagedFile.preview}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-muted text-2xl">
                      {getFileIcon(stagedFile.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-sm">
                    {stagedFile.file.name}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <span>{formatFileSize(stagedFile.file.size)}</span>
                    {stagedFile.status !== "pending" && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{stagedFile.status}</span>
                      </>
                    )}
                  </div>
                  {stagedFile.error && (
                    <div className="text-red-500 text-xs">
                      {stagedFile.error}
                    </div>
                  )}
                </div>

                {/* Status & Remove */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(stagedFile.status)}
                  <Button
                    className="h-8 w-8"
                    disabled={stagedFile.status === "uploading"}
                    onClick={() => onFileRemoved(stagedFile.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File limit message */}
      {!canAddMore && (
        <div className="rounded-lg bg-muted p-3 text-center text-muted-foreground text-sm">
          Maximum {maxFiles} files reached. Remove a file to add more.
        </div>
      )}
    </div>
  );
}
