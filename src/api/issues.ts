import type { Issue, IssueStatus, IssueCategory, Comment } from '../types';
import { mockIssues } from './mockData';

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

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getFilteredIssues(
    category?: IssueCategory | 'All',
    location?: { latitude: number; longitude: number } | null
  ): Promise<Issue[]> {
    await delay(500);
    
    let filtered = [...this.issues];

    // Filter by category
    if (category && category !== 'All') {
      filtered = filtered.filter(issue => issue.category === category);
    }

    // Filter and sort by location
    if (location && location.latitude && location.longitude) {
      filtered = filtered.map(issue => ({
        ...issue,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          issue.location.latitude,
          issue.location.longitude
        ),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else {
      // Default sort by date
      filtered = filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }

  // Geocoding mock - in real app, this would call a geocoding API
  async geocodeLocation(query: string): Promise<{ latitude: number; longitude: number } | null> {
    await delay(400);
    
    // Mock geocoding - returns random coordinates near a city center
    // In production, integrate with Google Maps, Mapbox, or OpenStreetMap API
    if (!query.trim()) return null;
    
    // Mock coordinates (e.g., for demo purposes)
    const mockCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
      'downtown': { latitude: 40.7128, longitude: -74.0060 },
      'uptown': { latitude: 40.7829, longitude: -73.9654 },
      'brooklyn': { latitude: 40.6782, longitude: -73.9442 },
    };

    const lowerQuery = query.toLowerCase();
    for (const [key, coords] of Object.entries(mockCoordinates)) {
      if (lowerQuery.includes(key)) {
        return coords;
      }
    }

    // Return random coordinates as fallback
    return {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.2,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.2,
    };
  }
}

export const issuesAPI = new IssuesAPI();
