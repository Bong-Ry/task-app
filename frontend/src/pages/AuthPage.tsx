import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Button from '../components/UI/Button';
import { Input } from '../components/UI/Input'; // ★ Inputをインポート

// --- メインコンポーネント ---

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false); // サインアップ/サインインの切り替え
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    let result;
    if (isNewUser) {
      // 新規登録 (サインアップ) - サインアップ後、自動でセッションが開始されログイン状態になる
      result = await supabase.auth.signUp({
        email,
        password,
      });
      if (!result.error) {
        // 自動ログインされるため、成功メッセージを表示するのみ
        setMessage('アカウントの登録に成功しました。メイン画面に移動中です...'); 
      }
    } else {
      // 既存ユーザーでサインイン
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!result.error) {
         setMessage('ログインに成功しました。');
      }
    }

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      setMessage('');
    }
    // ログイン成功時はApp.tsxのonAuthStateChangeが検知し、自動で画面が切り替わる
  };
  

  return (
    // UI改善: 背景色と中央配置の調整
    <div className="flex justify-center items-center min-h-screen bg-gray-50"> 
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
          プロジェクト管理
        </h2>
        <p className="text-center text-gray-500 mb-8">
            {isNewUser ? '新規アカウントを作成' : 'サインイン'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            /> {/* ★ Inputコンポーネントに置換 */}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            /> {/* ★ Inputコンポーネントに置換 */}
          </div>

          {error && (
            <div className="text-red-700 text-sm p-3 bg-red-100 rounded-lg border border-red-300">{error}</div>
          )}
          {message && (
            <div className="text-green-700 text-sm p-3 bg-green-100 rounded-lg border border-green-200">{message}</div>
          )}

          <Button 
            type="submit" 
            onClick={() => {}}
            className="w-full py-3" 
            disabled={loading}
          >
            {loading ? '処理中...' : isNewUser ? 'アカウント登録' : 'サインイン'}
          </Button>
        </form>

        <p className="text-center text-sm mt-6">
          <button
            onClick={() => {
              setIsNewUser(!isNewUser);
              setError('');
              setMessage('');
            }}
            className="font-medium text-blue-600 hover:text-blue-800 transition duration-150"
          >
            {isNewUser ? '>> 既存アカウントでサインイン' : '>> 新規アカウントを作成'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;

