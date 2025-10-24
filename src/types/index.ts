export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

export type IssueCategory = 
  | 'Pothole'
  | 'Garbage'
  | 'Streetlight'
  | 'Water Supply'
  | 'Drainage'
  | 'Road Damage'
  | 'Parks'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: 'Low' | 'Medium' | 'High';
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  photos: string[];
  reportedBy: string; // user id
  reportedByName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  upvotes: number;
  upvotedBy: string[]; // array of user ids
  comments: Comment[];
  assignedTo?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  issueId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface IssueFilters {
  status?: IssueStatus;
  category?: IssueCategory;
  priority?: 'Low' | 'Medium' | 'High';
  searchQuery?: string;
}
