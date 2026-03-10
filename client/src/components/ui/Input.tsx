import type React from 'react';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => (
  <input
    className="w-full bg-white border border-card-border focus:border-pipe-green focus:ring-2 focus:ring-pipe-green/30
      rounded-xl px-4 py-3 text-base text-text-dark placeholder-gray-400 outline-none transition-all"
    {...props}
  />
);
