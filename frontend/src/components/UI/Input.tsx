import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// 基本となる入力フィールドのスタイル (ここで全てのユーティリティクラスを定義)
const baseInputStyle = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // input専用
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  // select専用
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  // textarea専用
}

// 汎用的なInputコンポーネネント
export const Input: React.FC<InputProps> = (props) => {
  return <input {...props} className={`${baseInputStyle} ${props.className || ''}`} />;
};

// 汎用的なSelectコンポーネネント
export const Select: React.FC<SelectProps> = (props) => {
  return <select {...props} className={`${baseInputStyle} ${props.className || ''}`} />;
};

// 汎用的なTextareaコンポーネネント
export const Textarea: React.FC<TextareaProps> = (props) => {
  return <textarea {...props} className={`${baseInputStyle} resize-none ${props.className || ''}`} />;
};
