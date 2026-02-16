import { useActivityLogs } from '../api/todos';
import type { ActivityLog as ActivityLogType } from '../types';

const actionLabels: Record<ActivityLogType['action'], string> = {
  created: 'Created',
  completed: 'Completed',
  uncompleted: 'Reopened',
  deleted: 'Deleted',
};

const actionColors: Record<ActivityLogType['action'], { text: string; bg: string; dot: string }> = {
  created: { text: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
  completed: { text: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  uncompleted: { text: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  deleted: { text: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
};

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityLog() {
  const { data: logs, isLoading } = useActivityLogs();

  if (isLoading) return (
    <div className="mt-8 text-center py-4">
      <span className="text-gray-400 text-sm">Loading activity...</span>
    </div>
  );
  if (!logs || logs.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Recent Activity
      </h2>
      <ul className="max-h-64 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {logs.map((log) => {
          const colorScheme = actionColors[log.action];
          return (
            <li
              key={log.id}
              className="flex items-start gap-3 text-sm py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 group"
            >
              <div className="relative pt-1">
                <span className={`block w-2 h-2 rounded-full ${colorScheme.dot} ring-4 ring-white shadow-sm`} />
                <div className="absolute left-1/2 top-4 w-px h-full bg-gray-200 -translate-x-1/2 group-last:hidden" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-gray-700">
                    <span className={`font-semibold ${colorScheme.text}`}>
                      {actionLabels[log.action]}
                    </span>
                    {' '}
                    <span className="text-gray-600">&ldquo;{log.todoTitle}&rdquo;</span>
                  </p>
                  <span className="text-xs text-gray-400 whitespace-nowrap font-medium">
                    {timeAgo(log.timestamp)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
