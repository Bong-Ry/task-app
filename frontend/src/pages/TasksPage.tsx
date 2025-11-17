import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useProjectRefresh } from '../App' // App.tsxからカスタムフックをインポート

// --- 型定義 ---

interface Task {
  id: number;
  created_at: string;
  name: string;
  status: string;
  due_date: string | null;
  project_id: number;
  // ★ 'projects'テーブルから結合して取得する情報
  projects: { 
    name: string;
    // ★ さらに 'clients'テーブルから名前を結合して取得
    clients: { name: string } | null;
  } | null;
}

// --- UIコンポーネント定義 ---

const TaskRow = ({ task }: { task: Task }) => {
  const projectName = task.projects?.name || '不明なプロジェクト';
  const clientName = task.projects?.clients?.name || 'クライアント不明';
  const fullProjectName = `${projectName} (${clientName})`;

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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.name}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fullProjectName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-600 hover:text-blue-600">詳細</button>
      </td>
    </tr>
  );
}


// --- タスク一覧ページコンポーネント ---

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ★ App.tsx（親）から「更新フラグ」と「完了報告関数」を受け取る
  const { needsRefresh, onRefreshComplete } = useProjectRefresh();

  // --- データ取得ロジック ---
  const fetchTasks = async () => {
    console.log('タスクデータを取得します...');
    setLoading(true);
    setError(null);
    
    // ★ Supabaseクエリ: projects, clients の二重結合 (Nested Join)
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id,
        name,
        status,
        due_date,
        project_id,
        projects ( 
          name, 
          clients ( name ) 
        ) 
      `) 
      .order('due_date', { ascending: true, nullsFirst: false }) // 期限が近い順

    if (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
      setTasks([]);
    } else {
      setTasks(data || []);
    }
    
    setLoading(false);
    
    // ★ 更新フラグが立っていた場合、親に完了を報告
    if (needsRefresh) { 
      onRefreshComplete(); 
    }
  }

  // 1. マウント時の初期データ取得
  useEffect(() => {
    fetchTasks();
  }, []); 

  // 2. 更新フラグの監視（タスク作成後など）
  useEffect(() => {
    if (needsRefresh) {
      console.log('（更新フラグを検知）タスク一覧を再取得します。');
      fetchTasks();
    }
  }, [needsRefresh]); 


  // --- ローディング・エラー表示 ---
  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8">タスクを読み込み中...</div>;
    }
    
    if (error) {
      return <div className="text-center p-8 text-red-600">エラーが発生しました: {error}</div>;
    }
    
    if (tasks.length === 0) {
      return <div className="text-center p-8 text-gray-500">タスクがありません。</div>;
    }

    return (
      <div className="content-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タスク名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期限日</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">プロジェクト</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 タスク管理</h2>
      {renderContent()}
    </div>
  );
}

export default TasksPage;
