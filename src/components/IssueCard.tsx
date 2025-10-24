import { useState } from 'react';
import type { Issue } from '../types';
import { StatusBadge, PriorityBadge } from './Badge';
import { Button } from '@/components/ui/button';
import { Modal } from './Modal';
import { useAuth } from '../providers/AuthProvider';
import { issuesAPI } from '../api/issues';
import { Loader2 } from 'lucide-react';

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
      <div className="group relative bg-linear-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
        {issue.photos && issue.photos.length > 0 && (
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent z-10" />
            <img
              src={issue.photos[0]}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
          </div>
        )}
        
        <div className="p-6">
          {!issue.photos.length && (
            <div className="flex gap-2 mb-3">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
          )}
          
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-bold mb-2 text-foreground/90 line-clamp-2 group-hover:text-primary transition-colors">
                {issue.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                {issue.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {issue.category}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{issue.reportedByName}</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(issue.createdAt)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{issue.location.address}</span>
            </div>

            {showActions && (
              <div className="flex items-center gap-2 pt-3">
                <Button
                  size="sm"
                  variant={isUpvoted ? 'default' : 'outline'}
                  onClick={handleUpvote}
                  disabled={!user || isUpvoting}
                  className="flex-1"
                >
                  {isUpvoting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill={isUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      {issue.upvotes}
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowDetails(true)}
                  className="flex-1"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {issue.comments.length}
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => setShowDetails(true)}
                  className="flex-1"
                >
                  View
                </Button>
              </div>
            )}
          </div>
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

          <div className="flex gap-3 flex-wrap">
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {issue.category}
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Description</h4>
            <p className="text-muted-foreground">{issue.description}</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Location</h4>
            <p className="text-muted-foreground flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {issue.location.address}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Reporter</h4>
            <p className="text-muted-foreground">{issue.reportedByName}</p>
            <p className="text-sm text-muted-foreground/70">Reported on {new Date(issue.createdAt).toLocaleDateString()}</p>
          </div>

          {issue.assignedTo && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Assigned To</h4>
              <p className="text-muted-foreground">{issue.assignedTo}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-foreground mb-3">Comments ({issue.comments.length})</h4>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {issue.comments.map((comment) => (
                <div key={comment.id} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{comment.text}</p>
                </div>
              ))}
              {issue.comments.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No comments yet</p>
              )}
            </div>

            {user && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <Button onClick={handleComment} disabled={!comment.trim() || isCommenting}>
                  {isCommenting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
