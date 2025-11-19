// src/pages/StudioPage.tsx

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GenerationForm } from '../components/generation/GenerationForm';
import { GenerationHistory } from '../components/history/GenerationHistory';
import type { Generation, ImageStyle } from '../types';

export interface RestoreData {
  imageUrl: string;
  prompt: string;
  // style: string;
  style: ImageStyle
}

export function StudioPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [restoreData, setRestoreData] = useState<RestoreData | null>(null);

  // Ref to trigger restoration in GenerationForm
  const restoreTriggerRef = useRef(0);


  const handleGenerationSuccess = () => {
    // Trigger history refresh
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRestore = async (generation: Generation) => {
    console.log('Restoring generation:', generation);
    
    // Set the restore data which will be picked up by GenerationForm
    setRestoreData({
      imageUrl: generation.imageUrl,
      prompt: generation.prompt,
      style: generation.style,
    });
    
    // Increment trigger to notify GenerationForm
    restoreTriggerRef.current += 1;
    
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestoreComplete = () => {
    // Clear restore data after it's been processed
    setRestoreData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Image Generation Studio
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Transform your images with AI-powered artistic styles
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Form - Takes 2 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <GenerationForm 
              onSuccess={handleGenerationSuccess}
              restoreData={restoreData}
              restoreTrigger={restoreTriggerRef.current}
              onRestoreComplete={handleRestoreComplete}
            />
          </motion.div>

          {/* History - Takes 1 column on large screens */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <GenerationHistory
              refreshTrigger={refreshTrigger}
              onRestore={handleRestore}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}