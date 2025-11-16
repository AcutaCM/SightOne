import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        // Login page redesign colors
        'login-primary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
        },
        'login-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Existing drone colors
        drone: {
          primary: "#0066ff",
          secondary: "#7c3aed",
          accent: "#06b6d4",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
        },
        ai: {
          gradient: {
            from: "#667eea",
            to: "#764ba2",
          },
        },
      },
      borderRadius: {
        'login-sm': '0.25rem',   // 4px
        'login-base': '0.5rem',  // 8px
        'login-md': '0.75rem',   // 12px
        'login-lg': '1rem',      // 16px
        'login-xl': '1.5rem',    // 24px
        'login-2xl': '2rem',     // 32px
      },
      boxShadow: {
        'login-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'login-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'login-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'login-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'login-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'login-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'drone-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'ai-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        // Login page gradients
        'login-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
        'login-gradient-subtle': 'linear-gradient(135deg, #1e40af 0%, #6366f1 50%, #7c3aed 100%)',
        // 深蓝/浅蓝动感弥散（随主题切换）
        'diffuse-light': 'radial-gradient(circle at 68% 28%, #93c5fd 0%, transparent 52%), radial-gradient(circle at 82% 20%, #67e8f9 0%, transparent 50%), radial-gradient(circle at 56% 34%, #60a5fa 0%, transparent 55%), radial-gradient(circle at 88% 26%, #7dd3fc 0%, transparent 52%)',
        'diffuse-dark': 'radial-gradient(circle at 70% 26%, #0b1e3f 0%, transparent 52%), radial-gradient(circle at 85% 18%, #1e3a8a 0%, transparent 50%), radial-gradient(circle at 58% 34%, #0c4a6e 0%, transparent 55%), radial-gradient(circle at 90% 24%, #0a3a8a 0%, transparent 52%)',
        // 兼容旧类名（可保留）
        'blue-diffuse': 'radial-gradient(circle at 70% 26%, #0b1e3f 0%, transparent 52%), radial-gradient(circle at 85% 18%, #1e3a8a 0%, transparent 50%), radial-gradient(circle at 58% 34%, #0c4a6e 0%, transparent 55%), radial-gradient(circle at 90% 24%, #0a3a8a 0%, transparent 52%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        // 提升可见度：更大的位移、更快的周期
        'blue-diffuse': 'blueDiffuse 6s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        // 背景渐变动画
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
        // 流星效果
        'meteor-effect': 'meteor 5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        meteor: {
          '0%': {
            transform: 'rotate(215deg) translateX(0)',
            opacity: '1',
          },
          '70%': {
            opacity: '1',
          },
          '100%': {
            transform: 'rotate(215deg) translateX(-500px)',
            opacity: '0',
          },
        },
        // 加强版漂移：位移幅度与缩放更明显
        blueDiffuse: {
          '0%, 100%': {
            backgroundPosition: '68% 30%, 85% 20%, 58% 36%, 90% 28%',
            backgroundSize: '230% 230%, 190% 190%, 280% 280%, 210% 210%'
          },
          '25%': {
            backgroundPosition: '62% 22%, 78% 28%, 52% 30%, 92% 22%',
            backgroundSize: '260% 260%, 210% 210%, 320% 320%, 230% 230%'
          },
          '50%': {
            backgroundPosition: '74% 38%, 88% 16%, 64% 40%, 84% 34%',
            backgroundSize: '240% 240%, 200% 200%, 290% 290%, 220% 220%'
          },
          '75%': {
            backgroundPosition: '66% 26%, 80% 24%, 56% 42%, 94% 24%',
            backgroundSize: '255% 255%, 215% 215%, 310% 310%, 235% 235%'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // 背景渐变动画关键帧
        moveHorizontal: {
          "0%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
          "50%": {
            transform: "translateX(50%) translateY(10%)",
          },
          "100%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
        },
        moveInCircle: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "50%": {
            transform: "rotate(180deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        moveVertical: {
          "0%": {
            transform: "translateY(-50%)",
          },
          "50%": {
            transform: "translateY(50%)",
          },
          "100%": {
            transform: "translateY(-50%)",
          },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          background: "#f8fafc",
          foreground: "#0f172a",
          primary: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
            DEFAULT: "#3b82f6",
            foreground: "#ffffff",
          },
          secondary: {
            50: "#f0f9ff",
            100: "#e0f2fe",
            200: "#bae6fd",
            300: "#7dd3fc",
            400: "#38bdf8",
            500: "#0ea5e9",
            600: "#0284c7",
            700: "#0369a1",
            800: "#075985",
            900: "#0c4a6e",
            DEFAULT: "#0ea5e9",
            foreground: "#ffffff",
          },
          content1: "#ffffff",
          content2: "#f1f5f9",
          content3: "#e2e8f0",
          content4: "#cbd5e1",
          divider: "#e2e8f0",
        },
      },
      dark: {
        colors: {
          background: "#0a0f1e",
          foreground: "#f1f5f9",
          primary: {
            50: "#1e3a8a",
            100: "#1e40af",
            200: "#1d4ed8",
            300: "#2563eb",
            400: "#3b82f6",
            500: "#60a5fa",
            600: "#93c5fd",
            700: "#bfdbfe",
            800: "#dbeafe",
            900: "#eff6ff",
            DEFAULT: "#3b82f6",
            foreground: "#ffffff",
          },
          secondary: {
            50: "#0c4a6e",
            100: "#075985",
            200: "#0369a1",
            300: "#0284c7",
            400: "#0ea5e9",
            500: "#38bdf8",
            600: "#7dd3fc",
            700: "#bae6fd",
            800: "#e0f2fe",
            900: "#f0f9ff",
            DEFAULT: "#0ea5e9",
            foreground: "#ffffff",
          },
          content1: "#111827",
          content2: "#1f2937",
          content3: "#374151",
          content4: "#4b5563",
          divider: "#1f2937",
        },
      },
      "drone-theme": {
        extend: "dark",
        colors: {
          background: "#0a0e1a",
          foreground: "#ffffff",
          primary: {
            DEFAULT: "#0066ff",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#7c3aed",
            foreground: "#ffffff",
          },
          success: {
            DEFAULT: "#10b981",
            foreground: "#ffffff",
          },
          warning: {
            DEFAULT: "#f59e0b",
            foreground: "#000000",
          },
          danger: {
            DEFAULT: "#ef4444",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
}

module.exports = config;