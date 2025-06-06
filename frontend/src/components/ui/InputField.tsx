"use client"
import React, { useEffect } from 'react';

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  type?: 'text' | 'email' | 'password' | 'number';
  large?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
  name?: string; // For identifying the field in storage
}

const APP_PREFIX = 'chromion';

export default function InputField({
  label,
  placeholder,
  value,
  type = 'text',
  large = false,
  onChange,
  className = '',
  name,
}: InputFieldProps) {
  const storageKey = `${APP_PREFIX}:${name || label.toLowerCase().replace(/\s+/g, '-')}`;

  // Load saved value on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedValue = localStorage.getItem(storageKey);
      if (savedValue && savedValue !== value) {
        const event = {
          target: { value: savedValue }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e);
    if (typeof window !== 'undefined') {
      if (e.target.value) {
        localStorage.setItem(storageKey, e.target.value);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  };

  // Function to clear storage (can be called by parent)
  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };

  const inputStyles = `
    w-full
    px-4
    py-2
    rounded-lg
    border
    border-gray-300
    bg-white dark:bg-gray-800
    focus:outline-none
    focus:ring-2
    focus:ring-green-500
    focus:border-transparent
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    text-gray-900 dark:text-gray-100
    ${className}
  `;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {large ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={`${inputStyles} min-h-[120px] resize-y`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={inputStyles}
        />
      )}
    </div>
  );
}
