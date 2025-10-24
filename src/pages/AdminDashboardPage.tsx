import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { issuesAPI } from '../api/issues';
import type { Issue, IssueStatus } from '../types';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadIssues = async () => {
    setIsLoading(true);
    try {
      const data = await issuesAPI.getAllIssues();
      setIssues(data);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleUpdateStatus = async (issueId: string, newStatus: IssueStatus) => {
    setIsUpdating(true);
    try {
      await issuesAPI.updateIssueStatus(issueId, newStatus);
      await loadIssues();
      setSelectedIssue(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update issue status');
    } finally {
      setIsUpdating(false);
    }
  };

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === 'Pending').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    resolved: issues.filter((i) => i.status === 'Resolved').length,
    high: issues.filter((i) => i.priority === 'High').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Manage and resolve civic issues reported by citizens
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="border-l-4 border-purple-500">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Issues</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
        </Card>

        <Card className="border-l-4 border-green-500">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </Card>

        <Card className="border-l-4 border-red-500">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">High Priority</p>
            <p className="text-3xl font-bold text-red-600">{stats.high}</p>
          </div>
        </Card>
      </div>

      {/* Issues Table */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Issues</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upvotes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                    <div className="text-sm text-gray-500">{issue.location.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{issue.reportedByName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{issue.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={issue.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      {issue.upvotes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedIssue(issue)}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Issue Management Modal */}
      <Modal
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        title="Manage Issue"
        size="lg"
      >
        {selectedIssue && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedIssue.title}</h3>
              <div className="flex gap-2 mb-4">
                <StatusBadge status={selectedIssue.status} />
                <PriorityBadge priority={selectedIssue.priority} />
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {selectedIssue.category}
                </span>
              </div>
              <p className="text-gray-600">{selectedIssue.description}</p>
            </div>

            {selectedIssue.photos && selectedIssue.photos.length > 0 && (
              <div>
                <img
                  src={selectedIssue.photos[0]}
                  alt={selectedIssue.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Reported By</p>
                <p className="text-gray-900">{selectedIssue.reportedByName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-gray-900">{selectedIssue.location.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Created</p>
                <p className="text-gray-900">{new Date(selectedIssue.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Upvotes</p>
                <p className="text-gray-900">{selectedIssue.upvotes}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus(selectedIssue.id, 'In Progress')}
                  isLoading={isUpdating}
                  disabled={selectedIssue.status === 'In Progress'}
                >
                  Mark In Progress
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleUpdateStatus(selectedIssue.id, 'Resolved')}
                  isLoading={isUpdating}
                  disabled={selectedIssue.status === 'Resolved'}
                >
                  Mark Resolved
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleUpdateStatus(selectedIssue.id, 'Rejected')}
                  isLoading={isUpdating}
                  disabled={selectedIssue.status === 'Rejected'}
                >
                  Reject Issue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedIssue.id, 'Pending')}
                  isLoading={isUpdating}
                  disabled={selectedIssue.status === 'Pending'}
                >
                  Reset to Pending
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
