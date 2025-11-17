import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Button from './UI/Button'; // 汎用ボタンをインポート

// --- 型定義 ---

interface Client {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
  client_id: number;
  // ★ クライアント名を表示するために、結合して取得する
  clients: Pick<Client, 'name'> | null; 
}

// --- モーダルのProps（親から渡されるもの） ---
interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void; // 作成成功時に親コンポーネントに通知する関数
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

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  // --- フォーム入力値用のState ---
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('未着手'); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const taskStatusOptions = ['未着手', '進行中', '保留中', '完了'];


  // --- プロジェクト一覧をプルダウン用に取得 ---
  useEffect(() => {
    if (isOpen) {
      const fetchProjectsForSelect = async () => {
        setIsLoadingProjects(true);
        // projects テーブルから ID, name, status, そしてクライアント名を取得
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id, 
            name, 
            status, 
            clients ( name )
          `) 
          .neq('status', '完了') // 完了していないプロジェクトのみ表示
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching projects for modal:', error);
          setError('プロジェクトの読込に失敗しました。');
        } else {
          setProjects(data || []);
        }
        setIsLoadingProjects(false);
      }
      fetchProjectsForSelect();
    }
  }, [isOpen]); // モーダルが開いた時に実行

  // --- ★保存ボタン（データ登録）処理 ---
  const handleSubmit = async () => {
    if (!selectedProjectId || !taskName || !status) {
      setError('プロジェクト、タスク名、ステータスは必須です。');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('tasks') // ★ Supabaseの 'tasks' テーブルを指定
      .insert({ 
        project_id: selectedProjectId, 
        name: taskName, 
        status: status,
        due_date: dueDate || null, // 空欄の場合は null を渡す
      })

    setIsSubmitting(false);

    if (insertError) {
      console.error('Error creating task:', insertError);
      setError(`登録に失敗しました: ${insertError.message}`);
    } else {
      // 成功
      onTaskCreated(); // 親に通知（例: タスク一覧を再読み込みさせるため）
      handleClose();   // モーダルを閉じる
    }
  }

  // --- モーダルを閉じる時のリセット処理 ---
  const handleClose = () => {
    setTaskName('');
    setSelectedProjectId('');
    setDueDate('');
    setStatus('未着手');
    setError(null);
    setIsSubmitting(false);
    onClose(); // 親コンポーネントに「閉じて」と伝える
  }

  if (!isOpen) {
    return null;
  }
  
  // プロジェクト名とクライアント名を結合して表示
  const getProjectDisplayName = (project: Project) => {
    const clientName = (project.clients && project.clients.name) ? project.clients.name : 'クライアント不明';
    return `${project.name} (クライアント: ${clientName})`;
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* モーダルヘッダー */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">新規タスク登録</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800 text-3xl font-bold"
          >
            &times;
          </button>
        </div>
        
        {/* モーダルボディ（フォーム） */}
        <div className="p-6 space-y-4">
          {isLoadingProjects ? (
            <p>プロジェクトを読み込み中...</p>
          ) : (
            <div>
              <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-1">
                所属プロジェクト <span className="text-red-500">*</span>
              </label>
              <select
                id="project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- プロジェクトを選択 --</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {getProjectDisplayName(project)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="task-name" className="block text-sm font-medium text-gray-700 mb-1">
              タスク名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="例: LPデザインレビュー"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-1">
                ステータス <span className="text-red-500">*</span>
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {taskStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-1">
                期限日
              </label>
              <input
                type="date"
                id="due-date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
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
            disabled={isSubmitting || isLoadingProjects}
          >
            {isSubmitting ? '登録中...' : 'タスク登録'}
          </Button>
        </div>
      </div>
    </div>
  )
}
