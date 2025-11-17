import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useProjectRefresh } from '../App';
import Button from '../components/UI/Button';

// --- 型定義 ---

// タスクデータ（ProjectとClient情報を含む）
interface Task {
  id: number;
  name: string;
  status: string;
  due_date: string | null;
  project_id: number;
  projects: { 
    name: string;
    clients: { name: string } | null;
  } | null;
}

// --- UIコンポーネント定義 ---

const TaskRow = ({ task }: { task: Task }) => {
  const projectName = task.projects?.name || '不明なプロジェクト';
  
  // ステータスに応じたバッジの色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '進行中':
        return 'bg-blue-100 text-blue-800';
      case '完了':
        return 'bg-green-100 text-green-800';
      case '未着手':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{projectName}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-600 hover:text-blue-600">詳細</button>
      </td>
    </tr>
  );
}


// --- メインコンポーネント ---

function HomePage() {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // App.tsxからの更新フラグを受け取る
  const { needsRefresh, onRefreshComplete } = useProjectRefresh();

  // --- データ取得ロジック ---
  const fetchTodayTasks = async () => {
    console.log("本日のタスクデータを取得します...");
    setLoading(true);
    setError(null);

    // 本日の日付を取得し、'YYYY-MM-DD' 形式に整形
    const today = new Date().toISOString().split('T')[0];
    
    // Supabase RPC (Stored Procedure) を使用すると、日付比較が容易になるが、
    // ここでは単純な日付比較が可能なようにクエリを構築
    
    // 期限日が今日の日付と一致するタスクを取得
    const { data, error } = await supabase
        .from('tasks')
        .select(`
            id, name, status, due_date, project_id,
            projects ( name, clients ( name ) ) 
        `)
        .eq('due_date', today) 
        .neq('status', '完了') // 完了済みのタスクは除外
        .order('status', { ascending: true }) // ステータス順でソート（DB側でのソートは限界があるため、フロントで調整が必要な場合もある）


    if (error) {
        console.error('Error fetching today tasks:', error);
        setError(error.message);
        setTodayTasks([]);
    } else {
        setTodayTasks(data || []);
    }

    setLoading(false);
    
    if (needsRefresh) { 
      onRefreshComplete(); 
    }
  };


  useEffect(() => {
    fetchTodayTasks();
  }, []); 

  useEffect(() => {
    if (needsRefresh) {
      console.log('（更新フラグを検知）HOME画面のデータを再取得します。');
      fetchTodayTasks();
    }
  }, [needsRefresh]); 

  // --- Today's Tasksのレンダリング関数 ---
  const renderTodayTasks = () => {
    if (loading) {
      return <div className="p-8 text-center text-gray-500">本日のタスクを読み込んでいます...</div>;
    }
    
    if (error) {
      return <div className="p-8 text-center text-red-600">エラー: {error}</div>;
    }
    
    if (todayTasks.length === 0) {
      return <div className="p-8 text-center text-gray-500"><p>本日が期限の未完了タスクはありません。</p></div>;
    }

    return (
      <div className="content-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* ソート: 進行中 > 未着手 > 保留中 */}
            {todayTasks
                .sort((a, b) => {
                    const order = { '進行中': 1, '未着手': 2, '保留中': 3, '完了': 4 };
                    return (order[a.status as keyof typeof order] || 5) - (order[b.status as keyof typeof order] || 5);
                })
                .map(task => (
                    <TaskRow key={task.id} task={task} />
                ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        
      {/* 1. Today's Tasks */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📅 Today's Tasks</h2>
            {/* 新規タスクボタンは App.tsx にあるため不要 */}
        </div>
        {renderTodayTasks()}
      </section>

      {/* 2. Project List / Timeline */}
      <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Project List</h2>
          {/* ProjectsPageの代わりに、ProjectsPageを直接インポートして表示 */}
          {/* <ProjectsPage /> としたいが、Routerの制約があるため、一旦ダミーで代替 */}
          <div className="content-card p-6 min-h-[300px]">
             <p className="text-gray-500">（プロジェクト一覧は、ナビゲーションバーの「プロジェクト管理」からアクセスしてください。ここにタイムライングラフを統合する予定です。）</p>
          </div>
      </section>
    </div>
  );
}

export default HomePage;
