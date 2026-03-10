import type { Pipe } from '../../types/game';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PIPE_SPEED,
  PIPE_GAP,
  PIPE_WIDTH,
  PIPE_SPAWN_INTERVAL,
  GROUND_HEIGHT,
} from '../../utils/constants';
import { randomRange } from '../../utils/math';

export function spawnPipe(): Pipe {
  const playableHeight = GAME_HEIGHT - GROUND_HEIGHT;
  const minCenter = 80 + PIPE_GAP / 2;
  const maxCenter = playableHeight - 80 - PIPE_GAP / 2;
  const center = randomRange(minCenter, maxCenter);

  return {
    x: GAME_WIDTH,
    topHeight: center - PIPE_GAP / 2,
    gap: PIPE_GAP,
    passed: false,
  };
}

export function updatePipes(pipes: Pipe[], dt: number): void {
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= PIPE_SPEED * dt;
    if (pipes[i].x + PIPE_WIDTH < -10) {
      pipes.splice(i, 1);
    }
  }
}

export function shouldSpawnPipe(pipeTimer: number): boolean {
  return pipeTimer >= PIPE_SPAWN_INTERVAL;
}
