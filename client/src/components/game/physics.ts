import type { BirdState } from '../../types/game';
import { GRAVITY, JUMP_STRENGTH, MAX_FALL_VELOCITY, GAME_HEIGHT, BIRD_SIZE, BIRD_FLAP_SPEED } from '../../utils/constants';
import { clamp } from '../../utils/math';

export function createBird(): BirdState {
  return {
    x: 100,
    y: GAME_HEIGHT / 2,
    velocity: 0,
    size: BIRD_SIZE,
    angle: 0,
    flapFrame: 0,
    flapTimer: 0,
  };
}

export function updateBird(bird: BirdState, dt: number): void {
  bird.velocity += GRAVITY * dt;
  bird.velocity = clamp(bird.velocity, -999, MAX_FALL_VELOCITY);
  bird.y += bird.velocity * dt;

  // Tilt: nose up when flapping, nose down when falling
  bird.angle = clamp(bird.velocity * 0.003, -Math.PI / 6, Math.PI / 3);

  // Wing flap animation cycle
  bird.flapTimer += dt;
  if (bird.flapTimer >= 1 / BIRD_FLAP_SPEED) {
    bird.flapTimer -= 1 / BIRD_FLAP_SPEED;
    bird.flapFrame = (bird.flapFrame + 1) % 3;
  }
}

export function flapBird(bird: BirdState): void {
  bird.velocity = JUMP_STRENGTH;
  bird.flapFrame = 1; // Wings up
}
