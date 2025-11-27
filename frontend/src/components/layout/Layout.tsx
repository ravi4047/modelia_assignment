// src/components/layout/Layout.tsx

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmModal } from '../ui/ConfirmModal';
import { DarkToggle } from '../ui/DarkToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  // dropdown state & refs for click-outside
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // add state
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleDocClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              {/* Logo: use public/modelia_logo.jpg */}
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                <img
                  src="/modelia_logo.jpg"
                  alt="Modelia"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Modelia
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Image Generation Studio
                </p>
              </div>
            </div>

            {/* Right side: profile dropdown */}
            <div className="flex items-center gap-3">
              {/* New Generation Button */}
              <button
                onClick={() => window.location.href = '/studio'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                  text-white font-medium text-sm shadow-md
                  bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600
                  hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700
                  dark:from-pink-400 dark:via-purple-400 dark:to-indigo-500
                  dark:hover:from-pink-500 dark:hover:via-purple-500 dark:hover:to-indigo-600
                  transition-all duration-200"
              >
                <span>New Generation</span>
              </button>

              {/* Docs Button */}
              <button
                className="inline-flex items-center gap-2 px-3 py-2 
                  rounded-md bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700
                  text-sm text-gray-700 dark:text-gray-300 
                  shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 
                  transition-all duration-200"
              >
                Docs
              </button>

              {/* Dark Toggle */}
              <DarkToggle />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 
                    bg-white dark:bg-gray-800 
                    border border-gray-200 dark:border-gray-700 
                    rounded-full shadow-sm hover:shadow-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500
                    dark:focus:ring-offset-gray-900
                    transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <User className="w-6 h-6 text-gray-400 dark:text-gray-500 m-1" />
                  </div>
                  <span className="hidden sm:inline-block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.email?.split?.('@')?.[0] ?? 'Profile'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown panel */}
                {open && (
                  <div
                    ref={panelRef}
                    role="menu"
                    aria-orientation="vertical"
                    className="absolute right-0 mt-2 w-56 
                      bg-white dark:bg-gray-800 
                      border border-gray-100 dark:border-gray-700 
                      rounded-lg shadow-lg dark:shadow-gray-900/50 
                      z-50 overflow-hidden animate-fade-in"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {user?.email ?? '—'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenConfirm(true)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 
                        hover:bg-gray-50 dark:hover:bg-gray-700 
                        transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* ConfirmModal */}
      <ConfirmModal 
        open={openConfirm}
        title="Log out?"
        description="You will be logged out of your account on this device. Are you sure you want to log out?"
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() => {
          setOpenConfirm(false);
          setOpen(false);
          logout();
        }}
        confirmText="Log out"
        cancelText="Cancel"
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Modelia. Built with React, TypeScript, and Express.
          </p>
        </div>
      </footer>
    </div>
  );
}