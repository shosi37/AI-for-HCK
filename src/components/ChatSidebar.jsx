import React from 'react'

export default function ChatSidebar({ threads = [], suggestions = [], faq = [], onSuggestionClick, onSelectThread, onClear }) {
  return (
    <aside className="w-72 border-r dark:border-gray-700 p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Chat History</h4>
        <button onClick={onClear} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-150">Clear</button>
      </div>

      <div className="space-y-2 max-h-[45vh] overflow-auto mb-4">
        {threads.length === 0 && (
          <div className="text-sm text-gray-500">No past conversations yet</div>
        )}
        {threads.map((t, i) => (
          <button key={t.user.id} onClick={() => onSelectThread(i)} className="w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200">
            <div className="text-sm font-medium truncate">{t.user.text}</div>
            <div className="text-xs text-gray-500 truncate">{new Date(t.ai.time).toLocaleString()}</div>
          </button>
        ))}
      </div>

      <div>
        <h5 className="text-sm font-semibold mb-2">Suggestions</h5>
        <div className="flex flex-col gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => onSuggestionClick(s)} className="text-left px-2 py-1 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition-colors duration-200">
              {s}
            </button>
          ))}
        </div>
      </div>

      {faq.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-semibold mb-2">FAQ</h5>
          <div className="space-y-2">
            {faq.map((it, i) => (
              <details key={i} className="bg-white dark:bg-gray-800 p-2 rounded">
                <summary className="cursor-pointer text-sm font-medium">{it.q}</summary>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 transition-colors duration-200">{it.a}</div>
              </details>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
