// src/components/generation/GenerationForm.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StopCircle, AlertCircle, RefreshCw, Download, Sparkles, X } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { Button } from '../ui/Button';
import { useGenerate } from '../../hooks/useGenerate';
import { ImageStyle, GenerationStatus } from '../../types';
import type { RestoreData } from '../../pages/StudioPage';

interface GenerationFormProps {
  onSuccess: () => void;
  restoreData?: RestoreData | null;
  restoreTrigger?: number;
  onRestoreComplete?: () => void;
}

const STYLE_OPTIONS = [
  { value: ImageStyle.REALISTIC, label: 'Realistic' },
  { value: ImageStyle.ARTISTIC, label: 'Artistic' },
  { value: ImageStyle.CARTOON, label: 'Cartoon' },
  { value: ImageStyle.CYBERPUNK, label: 'Cyberpunk' },
  { value: ImageStyle.WATERCOLOR, label: 'Watercolor' },
];

export function GenerationForm({ 
  onSuccess, 
  restoreData, 
  restoreTrigger = 0,
  onRestoreComplete 
}: GenerationFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ImageStyle>(ImageStyle.REALISTIC);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  
  // Track initial state to detect changes
  const [initialState, setInitialState] = useState<{
    prompt: string;
    style: ImageStyle;
    hasImage: boolean;
  }>({
    prompt: '',
    style: ImageStyle.REALISTIC,
    hasImage: false,
  });

  const { generate, abort, status, error, attempt, isRetrying } = useGenerate();

  const isGenerating = status === GenerationStatus.GENERATING;
  
  // Check if form has been modified from initial/restored state
  // Compare current file existence vs initial state
  console.log("Initial State:", initialState);
  const imageChanged = (imageFile !== null) !== initialState.hasImage;
  console.log("Image Changed:", imageChanged);
  
  const hasChanges = 
    prompt !== initialState.prompt ||
    style !== initialState.style ||
    imageChanged;
  
  const canSubmit = imageFile && prompt.trim().length > 0 && !isGenerating && hasChanges;

  // Handle restoration when restoreData changes
  useEffect(() => {
    if (restoreData && restoreTrigger > 0) {
      setRestoreError(null); // Clear any previous errors
      handleRestoreFromHistory(restoreData);
    }
  }, [restoreTrigger]);

  const handleRestoreFromHistory = async (data: RestoreData) => {
    setIsRestoring(true);
    
    try {
      // Fetch the image from URL and convert to File
      const response = await fetch(data.imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Extract filename from URL or use a default
      const urlParts = data.imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'restored-image.jpg';
      
      // Determine the correct MIME type
      const mimeType = blob.type || 'image/jpeg';
      
      // Create File object from blob
      const file = new File([blob], filename, { type: mimeType });
      
      console.log('Restored file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        url: data.imageUrl
      });
      
      // Set form state - this will trigger the ImageUpload component to show preview
      setImageFile(file);
      setPrompt(data.prompt);
      setStyle(data.style as ImageStyle);
      
      // Update initial state so changes can be tracked
      setInitialState({
        prompt: data.prompt,
        style: data.style as ImageStyle,
        hasImage: true,
      });
      
      // Notify parent that restore is complete
      if (onRestoreComplete) {
        onRestoreComplete();
      }
    } catch (err) {
      console.error('Failed to restore generation:', err);
      setRestoreError('Failed to restore image. Please try again.');
      
      // Clear restoring state even on error
      if (onRestoreComplete) {
        onRestoreComplete();
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile || !prompt.trim()) return;

    try {
      await generate({
        imageFile,
        prompt: prompt.trim(),
        style,
      });
      onSuccess();
      
      // Clear form on success
      setImageFile(null);
      setPrompt('');
      setStyle(ImageStyle.REALISTIC);
      
      // Reset initial state
      setInitialState({
        prompt: '',
        style: ImageStyle.REALISTIC,
        hasImage: false,
      });
    } catch (err) {
      // Error is handled by the hook
      console.error('Generation failed', err);
    }
  };

  const handleAbort = () => {
    abort();
  };

  // Handle form field changes to track modifications
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStyle(e.target.value as ImageStyle);
  };

  const handleImageChange = (file: File | null) => {

    setImageFile(file);
    // When image changes, update initial state to reflect current image status
    // This allows detecting further image changes
    if (file && !initialState.hasImage) {
      // First image uploaded after restore or clear
      setInitialState(prev => ({ ...prev, hasImage: true }));
    } else if (!file && initialState.hasImage) {
      // Image removed
      setInitialState(prev => ({ ...prev, hasImage: false }));
    }
  };

  console.log("Hi GenerationForm")

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 space-y-6 border border-gray-200 dark:border-gray-700">
      {/* Restoring Indicator */}
      <AnimatePresence>
        {isRestoring && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden"
          >
            <div className="relative">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Restoring generation...
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                Loading image and settings from history
              </p>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        
        {restoreError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Restore Failed
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {restoreError}
              </p>
            </div>
            <button
              onClick={() => setRestoreError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <ImageUpload
          value={imageFile}
          onChange={handleImageChange}
          disabled={isGenerating || isRestoring}
        />

        {/* Prompt Input */}
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={handlePromptChange}
            disabled={isGenerating || isRestoring}
            placeholder="Describe how you want to transform the image..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
              dark:focus:ring-offset-gray-800
              disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900
              transition-all duration-200"
            aria-label="Generation prompt"
            required
          />
        </div>

        {/* Style Selector */}
        <div>
          <label
            htmlFor="style"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Style
          </label>
          <select
            id="style"
            value={style}
            onChange={handleStyleChange}
            disabled={isGenerating || isRestoring}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
              dark:focus:ring-offset-gray-800
              disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900
              transition-all duration-200"
            aria-label="Generation style"
          >
            {STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Change Indicator */}
        {!hasChanges && imageFile && prompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          >
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Make changes to the prompt, style, or image to generate a new variation
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!canSubmit}
            isLoading={isGenerating}
            className="flex-1"
            title={!hasChanges ? "Make changes to enable generation" : "Generate image"}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                type="button"
                variant="danger"
                size="lg"
                onClick={handleAbort}
                aria-label="Abort generation"
              >
                <StopCircle className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {isRetrying && (
            <motion.div
              key="retrying"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <RefreshCw className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Retrying... (Attempt {attempt} of 3)
              </p>
            </motion.div>
          )}

          {error && status === GenerationStatus.ERROR && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Generation Failed
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {error}
                  {attempt >= 3 && ' Please try again later.'}
                </p>
              </div>
            </motion.div>
          )}

          {status === GenerationStatus.ABORTED && (
            <motion.div
              key="aborted"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Generation aborted. You can start a new generation.
              </p>
            </motion.div>
          )}

          {status === GenerationStatus.SUCCESS && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                ✨ Generation completed successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Processing your image...</span>
              <span>{Math.min((attempt / 3) * 100, 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-blue-600 dark:bg-blue-500 h-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}