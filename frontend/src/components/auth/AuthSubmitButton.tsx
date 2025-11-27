import React from 'react';
import { Button } from '../ui/Button';

interface AuthSubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  type?: 'submit' | 'button';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function AuthSubmitButton({ children, isLoading, type = 'submit', onClick }: AuthSubmitButtonProps) {
  return (
    <Button
      type={type}
      isLoading={isLoading}
      className="w-full bg-linear-to-r from-[#E98FA6] via-[#B380DA] to-[#6556FF] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
