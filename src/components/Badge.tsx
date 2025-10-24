import type { IssueStatus } from '../types';

interface StatusBadgeProps {
  status: IssueStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    Resolved: 'bg-green-100 text-green-800 border-green-300',
    Rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: 'Low' | 'Medium' | 'High';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-orange-100 text-orange-800',
    High: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[priority]}`}>
      {priority}
    </span>
  );
}
