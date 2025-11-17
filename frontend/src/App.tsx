import { useState, useEffect } from 'react' // ★ useEffect を追加
import { Routes, Route, Link, Outlet, useOutletContext } from 'react-router-dom' 
import { supabase } from './supabaseClient'; // ★ supabaseクライアントをインポート

import Button from './components/UI/Button' 

// 各ページのコンポーネントをインポート
import ClientsPage from './pages/ClientsPage'
import ProjectsPage from './pages/ProjectsPage' 
import TasksPage from './pages/TasksPage' 
import HomePage from './pages/HomePage' 
import MeetingsPage from './pages/MeetingsPage' 
import MindmapPage from './pages/MindmapPage' 
import AuthPage from './pages/AuthPage' // ★ 認証ページをインポート

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
  const [session, setSession] = useState<any>(null); // ★ ログインセッションの状態
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
          <Link to="/projects"> 
            <Button onClick={() => {}}>
              プロジェクト一覧
            </Button>
          </Link>
          <Link to="/tasks"> 
            <Button onClick={() => {}}>
              タスク管理
            </Button>
          </Link>
          <Link to="/meetings"> 
            <Button onClick={() => {}}>
              議事録管理
            </Button>
          </Link>
          <Link to="/mindmap"> 
            <Button onClick={() => {}}>
              マインドマップ
            </Button>
          </Link>
          
          <Button onClick={() => setIsProjectModalOpen(true)}>
            ＋ 新規プロジェクト
          </Button>
          <Button onClick={() => setIsTaskModalOpen(true)}>
            ＋ 新規タスク
          </Button>
          <Button onClick={() => setIsMeetingModalOpen(true)}>
            ＋ 新規議事録
          </Button>
          {/* ★ サインアウトボタン */}
          <Button onClick={handleSignOut} className="ml-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
            サインアウト
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

export function useProjectRefresh() {
  return useOutletContext<AppContextType>();
}

export default App
