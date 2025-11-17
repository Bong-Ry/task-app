import { useState } from 'react'
// import { supabase } from './supabaseClient' // 将来的にコメントを解除

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

// モーダルキャンセルボタン（GASアプリのスタイルを継承）
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


// コア原則: カード型レイアウト（白背景、box-shadow）
const ClientCard = ({ 
  clientName, 
  active 
}: { 
  clientName: string, 
  active: boolean 
}) => (
  <div className="bg-white p-6 rounded-lg shadow-card cursor-pointer transition-all hover:shadow-lg">
    <div className="flex justify-between items-center">
      <span className="text-lg font-bold">{clientName}</span>
      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
        active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-500'
      }`}>
        {active ? 'Active' : 'Inactive'}
      </span>
    </div>
    {/* 将来的に: クリックすると詳細ページに飛ぶ <Link> にする */}
  </div>
)

// --- メインのAppコンポーネント ---

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // モックデータ（将来的にSupabaseから取得）
  const clients = [
    { id: 1, name: '株式会社クライアントA', active: true },
    { id: 2, name: '株式会社クライアントB', active: true },
    { id: 3, name: '株式会社クライアントC', active: false },
  ];

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

      {/* --- メインコンテンツ (クライアント一覧) --- */}
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <ClientCard 
              key={client.id} 
              clientName={client.name} 
              active={client.active} 
            />
          ))}
        </div>
      </main>

      {/* --- 新規プロジェクト登録モーダル (プレースホルダー) --- */}
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
