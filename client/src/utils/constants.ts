// Canvas dimensions
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;

// Physics
export const GRAVITY = 1250;
export const JUMP_STRENGTH = -360;
export const MAX_FALL_VELOCITY = 520;

// Pipes
export const PIPE_SPEED = 195;
export const PIPE_GAP = 118;
export const PIPE_SPAWN_INTERVAL = 1.3;
export const PIPE_WIDTH = 60;
export const PIPE_CAP_HEIGHT = 26;
export const PIPE_CAP_OVERHANG = 6;

// Bird
export const BIRD_SIZE = 17;
export const BIRD_FLAP_SPEED = 8; // frames per second for wing animation

// Ground
export const GROUND_HEIGHT = 70;
export const GROUND_SPEED = 195; // matches pipe speed

// Collision
export const HITBOX_MARGIN = 3;

// Colors — Flappy Bird palette
export const COLORS = {
  skyTop: '#4ec0ca',
  skyBottom: '#70c5ce',
  cloud: '#ffffff',
  pipeBody: '#5ac941',
  pipeBorder: '#3aa12a',
  pipeCap: '#5ac941',
  pipeCapBorder: '#3aa12a',
  groundTop: '#8bc34a',
  groundDirt: '#ded895',
  groundDirtDark: '#c4a243',
  birdBody: '#ffd93b',
  birdWing: '#f5a623',
  birdBeak: '#ff6b35',
  birdEye: '#ffffff',
  birdPupil: '#2b2b2b',
  textDark: '#2b2b2b',
  scoreWhite: '#ffffff',
  scoreStroke: '#2b2b2b',
} as const;

// Max delta time clamp (prevents physics explosions)
export const MAX_DELTA_TIME = 0.05;
