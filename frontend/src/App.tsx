import { useState, useEffect } from 'react'
import { Routes, Route, Link, Outlet, useOutletContext } from 'react-router-dom' 
import { supabase } from './supabaseClient';

import Button from './components/UI/Button' 

// 各ページのコンポーネントをインポート
import ClientsPage from './pages/ClientsPage'
import ProjectsPage from './pages/ProjectsPage' 
import TasksPage from './pages/TasksPage' 
import HomePage from './pages/HomePage' 
import MeetingsPage from './pages/MeetingsPage' 
import MindmapPage from './pages/MindmapPage' 
import AuthPage from './pages/AuthPage' 

// モーダルコンポーネントをインポート
import { CreateProjectModal } from './components/CreateProjectModal' 
import { CreateTaskModal } from './components/CreateTaskModal' 
import { CreateMeetingModal } from './components/CreateMeetingModal' 

// ★ 子ページに渡す「Context」の型を定義
type AppContextType = {
  needsRefresh: boolean;
  onRefreshComplete: () => void;
};


// --- Appコンポーネント（レイアウト + ルーティング） ---

function App() {
  const [session, setSession] = useState<any>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false) 
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)       
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false) 

  const [needsRefresh, setNeedsRefresh] = useState(false)
  
  // ★ ログインセッションの監視
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 認証状態の変更をリアルタイムでリッスン
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // ログイン状態が変わったら全画面の更新を促す
      setNeedsRefresh(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleItemCreated = (type: 'project' | 'task' | 'meeting') => {
    console.log(`${type} が作成されました！一覧を更新します。`)
    setNeedsRefresh(true); 
  }

  const handleRefreshComplete = () => {
    setNeedsRefresh(false); 
  }
  
  // ★ サインアウトボタンのハンドラ
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }
  

  // ★ ログイン状態による表示切り替え
  if (!session) {
    return <AuthPage />;
  }


  return (
    // ★ 修正: min-h-screen bg-gray-50 text-gray-800 を直接適用
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      {/* --- ヘッダー（全ページ共通） --- */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          
          {/* 左側: ロゴとナビゲーション */}
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-extrabold text-blue-600">
              <Link to="/">TaskApp</Link>
            </h1>
            {/* ナビゲーションリンク */}
            <nav className="hidden md:flex space-x-4">
              <NavLink to="/projects">プロジェクト</NavLink>
              <NavLink to="/tasks">タスク</NavLink>
              <NavLink to="/clients">クライアント</NavLink>
              <NavLink to="/meetings">議事録</NavLink>
              <NavLink to="/mindmap">マインドマップ</NavLink>
            </nav>
          </div>
          
          {/* 右側: アクションボタンとユーザー情報 */}
          <div className="flex space-x-3 items-center">
            
            {/* 新規作成ボタン群 */}
            <div className="hidden sm:flex space-x-2">
                <Button variant="secondary" onClick={() => setIsProjectModalOpen(true)} className="text-sm py-1.5">
                    ＋ PJT
                </Button>
                <Button variant="secondary" onClick={() => setIsTaskModalOpen(true)} className="text-sm py-1.5">
                    ＋ Task
                </Button>
                <Button variant="secondary" onClick={() => setIsMeetingModalOpen(true)} className="text-sm py-1.5">
                    ＋ 議事録
                </Button>
            </div>

            {/* サインアウトボタン */}
            <Button 
                onClick={handleSignOut} 
                variant="link" 
                className="text-gray-500 hover:text-red-600 text-sm"
            >
                サインアウト
            </Button>
          </div>
        </div>
      </header>

      {/* --- メインコンテンツ（ページ切り替え部分） --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <Route index element={<HomePage />} /> 
            <Route path="clients" element={<ClientsPage />} /> 
            <Route path="projects" element={<ProjectsPage />} /> 
            <Route path="tasks" element={<TasksPage />} /> 
            <Route path="meetings" element={<MeetingsPage />} /> 
            <Route path="mindmap" element={<MindmapPage />} /> 
          </Route>
        </Routes>
      </main>

      {/* --- モーダル群 --- */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => handleItemCreated('project')} 
      />
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => handleItemCreated('task')} 
      />
      <CreateMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onMeetingCreated={() => handleItemCreated('meeting')}
      />


    </div>
  )
}

// ナビゲーション用のヘルパーコンポーネント
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link 
        to={to} 
        className="text-gray-600 hover:text-blue-600 font-medium py-2 transition duration-150"
    >
        {children}
    </Link>
)


export function useProjectRefresh() {
  return useOutletContext<AppContextType>();
}

export default App
