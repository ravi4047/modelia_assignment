// src/pages/StudioPage.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GenerationForm } from '../components/generation/GenerationForm';
import { GenerationHistory } from '../components/history/GenerationHistory';
import type { Generation } from '../types';

export function StudioPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleGenerationSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRestore = (generation: Generation) => {
    console.log('Restoring generation:', generation);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Minimal Page Header
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900">Studio</h2>
          <p className="text-sm text-gray-500">
            Generate and manage your AI-created images.
          </p>
        </motion.div> */}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Generation Form */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Generate Image
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload an image and apply artistic transformations.
              </p>

              <GenerationForm onSuccess={handleGenerationSuccess} />
            </div>
          </motion.div>

          {/* Generation History */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6 bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                History
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                Recent generations
              </p>

              <GenerationHistory
                refreshTrigger={refreshTrigger}
                onRestore={handleRestore}
              />

              <button
                onClick={() => setRefreshTrigger((v) => v + 1)}
                className="w-full mt-4 px-3 py-2 text-sm rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              >
                Refresh
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
