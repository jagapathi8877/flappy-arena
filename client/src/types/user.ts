export interface UserData {
  id: string;
  rollNumber: string;
  name: string;
  gender?: 'M' | 'F';
  bestScore: number;
}

export interface LeaderboardEntry {
  id: string;
  rollNumber: string;
  name: string;
  gender?: 'M' | 'F';
  bestScore: number;
}
