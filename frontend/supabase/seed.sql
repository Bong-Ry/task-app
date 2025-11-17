-- frontend/supabase/seed.sql (全文)

-- テストクライアントの挿入
INSERT INTO public.clients (name, is_active)
VALUES 
  ('株式会社Supabase', TRUE),
  ('株式会社React', TRUE),
  ('株式会社Vite', FALSE)
-- 競合防止: 既にデータがある場合は何もしない
ON CONFLICT (id) DO NOTHING;
