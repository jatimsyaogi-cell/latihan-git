"use client";

import { useState, useTransition, useRef } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";

type AvatarUploaderProps = {
  name: string;
  value: string;
  onChange: (url: string) => void;
};

export function AvatarUploader({ name, value, onChange }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startTransition] = useTransition();
  const [preview, setPreview] = useState(value);

  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const response = await fetch("/api/employees/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Gagal mengunggah foto");
        return;
      }

      setPreview(data.url);
      onChange(data.url);
      toast.success("Foto terunggah");
    });
  }

  function handleRemove() {
    setPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <EmployeeAvatar name={name || "?"} src={preview} size={64} />

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Unggah foto
          </Button>

          {preview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
              Hapus
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG, atau WebP. Maksimal 5 MB.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}
