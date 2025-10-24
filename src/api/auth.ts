import type { User } from '../types';
import { mockUsers } from './mockData';

// Mock delay to mimic network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AuthAPI {
  private users: User[] = [...mockUsers];
  private currentUser: User | null = null;

  async login(email: string, _password: string): Promise<User> {
    await delay(800);
    
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // In a real app, we'd verify the password
    // For mock purposes, accept any password
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  async register(name: string, email: string, _password: string): Promise<User> {
    await delay(800);
    
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    this.currentUser = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
    
    return newUser;
  }

  async loginWithGoogle(): Promise<User> {
    await delay(1000);
    
    // Mock Google login - create a random user
    const randomId = Date.now().toString();
    const user: User = {
      id: randomId,
      name: 'Google User',
      email: `user${randomId}@gmail.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomId}`,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    
    this.users.push(user);
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        return this.currentUser;
      } catch {
        return null;
      }
    }
    
    return null;
  }
}

export const authAPI = new AuthAPI();
