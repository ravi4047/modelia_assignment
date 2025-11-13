import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/background_cover.png')`,
            backgroundBlendMode: 'overlay',
          }}
      >
        <div className="absolute inset-0 bg-white/60 " /> 
        {/* backdrop-blur-sm */}
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full px-4">
        {/* Logo + Text Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          {/* Logo Icon (Image) */}
          <div className="w-16 h-16 rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-white">
            <img
              src="/modelia_logo.jpg"
              alt="Modelia Logo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            <span
              style={{
                textShadow: '0 0 2px #fff, 0 0 4px #fff, 0 0 6px #fff',
              }}
            >
              Modelia
            </span>
          </h1>
        </motion.div>

        {/* Form Container */}
        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}