// src/components/generation/GenerationForm.tsx

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StopCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { Button } from '../ui/Button';
import { useGenerate } from '../../hooks/useGenerate';
import { ImageStyle, GenerationStatus } from '../../types';

interface GenerationFormProps {
  onSuccess: () => void;
}

const STYLE_OPTIONS = [
  { value: ImageStyle.REALISTIC, label: 'Realistic' },
  { value: ImageStyle.ARTISTIC, label: 'Artistic' },
  { value: ImageStyle.CARTOON, label: 'Cartoon' },
  { value: ImageStyle.CYBERPUNK, label: 'Cyberpunk' },
  { value: ImageStyle.WATERCOLOR, label: 'Watercolor' },
];

export function GenerationForm({ onSuccess }: GenerationFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ImageStyle>(ImageStyle.REALISTIC);

  const { generate, abort, status, error, attempt, isRetrying } = useGenerate();

  const isGenerating = status === GenerationStatus.GENERATING;
  const canSubmit = imageFile && prompt.trim().length > 0 && !isGenerating;

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
    } catch (err) {
      // Error is handled by the hook
      console.error('Generation failed', err);
    }
  };

  const handleAbort = () => {
    abort();
  };

  const stylePills = useMemo(
    () =>
      STYLE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setStyle(opt.value as ImageStyle)}
          className={`text-sm px-3 py-1.5 rounded-full border transition inline-flex items-center gap-2
            ${
              style === opt.value
                ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 text-white border-transparent shadow'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          aria-pressed={style === opt.value}
        >
          <span>{opt.label}</span>
        </button>
      )),
    [style]
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* <div className="flex items-center space-x-2">
        <Sparkles className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Image Generation Studio
        </h2>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <ImageUpload
          value={imageFile}
          onChange={setImageFile}
          disabled={isGenerating}
        />

        {/* Prompt Input */}
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="Describe how you want to transform the image..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
            aria-label="Generation prompt"
            required
          />
        </div>

        {/* Style Selector */}
        {/* <div>
          <label
            htmlFor="style"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value as ImageStyle)}
            disabled={isGenerating}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
            aria-label="Generation style"
          >
            {STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div> */}

        {/* STYLE (below prompt) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
          <div className="flex flex-wrap gap-2">{stylePills}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!canSubmit}
            isLoading={isGenerating}
            className="flex-1"
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
              className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
              <p className="text-sm text-yellow-800">
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
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Generation Failed
                </p>
                <p className="text-sm text-red-700 mt-1">
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
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <p className="text-sm text-gray-700">
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
              className="p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm text-green-800 font-medium">
                ✨ Generation completed successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing your image...</span>
              <span>{Math.min((attempt / 3) * 100, 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-blue-600 h-full"
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