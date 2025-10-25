import { useState, useEffect } from 'react';
import type { Issue } from '../types';
import { StatusBadge, PriorityBadge } from './Badge';
import { Button } from '@/components/ui/button';
import { IssueDetailsModal } from './IssueDetailsModal';
import { useAuth } from '../providers/AuthProvider';
import { issuesAPI } from '../api/issues';
import * as issuesService from '../services/issues';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface IssueCardProps {
  issue: Issue;
  onUpdate?: (updatedIssue?: Issue) => void;
  showActions?: boolean;
}

export function IssueCard({ issue, onUpdate, showActions = true }: IssueCardProps) {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [localIssue, setLocalIssue] = useState<Issue>(issue);
  const [commentCount, setCommentCount] = useState(0);

  const isUpvoted = user ? (localIssue.upvotedBy || []).includes(user.id) : false;

  // Fetch comment count on mount
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const result = await issuesService.getIssueComments(issue.id);
        setCommentCount(result.count);
      } catch (error) {
        console.error('Failed to fetch comment count:', error);
      }
    };
    fetchCommentCount();
  }, [issue.id]);

  const handleUpvote = async () => {
    if (!user) return;
    setIsUpvoting(true);
    
    // Optimistic update
    const wasUpvoted = isUpvoted;
    const updatedIssue = {
      ...localIssue,
      upvotes: wasUpvoted ? (localIssue.upvotes || 1) - 1 : (localIssue.upvotes || 0) + 1,
      upvotedBy: wasUpvoted 
        ? (localIssue.upvotedBy || []).filter(id => id !== user.id)
        : [...(localIssue.upvotedBy || []), user.id]
    };
    setLocalIssue(updatedIssue);
    
    try {
      await issuesAPI.upvoteIssue(issue.id, user.id);
      toast.success(wasUpvoted ? 'Upvote removed' : 'Issue upvoted!');
      onUpdate?.(updatedIssue);
    } catch (error) {
      console.error('Failed to upvote:', error);
      toast.error('Failed to upvote issue');
      // Revert on error
      setLocalIssue(localIssue);
    } finally {
      setIsUpvoting(false);
    }
  };

  const formatDate = (dateString: string | number) => {
    const date = typeof dateString === 'number' 
      ? new Date(dateString) 
      : new Date(dateString);
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="group relative bg-linear-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
        {localIssue.photos && localIssue.photos.length > 0 && (
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent z-10" />
            <img
              src={localIssue.photos[0]}
              alt={localIssue.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <StatusBadge status={localIssue.status} />
              <PriorityBadge priority={localIssue.priority || 'Medium'} />
            </div>
          </div>
        )}

        <div className="p-6">
          {(!localIssue.photos || localIssue.photos.length === 0) && (
            <div className="flex gap-2 mb-3">
              <StatusBadge status={localIssue.status} />
              <PriorityBadge priority={localIssue.priority || 'Medium'} />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-bold mb-2 text-foreground/90 line-clamp-2 group-hover:text-primary transition-colors">
                {localIssue.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                {localIssue.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {localIssue.category}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{localIssue.reportedByName}</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(localIssue.createdAt)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{localIssue.location.address}</span>
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
                      {localIssue.upvotes || 0}
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
                  {commentCount}
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

      <IssueDetailsModal
        issue={localIssue}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onUpdate={(updatedIssue) => {
          if (updatedIssue) {
            setLocalIssue(updatedIssue);
          }
          // Refresh comment count
          issuesService.getIssueComments(issue.id).then((result) => {
            setCommentCount(result.count);
          }).catch(console.error);
          onUpdate?.(updatedIssue);
        }}
      />
    </>
  );
}
