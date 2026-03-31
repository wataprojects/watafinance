"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploadProps {
  currentUrl?: string | null;
  userId: string;
  onUpload: (url: string) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

const BUCKET_NAME = "avatars";

const AvatarUpload = ({ currentUrl, userId, onUpload }: AvatarUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setPreviewUrl(currentUrl || null);
  }, [currentUrl]);

  const statusText = useMemo(() => {
    if (uploadState === "uploading") return "Subiendo...";
    if (uploadState === "success") return "Avatar actualizado";
    if (uploadState === "error") return error || "No se pudo subir la imagen";
    return "Cambiar avatar";
  }, [uploadState, error]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploadState("uploading");

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      setUploadState("error");
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    setPreviewUrl(publicUrl);
    onUpload(publicUrl);
    setUploadState("success");
  };

  const clearSelection = () => {
    setPreviewUrl(currentUrl || null);
    setUploadState("idle");
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-800">
              <User className="h-10 w-10 text-zinc-500" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-2xl bg-green-500 text-black hover:bg-green-600"
            disabled={uploadState === "uploading"}
          >
            <Upload className="mr-2 h-4 w-4" />
            {statusText}
          </Button>

          {(previewUrl || uploadState !== "idle") && (
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3 w-3" />
              Restablecer
            </button>
          )}
        </div>
      </div>

      {uploadState === "error" && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default AvatarUpload;