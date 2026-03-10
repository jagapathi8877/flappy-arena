import type { UserData, LeaderboardEntry } from '../types/user';

const BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  async login(rollNumber: string, password: string): Promise<{ token: string; user: UserData }> {
    const data = await request<{ token: string; user: UserData }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNumber, password }),
    });
    localStorage.setItem('token', data.token);
    return data;
  },

  async getMe(): Promise<UserData> {
    return request<UserData>('/auth/me', { headers: authHeaders() });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await request('/auth/change-password', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async submitScore(score: number): Promise<{ newBest: boolean; score: number; bestScore: number }> {
    return request('/scores/submit', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ score }),
    });
  },

  async getAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
    return request('/leaderboard/alltime');
  },

  async getWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
    return request('/leaderboard/weekly');
  },

  logout() {
    localStorage.removeItem('token');
  },

  isLoggedIn(): boolean {
    return !!getToken();
  },
};
