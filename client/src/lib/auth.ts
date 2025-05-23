const AUTH_KEY = 'catalog-auth';

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    username: string;
    role: 'admin';
  };
}

export class AuthManager {
  private getAuthState(): AuthState {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : { isAuthenticated: false };
    } catch {
      return { isAuthenticated: false };
    }
  }

  private saveAuthState(state: AuthState): void {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  login(username: string, password: string): boolean {
    // Simple admin login - in production this would validate against a real backend
    if (username === 'admin' || password === 'admin') {
      const authState: AuthState = {
        isAuthenticated: true,
        user: {
          username: username || 'admin',
          role: 'admin',
        },
      };
      this.saveAuthState(authState);
      return true;
    }
    return false;
  }

  logout(): void {
    this.saveAuthState({ isAuthenticated: false });
  }

  isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  }

  getUser() {
    return this.getAuthState().user;
  }
}

export const auth = new AuthManager();
