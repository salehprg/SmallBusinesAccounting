import axios from 'axios';

// Define the base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://159.69.94.184:7100/';

// Create the axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  roles: string[];
  permissions: string[];
}

// Token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Set up interceptors
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.data.code != 200) {
      return Promise.reject(response);
    }
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Redirect to login on authentication errors
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/api/Auth/login', credentials);
  const data = response.data.data;

  // Store auth info
  setToken(data.token);
  setUser(data);

  return data;
};

export const register = async (userData: any): Promise<AuthResponse> => {
  const response = await api.post('/api/Auth/register', userData);
  return response.data.data;
};

export const logout = (): void => {
  removeToken();
  removeUser();

  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
  }
};

export const getUser = (): AuthResponse | null => {
  if (typeof window !== 'undefined') {
    const user = sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const setUser = (user: AuthResponse): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(USER_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUserPermissions = (): string[] => {
  const user = getUser();
  return user?.permissions || [];
};

export const hasPermission = (permission: string): boolean => {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
}; 