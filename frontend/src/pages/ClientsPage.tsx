import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient' 

// --- 型定義 ---
interface Client {
  id: number;
  created_at: string;
  name: string;
  is_active: boolean;
}

// --- UIコンポーネント定義 ---
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

// --- クライアント一覧ページコンポーネント ---

function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true)
      setError(null)
      
      // Supabaseの 'clients' テーブルからデータを取得
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching clients:', error)
        setError(error.message)
        setClients([])
      } else {
        setClients(data || [])
      }
      
      setLoading(false)
    }

    fetchClients()
  }, [])

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
            client={client}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 クライアント管理</h2>
      {renderContent()}
    </div>
  )
}

export default ClientsPage
