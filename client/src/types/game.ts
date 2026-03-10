export interface Pipe {
  x: number;
  topHeight: number;
  gap: number;
  passed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface BirdState {
  x: number;
  y: number;
  velocity: number;
  size: number;
  angle: number;
  flapFrame: number;
  flapTimer: number;
}

export interface GameState {
  bird: BirdState;
  pipes: Pipe[];
  particles: Particle[];
  currentScore: number;
  pipeTimer: number;
  groundOffset: number;
  cloudOffset: number;
  isDead: boolean;
  isStarted: boolean;
}
