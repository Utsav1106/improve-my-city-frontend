import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { issuesAPI } from '../api/issues';
import type { Issue, IssueStatus, IssueCategory } from '../types';
import { IssueCard } from '../components/IssueCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function MyIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  const loadIssues = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await issuesAPI.getIssuesByUser(user.id);
      setIssues(data);
      setFilteredIssues(data);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [user]);

  useEffect(() => {
    let filtered = [...issues];

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter((issue) => issue.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return b.upvotes - a.upvotes;
        default:
          return 0;
      }
    });

    setFilteredIssues(filtered);
  }, [statusFilter, categoryFilter, sortBy, issues]);

  const handleDeleteIssue = async (issueId: string) => {
    if (!user || !confirm('Are you sure you want to delete this issue?')) return;

    try {
      await issuesAPI.deleteIssue(issueId, user.id);
      loadIssues();
    } catch (error) {
      console.error('Failed to delete issue:', error);
      alert('Failed to delete issue');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reported Issues</h1>
        <p className="text-gray-600">Track and manage the issues you've reported</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => {
          const count = status === 'All' 
            ? issues.length 
            : issues.filter((i) => i.status === status).length;
          
          return (
            <div key={status} onClick={() => setStatusFilter(status as IssueStatus | 'All')}>
              <Card hover className="cursor-pointer">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600">{status}</p>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'All')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | 'All')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Pothole">Pothole</option>
              <option value="Garbage">Garbage</option>
              <option value="Streetlight">Streetlight</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Drainage">Drainage</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Parks">Parks</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Issues Grid */}
      {filteredIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="relative">
              <IssueCard issue={issue} onUpdate={loadIssues} />
              {issue.status === 'Pending' && (
                <Button
                  size="sm"
                  variant="danger"
                  className="absolute top-2 left-2 z-10"
                  onClick={() => handleDeleteIssue(issue.id)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {issues.length === 0 ? "You haven't reported any issues yet" : 'No issues match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {issues.length === 0 
              ? 'Start making a difference by reporting civic issues in your community'
              : 'Try adjusting your filters to see more results'}
          </p>
        </Card>
      )}
    </div>
  );
}
