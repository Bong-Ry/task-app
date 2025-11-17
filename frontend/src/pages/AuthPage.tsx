import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Button from '../components/UI/Button';

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      let result;
      if (isNewUser) {
        result = await supabase.auth.signUp({
          email,
          password,
        });
        if (!result.error) {
          setMessage('アカウントを作成しました');
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!result.error) {
          setMessage('ログインしました');
        }
      }

      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          setError('メールアドレスまたはパスワードが正しくありません');
        } else if (result.error.message.includes('Email not confirmed')) {
          setError('メールアドレスが確認されていません');
        } else if (result.error.message.includes('User already registered')) {
          setError('このメールアドレスは既に登録されています');
        } else {
          setError(result.error.message);
        }
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            プロジェクト管理
          </h2>
          <p className="text-gray-600">
            {isNewUser ? '新規アカウントを作成' : 'アカウントにサインイン'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="example@email.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={isNewUser ? '6文字以上のパスワード' : 'パスワードを入力'}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && (
            <div className="flex items-start space-x-2 text-red-700 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="flex items-start space-x-2 text-green-700 text-sm p-3 bg-green-50 rounded-lg border border-green-200">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          <Button
            type="submit"
            onClick={() => {}}
            className="w-full py-3 text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                処理中...
              </span>
            ) : isNewUser ? 'アカウント登録' : 'サインイン'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsNewUser(!isNewUser);
              setError('');
              setMessage('');
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition duration-200"
            disabled={loading}
          >
            {isNewUser ? '既存アカウントでサインイン' : '新規アカウントを作成'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
