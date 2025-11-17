// src/components/CreateMeetingModal.tsx (修正・全文)
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Button from './UI/Button'; 

// --- 型定義 ---

interface Client {
  id: number;
  name: string;
  is_active: boolean;
}

// --- モーダルのProps（親から渡されるもの） ---
interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: () => void; // 作成成功時に親コンポーネントに通知する関数
}

// --- UIコンポーネント定義 ---

const ModalCancelButton = ({ 
  children, 
  onClick 
}: { 
  children: React.ReactNode, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    {children}
  </button>
)


// --- メインコンポーネント ---

export function CreateMeetingModal({ isOpen, onClose, onMeetingCreated }: CreateMeetingModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  
  // --- フォーム入力値用のState ---
  const [selectedClientId, setSelectedClientId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // 当日をデフォルト値に
  const [fileUrl, setFileUrl] = useState(''); 
  const [summary, setSummary] = useState(''); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ★新しい入力フィールドスタイル (AuthPageと統一)
  const inputStyle = "w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150";


  // --- クライアント一覧をプルダウン用に取得 ---
  useEffect(() => {
    if (isOpen) {
      const fetchClientsForSelect = async () => {
        setIsLoadingClients(true);
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, is_active')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching clients for modal:', error);
          setError('クライアントの読込に失敗しました。');
        } else {
          setClients(data || []);
        }
        setIsLoadingClients(false);
      }
      fetchClientsForSelect();
    }
  }, [isOpen]); // モーダルが開いた時に実行

  // --- ★保存ボタン（データ登録）処理 ---
  const handleSubmit = async () => {
    if (!selectedClientId || !title || !date) {
      setError('クライアント、タイトル、日付は必須です。');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('meetings') // ★ Supabaseの 'meetings' テーブルを指定
      .insert({ 
        client_id: selectedClientId, 
        title: title, 
        date: date,
        file_url: fileUrl || null,
        summary: summary || null,
      })

    setIsSubmitting(false);

    if (insertError) {
      console.error('Error creating meeting:', insertError);
      setError(`登録に失敗しました: ${insertError.message}`);
    } else {
      // 成功
      onMeetingCreated(); // 親に通知
      handleClose();      // モーダルを閉じる
    }
  }

  // --- モーダルを閉じる時のリセット処理 ---
  const handleClose = () => {
    setTitle('');
    setSelectedClientId('');
    setDate(new Date().toISOString().split('T')[0]);
    setFileUrl('');
    setSummary('');
    setError(null);
    setIsSubmitting(false);
    onClose(); // 親コンポーネントに「閉じて」と伝える
  }

  if (!isOpen) {
    return null;
  }
  
  const activeClients = clients.filter(c => c.is_active);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        {/* モーダルヘッダー */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">新規議事録登録</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800 text-3xl font-bold"
          >
            &times;
          </button>
        </div>
        
        {/* モーダルボディ（フォーム） */}
        <div className="p-6 space-y-4">
          
          <div className='grid grid-cols-2 gap-4'>
            {/* クライアント選択 */}
            <div>
              <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-1">
                クライアント <span className="text-red-500">*</span>
              </label>
              <select
                id="client-select"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className={inputStyle}
              >
                <option value="">-- クライアントを選択 --</option>
                {activeClients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 日付選択 */}
            <div>
              <label htmlFor="meeting-date" className="block text-sm font-medium text-gray-700 mb-1">
                日付 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="meeting-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>
          
          {/* タイトル */}
          <div>
            <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputStyle}
              placeholder="例: 第3回 定例ミーティング議事録"
            />
          </div>

          {/* ファイル URL */}
          <div>
            <label htmlFor="meeting-url" className="block text-sm font-medium text-gray-700 mb-1">
              ファイル URL (Google Drive, Notionなど)
            </label>
            <input
              type="url"
              id="meeting-url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className={inputStyle}
              placeholder="https://drive.google.com/..."
            />
          </div>

          {/* サマリー */}
          <div>
            <label htmlFor="meeting-summary" className="block text-sm font-medium text-gray-700 mb-1">
              サマリー / 備考
            </label>
            <textarea
              id="meeting-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className={`${inputStyle} resize-none`}
              placeholder="決定事項やネクストアクションの要約"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </div>
        
        {/* モーダルフッター */}
        <div className="flex justify-end p-4 border-t bg-gray-50 space-x-3">
          <ModalCancelButton onClick={handleClose}>
            キャンセル
          </ModalCancelButton>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isLoadingClients}
            variant="primary"
          >
            {isSubmitting ? '登録中...' : '議事録登録'}
          </Button>
        </div>
      </div>
    </div>
  )
}
