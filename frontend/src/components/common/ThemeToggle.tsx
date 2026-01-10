import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2.5 rounded-2xl transition-all duration-300 group
        ${theme === 'dark'
          ? 'bg-[#1e293b] border border-indigo-500/50 shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_0_20px_-3px_rgba(99,102,241,0.6)] hover:border-indigo-400'
          : 'bg-white border border-purple-200 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_-3px_rgba(168,85,247,0.5)] hover:border-purple-300'
        }
      `}
      aria-label="Toggle theme"
    >
      {/* Glossy overlay effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme === 'dark' ? 'bg-indigo-500/5' : 'bg-purple-500/5'}`} />

      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
      )}
    </button>
  );
}
