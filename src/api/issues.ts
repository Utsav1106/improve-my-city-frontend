import type { Issue, IssueStatus, IssueCategory, Comment } from '../types';
import { mockIssues } from './mockData';

// Mock delay to mimic network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class IssuesAPI {
  private issues: Issue[] = [...mockIssues];

  async getAllIssues(): Promise<Issue[]> {
    await delay(600);
    return [...this.issues].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getIssueById(id: string): Promise<Issue | null> {
    await delay(400);
    return this.issues.find(issue => issue.id === id) || null;
  }

  async getIssuesByUser(userId: string): Promise<Issue[]> {
    await delay(500);
    return this.issues
      .filter(issue => issue.reportedBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getResolvedIssues(): Promise<Issue[]> {
    await delay(500);
    return this.issues
      .filter(issue => issue.status === 'Resolved')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createIssue(
    title: string,
    description: string,
    category: IssueCategory,
    priority: 'Low' | 'Medium' | 'High',
    location: { address: string; latitude: number; longitude: number },
    photos: string[],
    userId: string,
    userName: string
  ): Promise<Issue> {
    await delay(800);

    const newIssue: Issue = {
      id: Date.now().toString(),
      title,
      description,
      category,
      status: 'Pending',
      priority,
      location,
      photos,
      reportedBy: userId,
      reportedByName: userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      comments: [],
    };

    this.issues.push(newIssue);
    return newIssue;
  }

  async updateIssueStatus(issueId: string, status: IssueStatus): Promise<Issue> {
    await delay(500);

    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    issue.status = status;
    issue.updatedAt = new Date().toISOString();
    
    if (status === 'Resolved') {
      issue.resolvedAt = new Date().toISOString();
    }

    return issue;
  }

  async upvoteIssue(issueId: string, userId: string): Promise<Issue> {
    await delay(300);

    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    if (issue.upvotedBy.includes(userId)) {
      // Remove upvote
      issue.upvotedBy = issue.upvotedBy.filter(id => id !== userId);
      issue.upvotes--;
    } else {
      // Add upvote
      issue.upvotedBy.push(userId);
      issue.upvotes++;
    }

    issue.updatedAt = new Date().toISOString();
    return issue;
  }

  async addComment(issueId: string, userId: string, userName: string, text: string): Promise<Comment> {
    await delay(400);

    const issue = this.issues.find(i => i.id === issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    const comment: Comment = {
      id: `c${Date.now()}`,
      issueId,
      userId,
      userName,
      text,
      createdAt: new Date().toISOString(),
    };

    issue.comments.push(comment);
    issue.updatedAt = new Date().toISOString();

    return comment;
  }

  async deleteIssue(issueId: string, userId: string): Promise<void> {
    await delay(400);

    const issueIndex = this.issues.findIndex(i => i.id === issueId);
    if (issueIndex === -1) {
      throw new Error('Issue not found');
    }

    const issue = this.issues[issueIndex];
    if (issue.reportedBy !== userId) {
      throw new Error('You can only delete your own issues');
    }

    this.issues.splice(issueIndex, 1);
  }

  async getIssueStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
  }> {
    await delay(300);

    return {
      total: this.issues.length,
      pending: this.issues.filter(i => i.status === 'Pending').length,
      inProgress: this.issues.filter(i => i.status === 'In Progress').length,
      resolved: this.issues.filter(i => i.status === 'Resolved').length,
      rejected: this.issues.filter(i => i.status === 'Rejected').length,
    };
  }
}

export const issuesAPI = new IssuesAPI();
