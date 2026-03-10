import type { BirdState, Pipe } from '../../types/game';
import {
  GAME_HEIGHT,
  PIPE_WIDTH,
  HITBOX_MARGIN,
  GROUND_HEIGHT,
} from '../../utils/constants';

export function checkCollision(bird: BirdState, pipes: Pipe[]): boolean {
  const playableHeight = GAME_HEIGHT - GROUND_HEIGHT;

  // Floor / Ceiling
  if (bird.y + bird.size >= playableHeight || bird.y - bird.size <= 0) {
    return true;
  }

  // Pipe collision with forgiving hitbox
  for (const p of pipes) {
    const m = HITBOX_MARGIN;
    const hitX =
      bird.x + bird.size - m > p.x && bird.x - bird.size + m < p.x + PIPE_WIDTH;
    const hitTop = bird.y - bird.size + m < p.topHeight;
    const hitBot = bird.y + bird.size - m > p.topHeight + p.gap;

    if (hitX && (hitTop || hitBot)) return true;
  }

  return false;
}
