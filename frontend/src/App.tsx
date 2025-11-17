import { useState } from 'react'
import { Routes, Route, Link, Outlet, useOutletContext } from 'react-router-dom' 

import Button from './components/UI/Button' 

// 各ページのコンポーネントをインポート
import ClientsPage from './pages/ClientsPage'
import ProjectsPage from './pages/ProjectsPage' 
import TasksPage from './pages/TasksPage' 
import HomePage from './pages/HomePage' // ★ ホームページをインポート

// モーダルコンポーネントをインポート
import { CreateProjectModal } from './components/CreateProjectModal' 
import { CreateTaskModal } from './components/CreateTaskModal' 

// ★ 子ページに渡す「Context」の型を定義
type AppContextType = {
  needsRefresh: boolean;
  onRefreshComplete: () => void;
};


// --- Appコンポーネント（レイアウト + ルーティング） ---

function App() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false) 
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)       

  const [needsRefresh, setNeedsRefresh] = useState(false)
  
  // プロジェクト作成/タスク作成が成功したときに実行される関数
  const handleItemCreated = (type: 'project' | 'task') => {
    console.log(`${type} が作成されました！一覧を更新します。`)
    setNeedsRefresh(true); 
  }

  // ProjectsPage/TasksPageがデータ更新を完了したときに実行される関数
  const handleRefreshComplete = () => {
    setNeedsRefresh(false); 
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* --- ヘッダー（全ページ共通） --- */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          <Link to="/">プロジェクト管理</Link>
        </h1>
        <div className="flex space-x-4">
          <Link to="/clients">
            <Button onClick={() => {}}>
              クライアント管理
            </Button>
          </Link>
          <Link to="/projects"> {/* ★ ProjectsPageへのリンクを "/projects" に変更 */}
            <Button onClick={() => {}}>
              プロジェクト一覧
            </Button>
          </Link>
          <Link to="/tasks"> 
            <Button onClick={() => {}}>
              タスク管理
            </Button>
          </Link>
          
          <Button onClick={() => setIsProjectModalOpen(true)}>
            ＋ 新規プロジェクト
          </Button>
          <Button onClick={() => setIsTaskModalOpen(true)}>
            ＋ 新規タスク
          </Button>
        </div>
      </header>

      {/* --- メインコンテンツ（ページ切り替え部分） --- */}
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <Outlet context={{ 
                needsRefresh, 
                onRefreshComplete: handleRefreshComplete 
              } satisfies AppContextType} />
            }
          >
            <Route index element={<HomePage />} /> {/* ★ ルートパスを HomePage に変更 */}
            <Route path="clients" element={<ClientsPage />} /> 
            <Route path="projects" element={<ProjectsPage />} /> {/* ★ ProjectsPage のパスを "/projects" に変更 */}
            <Route path="tasks" element={<TasksPage />} /> 
          </Route>
        </Routes>
      </main>

      {/* --- 新規プロジェクト登録モーダル --- */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => handleItemCreated('project')} 
      />

      {/* --- 新規タスク登録モーダル --- */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => handleItemCreated('task')} 
      />

    </div>
  )
}

// ★ 子ページがコンテキストを簡単に受け取れるようにするためのカスタムフック
export function useProjectRefresh() {
  return useOutletContext<AppContextType>();
}

export default App
