import AsyncStorage from '@react-native-async-storage/async-storage';

class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string | null> | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;
    return result;
  }

  private async performRefresh(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await fetch('https://jholabazar.onrender.com/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.accessToken) {
          await AsyncStorage.setItem('authToken', data.data.accessToken);
          return data.data.accessToken;
        }
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    let token = await AsyncStorage.getItem('authToken');
    
    const makeRequest = (authToken: string) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${authToken}`
        }
      });
    };

    if (!token) {
      token = await this.refreshToken();
      if (!token) throw new Error('No valid token available');
    }

    let response = await makeRequest(token);

    if (response.status === 401) {
      token = await this.refreshToken();
      if (token) {
        response = await makeRequest(token);
      }
    }

    return response;
  }
}

export const tokenManager = TokenManager.getInstance();