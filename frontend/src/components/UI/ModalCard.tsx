import React from 'react';

interface ModalCardProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    footerButtons: React.ReactNode;
    maxWidthClass?: string;
}

const ModalCard: React.FC<ModalCardProps> = ({ 
    title, 
    children, 
    onClose, 
    footerButtons, 
    maxWidthClass = 'max-w-2xl' 
}) => {
    return (
        // 1. オーバーレイ (暗い背景)
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* 2. モーダル本体 (白いカード) */}
            <div 
                className={`bg-white rounded-xl shadow-2xl w-full ${maxWidthClass}`} 
                onClick={(e) => e.stopPropagation()} // オーバーレイへの伝播を停止
            >
                {/* ヘッダー */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-2xl font-bold transition duration-150"
                    >
                        &times;
                    </button>
                </div>
                
                {/* ボディ (コンテンツ) */}
                <div className="p-6">
                    {children}
                </div>
                
                {/* フッター */}
                <div className="flex justify-end p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl space-x-3">
                    {footerButtons}
                </div>
            </div>
        </div>
    );
};

export default ModalCard;
