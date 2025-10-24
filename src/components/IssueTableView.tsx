import { useState } from 'react';
import type { Issue } from '../types';
import { StatusBadge, PriorityBadge } from './Badge';
import { Button } from '@/components/ui/button';
import { Modal } from './Modal';
import { useAuth } from '../providers/AuthProvider';
import { issuesAPI } from '../api/issues';
import { Loader2 } from 'lucide-react';

interface IssueTableViewProps {
  issues: Issue[];
  onUpdate?: () => void;
}

export function IssueTableView({ issues, onUpdate }: IssueTableViewProps) {
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isUpvoting, setIsUpvoting] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const handleUpvote = async (issue: Issue) => {
    if (!user) return;
    setIsUpvoting(issue.id);
    try {
      await issuesAPI.upvoteIssue(issue.id, user.id);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to upvote:', error);
    } finally {
      setIsUpvoting(null);
    }
  };

  const handleComment = async () => {
    if (!user || !comment.trim() || !selectedIssue) return;
    setIsCommenting(true);
    try {
      await issuesAPI.addComment(selectedIssue.id, user.id, user.name, comment);
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isUpvoted = (issue: Issue) => user ? issue.upvotedBy.includes(user.id) : false;

  return (
    <>
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Issue</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Priority</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Location</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Reporter</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Votes</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr 
                  key={issue.id} 
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {issue.photos && issue.photos.length > 0 && (
                        <img
                          src={issue.photos[0]}
                          alt={issue.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground/90 line-clamp-1 group-hover:text-primary transition-colors">
                          {issue.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {issue.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {issue.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="p-4">
                    <PriorityBadge priority={issue.priority} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-[200px]">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-1">{issue.location.address}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground/80">{issue.reportedByName}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-muted-foreground">{formatDate(issue.createdAt)}</span>
                  </td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant={isUpvoted(issue) ? 'default' : 'ghost'}
                      onClick={() => handleUpvote(issue)}
                      disabled={!user || isUpvoting === issue.id}
                      className="min-w-[60px]"
                    >
                      {isUpvoting === issue.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 mr-1" fill={isUpvoted(issue) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          {issue.upvotes}
                        </>
                      )}
                    </Button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedIssue(issue)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {issues.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No issues found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your filters or search criteria
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedIssue && (
        <Modal isOpen={!!selectedIssue} onClose={() => setSelectedIssue(null)} title={selectedIssue.title} size="lg">
          <div className="space-y-6">
            {selectedIssue.photos && selectedIssue.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {selectedIssue.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${selectedIssue.title} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <StatusBadge status={selectedIssue.status} />
              <PriorityBadge priority={selectedIssue.priority} />
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                {selectedIssue.category}
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Description</h4>
              <p className="text-muted-foreground">{selectedIssue.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Location</h4>
              <p className="text-muted-foreground flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selectedIssue.location.address}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Reporter</h4>
              <p className="text-muted-foreground">{selectedIssue.reportedByName}</p>
              <p className="text-sm text-muted-foreground/70">Reported on {formatDate(selectedIssue.createdAt)}</p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Comments ({selectedIssue.comments.length})</h4>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {selectedIssue.comments.map((comment) => (
                  <div key={comment.id} className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{comment.text}</p>
                  </div>
                ))}
                {selectedIssue.comments.length === 0 && (
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
      )}
    </>
  );
}
