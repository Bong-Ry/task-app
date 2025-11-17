/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // note.com風の温かみのあるオフホワイト
        "base-bg": "#f8f7f7", 
      },
      fontFamily: {
        // アプリケーションの標準フォント
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
      boxShadow: {
        // NexusHub UI風のカードシャドウ
        'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
