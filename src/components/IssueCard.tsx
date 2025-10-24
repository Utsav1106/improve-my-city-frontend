import { useState } from 'react';
import type { Issue } from '../types';
import { StatusBadge, PriorityBadge } from './Badge';
import { Button } from './Button';
import { Modal } from './Modal';
import { useAuth } from '../store/AuthContext';
import { issuesAPI } from '../api/issues';

interface IssueCardProps {
  issue: Issue;
  onUpdate?: () => void;
  showActions?: boolean;
}

export function IssueCard({ issue, onUpdate, showActions = true }: IssueCardProps) {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const isUpvoted = user ? issue.upvotedBy.includes(user.id) : false;

  const handleUpvote = async () => {
    if (!user) return;
    setIsUpvoting(true);
    try {
      await issuesAPI.upvoteIssue(issue.id, user.id);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to upvote:', error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleComment = async () => {
    if (!user || !comment.trim()) return;
    setIsCommenting(true);
    try {
      await issuesAPI.addComment(issue.id, user.id, user.name, comment);
      setComment('');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        {issue.photos && issue.photos.length > 0 && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={issue.photos[0]}
              alt={issue.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
          </div>
        )}
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{issue.title}</h3>
              <div className="flex items-center text-sm text-gray-500 space-x-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {issue.reportedByName}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(issue.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{issue.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {issue.category}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {issue.location.address}
              </span>
            </div>
          </div>

          {showActions && (
            <div className="mt-4 flex items-center gap-3">
              <Button
                size="sm"
                variant={isUpvoted ? 'secondary' : 'outline'}
                onClick={handleUpvote}
                isLoading={isUpvoting}
                disabled={!user}
              >
                <svg className="w-4 h-4" fill={isUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {issue.upvotes}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDetails(true)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {issue.comments.length}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDetails(true)}>
                View Details
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)} title={issue.title} size="lg">
        <div className="space-y-6">
          {issue.photos && issue.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {issue.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${issue.title} ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              {issue.category}
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{issue.description}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
            <p className="text-gray-600 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {issue.location.address}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Reporter</h4>
            <p className="text-gray-600">{issue.reportedByName}</p>
            <p className="text-sm text-gray-500">Reported on {new Date(issue.createdAt).toLocaleDateString()}</p>
          </div>

          {issue.assignedTo && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Assigned To</h4>
              <p className="text-gray-600">{issue.assignedTo}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Comments ({issue.comments.length})</h4>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {issue.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{comment.userName}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{comment.text}</p>
                </div>
              ))}
              {issue.comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              )}
            </div>

            {user && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <Button onClick={handleComment} isLoading={isCommenting} disabled={!comment.trim()}>
                  Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
