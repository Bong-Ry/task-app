// src/pages/AuthPage.tsx (新規ファイル・全文)
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Button from '../components/UI/Button';

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
      // 新規登録 (サインアップ)
      result = await supabase.auth.signUp({
        email,
        password,
      });
      if (!result.error) {
        setMessage('登録が完了しました。ログインしてください。');
      }
    } else {
      // 既存ユーザーでサインイン
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else if (result.data.user) {
      // ログイン成功時
      setMessage('ログインに成功しました！');
      // ★リダイレクトは不要。App.tsxがセッション変更を検知します。
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-base-bg">
      <div className="bg-white p-8 rounded-lg shadow-card w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isNewUser ? '新規アカウント登録' : 'ログイン'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md">{error}</div>
          )}
          {message && (
            <div className="text-green-600 text-sm p-3 bg-green-50 rounded-md">{message}</div>
          )}

          <Button 
            type="submit" 
            onClick={() => {}}
            className="w-full" 
            disabled={loading}
          >
            {loading ? '処理中...' : isNewUser ? 'アカウント登録' : 'サインイン'}
          </Button>
        </form>

        <p className="text-center text-sm mt-4">
          <button
            onClick={() => setIsNewUser(!isNewUser)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isNewUser ? '>> 既存アカウントでサインイン' : '>> 新規アカウントを作成'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
