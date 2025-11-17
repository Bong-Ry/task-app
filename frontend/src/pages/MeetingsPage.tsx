import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useProjectRefresh } from '../App';
import Button from '../components/UI/Button';

// --- 型定義 ---

interface Meeting {
  id: number;
  created_at: string;
  title: string;
  date: string;
  file_url: string | null;
  summary: string | null;
  client_id: number;
  // ★ clientsテーブルから結合して取得する情報
  clients: { name: string } | null;
}

interface Client {
  id: number;
  name: string;
}

// --- UIコンポーネント定義 ---

const MeetingRow = ({ meeting }: { meeting: Meeting }) => {
  const clientName = meeting.clients?.name || '不明なクライアント';
  const meetingDate = new Date(meeting.date).toLocaleDateString();

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meeting.title}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meetingDate}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{clientName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {meeting.file_url ? (
          <a href={meeting.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            ファイルを開く
          </a>
        ) : (
          'N/A'
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-600 hover:text-blue-600">詳細</button>
      </td>
    </tr>
  );
}


// --- メインコンポーネント ---

function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { needsRefresh, onRefreshComplete } = useProjectRefresh();


  // --- クライアント一覧の取得（プルダウン用） ---
  const fetchClients = async () => {
    const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name', { ascending: true });
    
    if (error) {
        console.error("Error fetching clients for selector:", error);
        return [];
    }
    setClients(data || []);
    return data || [];
  };

  // --- 議事録データ取得ロジック ---
  const fetchMeetings = async (clientId: string) => {
    console.log(`議事録データを取得します。Client ID: ${clientId}`);
    setLoading(true);
    setError(null);

    // ★ Supabaseクエリ: client_idでフィルタし、clientsテーブルを結合
    let query = supabase
        .from('meetings')
        .select(`
            id, title, date, file_url, client_id,
            clients ( name )
        `)
        .order('date', { ascending: false });

    if (clientId) {
        query = query.eq('client_id', clientId);
    }
        
    const { data, error } = await query;

    if (error) {
        console.error('Error fetching meetings:', error);
        setError(error.message);
        setMeetings([]);
    } else {
        setMeetings(data || []);
    }

    setLoading(false);
    
    if (needsRefresh) { 
      onRefreshComplete(); 
    }
  };


  useEffect(() => {
    fetchClients();
  }, []);

  // 1. クライアントが選択されたとき、またはリフレッシュ要求があったときに実行
  useEffect(() => {
    // 初回ロード時、またはリフレッシュ要求時
    if (selectedClientId || needsRefresh) {
        fetchMeetings(selectedClientId);
    } else if (clients.length > 0 && !selectedClientId) {
        // クライアントデータがロードされたが、まだ何も選択されていない場合は全件取得（または何もしない）
        // ここでは、一旦全件取得はせず、選択を促す状態を維持します。
    }
    
    if (needsRefresh && !selectedClientId) {
      // 登録完了後の自動リフレッシュのために、選択中のクライアントで再取得
      fetchMeetings(selectedClientId);
    }
  }, [selectedClientId, needsRefresh]); 


  // --- 議事録リストのレンダリング関数 ---
  const renderMeetings = () => {
    if (loading) {
      return <div className="p-8 text-center text-gray-500">議事録を読み込んでいます...</div>;
    }
    
    if (error) {
      return <div className="p-8 text-center text-red-600">エラー: {error}</div>;
    }
    
    if (meetings.length === 0) {
        if (!selectedClientId) {
            return <div className="p-8 text-center text-gray-500"><p>クライアントを選択すると、議事録が表示されます。</p></div>;
        }
        return <div className="p-8 text-center text-gray-500"><p>このクライアントの議事録は登録されていません。</p></div>;
    }

    return (
      // ★修正: ユーティリティを直接適用
      <div className="bg-white p-6 rounded-xl shadow-lg transition-shadow duration-300 overflow-hidden mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">クライアント</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ファイル</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {meetings.map(meeting => (
              <MeetingRow key={meeting.id} meeting={meeting} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📑 議事録管理</h2>
      
      {/* クライアント選択フィルター */}
      <div className="flex justify-between items-center mb-4">
        <div className="max-w-md w-full">
            <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-1">
                クライアントで絞り込み
            </label>
            <select
                id="client-select"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
            >
                <option value="">-- すべてのクライアント --</option>
                {clients.map(client => (
                    <option key={client.id} value={client.id}>
                        {client.name}
                    </option>
                ))}
            </select>
        </div>
        
        {/* 新規議事録ボタン（App.tsxに移動するが、ここで仮表示） */}
        <Button 
            onClick={() => alert("新規議事録モーダルは次のステップで実装します")}
            disabled={!selectedClientId} // クライアントが選択されていないと登録不可
        >
            ＋ 新規議事録
        </Button>
      </div>

      {renderMeetings()}
    </div>
  );
}

export default MeetingsPage;
