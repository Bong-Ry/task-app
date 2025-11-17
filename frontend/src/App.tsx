import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient' // 作成したSupabaseクライアントをインポート

// --- 型定義 ---
// Supabaseの 'clients' テーブルの構造に合わせる
interface Client {
  id: number;
  created_at: string;
  name: string;
  is_active: boolean;
}

// --- UIコンポーネント定義 ---

// コア原則: 黒枠線、ホバーで黒反転
const MainButton = ({ 
  children, 
  onClick,
  className = ""
}: { 
  children: React.ReactNode, 
  onClick: () => void,
  className?: string
}) => (
  <button
    onClick={onClick}
    className={`border border-gray-800 text-gray-800 font-medium py-2 px-4 rounded-md transition-all duration-300 hover:bg-gray-800 hover:text-white ${className}`}
  >
    {children}
  </button>
)

// モーダルキャンセルボタン
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

// コア原則: カード型レイアウト（Client型を受け取るように変更）
const ClientCard = ({ client }: { client: Client }) => (
  <div className="bg-white p-6 rounded-lg shadow-card cursor-pointer transition-all hover:shadow-lg">
    <div className="flex justify-between items-center">
      <span className="text-lg font-bold">{client.name}</span>
      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
        client.is_active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-500'
      }`}>
        {client.is_active ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>
)

// --- メインのAppコンポーネント ---

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // --- Supabase データ取得ロジック ---
  const [clients, setClients] = useState<Client[]>([]) // Client型の配列としてステートを定義
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // データを取得する非同期関数を定義
    const fetchClients = async () => {
      setLoading(true)
      setError(null)
      
      // Supabaseの 'clients' テーブルから全ての列(*)を選択
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true }) //名前順でソート

      if (error) {
        console.error('Error fetching clients:', error)
        setError(error.message)
        setClients([])
      } else {
        setClients(data || [])
      }
      
      setLoading(false)
    }

    // 関数を実行
    fetchClients()
  }, []) // 第2引数が空配列 [] なので、コンポーネントのマウント時に1回だけ実行されます

  // --- ローディング・エラー表示 ---
  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8">データを読み込み中...</div>
    }
    
    if (error) {
      return <div className="text-center p-8 text-red-600">エラーが発生しました: {error}</div>
    }
    
    if (clients.length === 0) {
      return <div className="text-center p-8 text-gray-500">クライアントデータがありません。</div>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <ClientCard 
            key={client.id} 
            client={client} // clientオブジェクト全体を渡す
          />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* --- ヘッダー --- */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          プロジェクト管理
        </h1>
        <div className="flex space-x-4">
          <MainButton onClick={() => alert('クライアント一覧へ')}>
            クライアント管理
          </MainButton>
          <MainButton onClick={() => setIsModalOpen(true)}>
            ＋ 新規プロジェクト
          </MainButton>
        </div>
      </header>

      {/* --- メインコンテンツ (Supabaseから取得したデータ) --- */}
      <main>
        {renderContent()}
      </main>

      {/* --- 新規プロジェクト登録モーダル (変更なし) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            {/* モーダルヘッダー */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">新規プロジェクト登録</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-3xl font-bold"
              >
                &times;
              </button>
            </div>
            
            {/* モーダルボディ */}
            <div className="p-6">
              <p>ここにタイムラインやタスクのフォームが入ります。</p>
            </div>
            
            {/* モーダルフッター */}
            <div className="flex justify-end p-4 border-t bg-gray-50 space-x-3">
              <ModalCancelButton onClick={() => setIsModalOpen(false)}>
                キャンセル
              </ModalCancelButton>
              <MainButton onClick={() => alert('保存処理')}>
                保存する
              </MainButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
