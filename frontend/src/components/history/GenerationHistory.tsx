// src/components/history/GenerationHistory.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Image as ImageIcon } from 'lucide-react';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';
import type { Generation } from '../../types';

interface GenerationHistoryProps {
  refreshTrigger: number;
  onRestore: (generation: Generation) => void;
}

export function GenerationHistory({
  refreshTrigger,
  onRestore,
}: GenerationHistoryProps) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getGenerationHistory(1, 5);
      setGenerations(response.data);
    } catch (err) {
      setError(apiService.getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading && generations.length === 0) {    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 
        p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 
      p-6 space-y-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Generations
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchHistory}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {generations.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No generations yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Create your first image to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-3" role="list">
          {generations.map((generation, index) => (
            <motion.div
              key={generation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex gap-4 p-3 
                border border-gray-200 dark:border-gray-700 rounded-lg 
                hover:border-blue-300 dark:hover:border-blue-600 
                hover:bg-blue-50 dark:hover:bg-blue-900/10 
                transition-all cursor-pointer"
              onClick={() => onRestore(generation)}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRestore(generation);
                }
              }}
              aria-label={`Generation from ${formatDate(generation.createdAt)}: ${generation.prompt}`}
            >
              {/* Thumbnail */}
              <div className="shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden 
                border border-gray-200 dark:border-gray-700">
                <img
                  src={generation.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {generation.prompt}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                    bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300
                    border border-blue-200 dark:border-blue-800">
                    {generation.style}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(generation.createdAt)}
                  </span>
                </div>
                {generation.status === 'completed' && (
                  <span className="inline-flex items-center mt-1 text-xs text-green-600 dark:text-green-400">
                    ✓ Completed
                  </span>
                )}
              </div>

              {/* Hover indicator */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 
                opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Restore →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}