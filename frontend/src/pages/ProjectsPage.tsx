import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useProjectRefresh } from '../App' // ★App.tsxからカスタムフックをインポート

// --- 型定義 ---

// Supabaseのテーブル構造に合わせる
interface Project {
  id: number;
  created_at: string;
  name: string;
  status: string;
  client_id: number;
  clients: { // 'clients'テーブルから結合して取得する情報
    id: number;
    name: string;
  } | null; 
}

// --- UIコンポーネント定義 ---

const ProjectCard = ({ project }: { project: Project }) => {
  // クライアント名を取得（存在しない場合は '不明' とする）
  const clientName = project.clients ? project.clients.name : '不明なクライアント';
  
  // ステータスに応じたバッジの色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '進行中':
        return 'bg-blue-100 text-blue-800';
      case '完了':
        return 'bg-green-100 text-green-800';
      case '保留中':
        return 'bg-yellow-100 text-yellow-800';
      case '未着手':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-card transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        {/* プロジェクト名 */}
        <span className="text-lg font-bold text-gray-900">{project.name}</span>
        {/* ステータス */}
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>
      {/* クライアント名 */}
      <div className="mt-2">
        <span className="text-sm text-gray-500">{clientName}</span>
      </div>
      {/* TODO: 将来的にタスクの進捗などをここに追加 */}
    </div>
  )
}


// --- プロジェクト一覧ページコンポーネント ---

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // ★ App.tsx（親）から「更新フラグ」と「完了報告関数」を受け取る
  const { needsRefresh, onRefreshComplete } = useProjectRefresh();

  // --- データ取得ロジック ---
  const fetchProjects = async () => {
    console.log('プロジェクトデータを取得します...');
    setLoading(true)
    setError(null)
    
    // ★ Supabaseクエリ: 'clients'テーブルから名前を結合して取得 (Foreign Key Join)
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        status,
        client_id,
        clients ( id, name ) 
      `) 
      .order('created_at', { ascending: false }) // 作成日が新しい順

    if (error) {
      console.error('Error fetching projects:', error)
      setError(error.message)
      setProjects([])
    } else {
      // 取得したデータをステートにセット
      setProjects(data || [])
    }
    
    setLoading(false)
    
    // ★ 更新フラグが立っていた場合、親に完了を報告
    if (needsRefresh) { 
      onRefreshComplete(); 
    }
  }

  // 1. マウント時の初期データ取得
  useEffect(() => {
    fetchProjects()
  }, []) 

  // 2. 更新フラグの監視（プロジェクト作成後など）
  useEffect(() => {
    if (needsRefresh) {
      console.log('（更新フラグを検知）プロジェクト一覧を再取得します。');
      fetchProjects();
    }
  }, [needsRefresh]); // needsRefresh が true に変わったら実行


  // --- ローディング・エラー表示 ---
  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8">プロジェクトを読み込み中...</div>
    }
    
    if (error) {
      return <div className="text-center p-8 text-red-600">エラーが発生しました: {error}</div>
    }
    
    if (projects.length === 0) {
      return <div className="text-center p-8 text-gray-500">プロジェクトがありません。</div>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 プロジェクト一覧</h2>
      {renderContent()}
    </div>
  )
}

export default ProjectsPage
