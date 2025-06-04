"use client"
import React from 'react';

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  type?: 'text' | 'email' | 'password' | 'number';
  large?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
}

export default function InputField({
  label,
  placeholder,
  value,
  type = 'text',
  large = false,
  onChange,
  className = '',
}: InputFieldProps) {
  const inputStyles = `
    w-full
    px-4
    py-2
    rounded-lg
    border
    border-gray-300
    bg-white dark:bg-gray-600
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
          onChange={onChange}
          className={`${inputStyles} min-h-[120px] resize-y`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={inputStyles}
        />
      )}
    </div>
  );
}
