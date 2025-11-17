import React, { ButtonHTMLAttributes } from 'react';

// ボタンの色やスタイルをTailwindで指定
const baseStyle = 'px-4 py-2 font-semibold rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50';

// プライマリーボタン（青）
const primaryStyle = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg';

// セカンダリーボタン（グレー/白）
const secondaryStyle = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 focus:ring-gray-300 shadow-sm';

// 警告/削除ボタン（赤）
const dangerStyle = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md';

// テキストリンク風ボタン
const linkStyle = 'text-blue-600 hover:text-blue-700 bg-transparent shadow-none border-none p-0';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  let style = primaryStyle;
  
  switch (variant) {
    case 'secondary':
      style = secondaryStyle;
      break;
    case 'danger':
      style = dangerStyle;
      break;
    case 'link':
      style = linkStyle;
      break;
  }
  
  return (
    <button
      className={`${baseStyle} ${style} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
