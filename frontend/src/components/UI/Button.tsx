// src/components/UI/Button.tsx (新規ファイル)
import React from 'react';

// MainButton コンポーネント
const Button = ({ 
  children, 
  onClick,
  disabled = false,
  className = ""
}: { 
  children: React.ReactNode, 
  onClick: () => void,
  disabled?: boolean,
  className?: string
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`border border-gray-800 text-gray-800 font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-gray-800 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 ${className}`}
  >
    {children}
  </button>
)

export default Button;
