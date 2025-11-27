// src/components/generation/ImageUpload.tsx

import React, { useRef, useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
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
  const [lastProcessedFile, setLastProcessedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with parent clearing the input
  useEffect(() => {
    if (value === null && previewUrl) {
      revokeImagePreviewUrl(previewUrl);
      setPreviewUrl(null);
      setLastProcessedFile(null);
    }
  }, [value]);

  // Handle File object set programmatically (e.g., from restore)
  // useEffect(() => {
  //   if (value && !previewUrl) {
  //     // Create preview from the File object
  //     const newPreview = createImagePreviewUrl(value);
  //     setPreviewUrl(newPreview);
  //   }
  // }, [value]);
  useEffect(() => {
    // Only create preview if we have a NEW file different from last
    if (value && value !== lastProcessedFile) {
      // Revoke old preview first
      if (previewUrl) {
        revokeImagePreviewUrl(previewUrl);
      }
      
      // Create new preview
      const newPreview = createImagePreviewUrl(value);
      setPreviewUrl(newPreview);
      setLastProcessedFile(value); // ✅ Remember this file
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
      setLastProcessedFile(resizedFile);
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
    setLastProcessedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          relative border-2 rounded-xl transition-all duration-200 cursor-pointer
          ${previewUrl 
            ? 'border-transparent' 
            : 'border-dashed border-gray-300 dark:border-gray-600'}
          hover:border-blue-400 dark:hover:border-blue-500 
          hover:bg-blue-50/30 dark:hover:bg-blue-900/10
          focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400
          dark:focus-within:ring-offset-gray-800
          bg-white dark:bg-gray-800
          ${previewUrl ? 'p-0' : 'p-8'}
          w-full aspect-[4/3] min-h-[320px] max-h-[480px]
          flex items-center justify-center
        `}
      >
        {/* IMAGE PREVIEW */}
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg bg-gray-50 dark:bg-gray-900"
            />

            {/* REMOVE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearImage();
              }}
              className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 
                rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700
                border border-gray-200 dark:border-gray-700
                transition-all duration-200"
              aria-label="Remove image"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* FILE NAME & SIZE */}
            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 
              px-3 py-1 rounded-md text-sm text-gray-800 dark:text-gray-200 
              shadow-md border border-gray-200 dark:border-gray-700
              backdrop-blur-sm">
              {value?.name} — {formatFileSize(value?.size ?? 0)}
            </div>
          </div>
        ) : (
          /* EMPTY DROPZONE UI */
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 w-20 h-20 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-xl animate-pulse" />
              
              {/* Icon container */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 
                dark:from-blue-900/40 dark:to-indigo-900/40 
                rounded-full flex items-center justify-center 
                shadow-lg border-2 border-blue-200/50 dark:border-blue-700/50
                transition-transform duration-300 hover:scale-110">
                <Plus className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Upload your image
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to browse or drag and drop
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>PNG, JPG, WebP</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Max 10MB</span>
              </div>
            </div>
          </div>
        )}

        {/* RESIZING/LOADING OVERLAY */}
        {isResizing && (
          <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 
            backdrop-blur-md flex flex-col items-center justify-center rounded-xl z-20">
            <div className="relative">
              {/* Spinning ring */}
              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
              Processing image...
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optimizing for best quality
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}