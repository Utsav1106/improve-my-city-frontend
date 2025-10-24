import type { IssueStatus } from '../types';

interface StatusBadgeProps {
  status: IssueStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = () => {
    switch (status) {
      case 'Pending':
        return {
          container: 'bg-linear-to-r from-amber-500/15 to-orange-500/15 text-amber-700 dark:text-amber-300 backdrop-blur-sm',
          dot: 'bg-amber-500',
        };
      case 'In Progress':
        return {
          container: 'bg-linear-to-r from-blue-500/15 to-cyan-500/15 text-blue-700 dark:text-blue-300 backdrop-blur-sm',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'Resolved':
        return {
          container: 'bg-linear-to-r from-green-500/15 to-emerald-500/15 text-green-700 dark:text-green-300 backdrop-blur-sm',
          dot: 'bg-green-500',
        };
      case 'Rejected':
        return {
          container: 'bg-linear-to-r from-red-500/15 to-rose-500/15 text-red-700 dark:text-red-300 backdrop-blur-sm',
          dot: 'bg-red-500',
        };
    }
  };

  const styles = getStatusStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${styles.container}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
      {status}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: 'Low' | 'Medium' | 'High';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getPriorityStyle = () => {
    switch (priority) {
      case 'Low':
        return {
          container: 'bg-linear-to-r from-slate-500/15 to-gray-500/15 text-slate-700 dark:text-slate-300 backdrop-blur-sm',
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ),
        };
      case 'Medium':
        return {
          container: 'bg-linear-to-r from-yellow-500/15 to-amber-500/15 text-yellow-700 dark:text-yellow-300 backdrop-blur-sm',
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
          ),
        };
      case 'High':
        return {
          container: 'bg-linear-to-r from-red-500/15 to-pink-500/15 text-red-700 dark:text-red-300 backdrop-blur-sm',
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ),
        };
    }
  };

  const styles = getPriorityStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${styles.container}`}>
      {styles.icon}
      {priority}
    </span>
  );
}
