import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Button from './UI/Button' // Buttonをインポート (MainButtonから変更)

// --- UIコンポーネント定義（モーダル内で使うもの） ---
// NOTE: MainButtonはButtonに統一されたため、ここではModalCancelButtonのみ再定義
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

// --- 型定義 ---
interface Client {
  id: number;
  name: string;
}

// --- モーダルのProps（親から渡されるもの） ---
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void; // ★作成成功時に親コンポーネントに通知する関数
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  
  // --- フォーム入力値用のState ---
  const [selectedClientId, setSelectedClientId] = useState('')
  const [projectName, setProjectName] = useState('')
  const [status, setStatus] = useState('未着手') // デフォルト値
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ★新しい入力フィールドスタイル (AuthPageと統一)
  const inputStyle = "w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150";


  // --- クライアント一覧をプルダウン用に取得 ---
  useEffect(() => {
    if (isOpen) {
      const fetchClientsForSelect = async () => {
        setIsLoadingClients(true)
        const { data, error } = await supabase
          .from('clients')
          .select('id, name') // 必要なカラムだけ取得
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (error) {
          console.error('Error fetching clients for modal:', error)
          setError('クライアントの読込に失敗しました。')
        } else {
          setClients(data || [])
        }
        setIsLoadingClients(false)
      }
      fetchClientsForSelect()
    }
  }, [isOpen]) // モーダルが開いた時に実行

  // --- ★保存ボタン（データ登録）処理 ---
  const handleSubmit = async () => {
    if (!selectedClientId || !projectName || !status) {
      setError('クライアント、プロジェクト名、ステータスは必須です。')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('projects') // ★Supabaseの 'projects' テーブルを指定
      .insert({ 
        name: projectName, 
        client_id: selectedClientId, // ★DBのカラム名に合わせる
        status: status,
        // created_at や id はDB側で自動設定される
      })

    setIsSubmitting(false)

    if (insertError) {
      console.error('Error creating project:', insertError)
      setError(`登録に失敗しました: ${insertError.message}`)
    } else {
      // 成功
      onProjectCreated() // 親に通知（例: プロジェクト一覧を再読み込みさせるため）
      handleClose()     // モーダルを閉じる
    }
  }

  // --- モーダルを閉じる時のリセット処理 ---
  const handleClose = () => {
    setProjectName('')
    setSelectedClientId('')
    setStatus('未着手')
    setError(null)
    setIsSubmitting(false)
    onClose() // 親コンポーネントに「閉じて」と伝える
  }

  if (!isOpen) {
    return null // 開いていなければ何も表示しない
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* モーダルヘッダー */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">新規プロジェクト登録</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800 text-3xl font-bold"
          >
            &times;
          </button>
        </div>
        
        {/* モーダルボディ（★フォームに変更） */}
        <div className="p-6 space-y-4">
          {isLoadingClients ? (
            <p>クライアントを読み込み中...</p>
          ) : (
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
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
              プロジェクト名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={inputStyle}
              placeholder="例: 2025年度 新規Webサイト構築"
            />
          </div>

          <div>
            <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 mb-1">
              ステータス <span className="text-red-500">*</span>
            </label>
            <select
              id="project-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputStyle}
            >
              <option value="未着手">未着手</option>
              <option value="進行中">進行中</option>
              <option value="保留中">保留中</option>
              <option value="完了">完了</option>
            </select>
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
            {isSubmitting ? '登録中...' : '保存する'}
          </Button>
        </div>
      </div>
    </div>
  )
}
