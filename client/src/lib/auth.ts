const AUTH_KEY = 'catalog-auth';

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    username: string;
    role: 'admin';
    permissions: {
      canEditProducts: boolean;
      canViewPrices: boolean;
      canEditPrices: boolean;
      priceLevel: 'basic' | 'premium' | 'vip'; // Controla quais preços o usuário vê
    };
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
    // Sistema de usuários com diferentes permissões
    const users = {
      'MoveisBonafe': {
        password: 'Bonafe1108',
        permissions: {
          canEditProducts: true,
          canViewPrices: true,
          canEditPrices: true,
          priceLevel: 'vip' as const
        }
      },
      'Loja': {
        password: 'Bonafe1108',
        permissions: {
          canEditProducts: true,
          canViewPrices: true,
          canEditPrices: true,
          priceLevel: 'vip' as const
        }
      },
      'Vendedor1': {
        password: 'vend123',
        permissions: {
          canEditProducts: false,
          canViewPrices: true,
          canEditPrices: false,
          priceLevel: 'premium' as const
        }
      },
      'Vendedor2': {
        password: 'vend456',
        permissions: {
          canEditProducts: false,
          canViewPrices: true,
          canEditPrices: false,
          priceLevel: 'basic' as const
        }
      }
    };

    const user = users[username as keyof typeof users];
    if (user && user.password === password) {
      const authState: AuthState = {
        isAuthenticated: true,
        user: {
          username: username,
          role: 'admin',
          permissions: user.permissions,
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
