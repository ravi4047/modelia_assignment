// src/components/generation/ImageUpload.tsx

import React, { useRef, useState, useEffect } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import {
  validateImageFile,
  createImagePreviewUrl,
  revokeImagePreviewUrl,
  formatFileSize,
  resizeImage,
} from '../../utils/imageUtils';

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with parent clearing the input
  useEffect(() => {
    if (value === null && previewUrl) {
      revokeImagePreviewUrl(previewUrl);
      setPreviewUrl(null);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl) revokeImagePreviewUrl(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = async (file: File) => {
    setError(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsResizing(true);

      const resizedFile = await resizeImage(file, 1920);

      if (previewUrl) revokeImagePreviewUrl(previewUrl);

      const newPreview = createImagePreviewUrl(resizedFile);
      setPreviewUrl(newPreview);
      onChange(resizedFile);
    } catch (err) {
      console.error(err);
      setError('Failed to process image.');
    } finally {
      setIsResizing(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const openPicker = () => {
    if (!disabled && !isResizing) fileInputRef.current?.click();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || isResizing) return;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  };

  const clearImage = () => {
    if (previewUrl) revokeImagePreviewUrl(previewUrl);
    onChange(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Image
      </label>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />

      <div
        onClick={openPicker}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          relative border-2 rounded-xl transition cursor-pointer
          ${previewUrl ? 'border-transparent' : 'border-dashed border-gray-300'}
          hover:border-blue-400 hover:bg-blue-50/30
          focus-within:ring-2 focus-within:ring-blue-500
          p-5 h-64 flex items-center justify-center bg-white
        `}
      >
        {/* IMAGE PREVIEW */}
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg bg-gray-50"
            />

            {/* REMOVE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* FILE NAME & SIZE */}
            <p className="absolute bottom-3 left-3 bg-white/90 px-3 py-1 rounded-md text-sm text-gray-800 shadow">
              {value?.name} — {formatFileSize(value?.size ?? 0)}
            </p>
          </div>
        ) : (
          /* EMPTY DROPZONE UI */
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
              <Plus className="w-9 h-9 text-blue-600" />
            </div>

            <p className="mt-4 text-sm font-medium text-gray-700">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-500 mt-1">Images only • Max 10MB</p>
          </div>
        )}

        {/* RESIZING OVERLAY */}
        {isResizing && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            <p className="mt-2 text-sm text-gray-700">Processing image...</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
