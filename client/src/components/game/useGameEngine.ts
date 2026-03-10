import { useRef, useEffect, useCallback } from 'react';
import type { GameState } from '../../types/game';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PIPE_SPEED,
  PIPE_SPAWN_INTERVAL,
  PIPE_WIDTH,
  GROUND_SPEED,
  MAX_DELTA_TIME,
  COLORS,
} from '../../utils/constants';
import { createBird, updateBird, flapBird } from './physics';
import { spawnPipe, updatePipes, shouldSpawnPipe } from './pipeSystem';
import { checkCollision } from './collision';
import { render } from './rendering';

// Reuse a single AudioContext to prevent resource leak / lag
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!_audioCtx || _audioCtx.state === 'closed') {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      _audioCtx = new Ctor();
    }
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  } catch {
    return null;
  }
}

function playSound(type: 'flap' | 'score' | 'hit') {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'flap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'score') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
    // Auto-disconnect after sound finishes to free nodes
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch {
    /* audio not available */
  }
}

function createInitialState(): GameState {
  return {
    bird: createBird(),
    pipes: [],
    particles: [],
    currentScore: 0,
    pipeTimer: 0,
    groundOffset: 0,
    cloudOffset: 0,
    isDead: false,
    isStarted: false,
  };
}

interface UseGameEngineOpts {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onGameOver: (score: number) => void;
  onScoreChange: (score: number) => void;
}

export function useGameEngine({ canvasRef, onGameOver, onScoreChange }: UseGameEngineOpts) {
  const stateRef = useRef<GameState>(createInitialState());
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const onGameOverRef = useRef(onGameOver);
  const onScoreChangeRef = useRef(onScoreChange);

  // Keep callback refs updated without causing re-mount
  useEffect(() => {
    onGameOverRef.current = onGameOver;
    onScoreChangeRef.current = onScoreChange;
  }, [onGameOver, onScoreChange]);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.isDead) return;
    if (!s.isStarted) s.isStarted = true;

    flapBird(s.bird);
    playSound('flap');

    // Spawn feather particles (cap at 20)
    for (let i = 0; i < 4; i++) {
      s.particles.push({
        x: s.bird.x,
        y: s.bird.y,
        vx: (Math.random() - 0.5) * 80,
        vy: Math.random() * 40 + 10,
        life: 1.0,
        color: Math.random() > 0.5 ? COLORS.birdBody : COLORS.birdWing,
      });
    }
    if (s.particles.length > 20) {
      s.particles.splice(0, s.particles.length - 20);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    // Reset state on mount
    stateRef.current = createInitialState();
    lastTimeRef.current = 0;

    const update = (dt: number) => {
      const s = stateRef.current;
      if (!s.isStarted || s.isDead) {
        // Still scroll ground and clouds when idle
        s.groundOffset += GROUND_SPEED * dt * 0.5;
        s.cloudOffset += PIPE_SPEED * 0.2 * dt;
        return;
      }

      // Bird
      updateBird(s.bird, dt);

      // Pipe spawning
      s.pipeTimer += dt;
      if (shouldSpawnPipe(s.pipeTimer)) {
        s.pipes.push(spawnPipe());
        s.pipeTimer -= PIPE_SPAWN_INTERVAL;
      }

      // Pipe movement & scoring
      updatePipes(s.pipes, dt);
      for (const p of s.pipes) {
        if (!p.passed && s.bird.x > p.x + PIPE_WIDTH) {
          p.passed = true;
          s.currentScore++;
          onScoreChangeRef.current(s.currentScore);
          playSound('score');
        }
      }

      // Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 2.5 * dt;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // Ground & cloud scroll
      s.groundOffset += GROUND_SPEED * dt;
      s.cloudOffset += PIPE_SPEED * 0.2 * dt;

      // Collision
      if (checkCollision(s.bird, s.pipes)) {
        s.isDead = true;
        playSound('hit');
        onGameOverRef.current(s.currentScore);
      }
    };

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, MAX_DELTA_TIME);
      lastTimeRef.current = timestamp;

      update(dt);
      render(ctx, stateRef.current);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    // Input handlers
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    const handlePointer = (e: Event) => {
      e.preventDefault();
      jump();
    };

    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('pointerdown', handlePointer);
    canvas.addEventListener('touchstart', handlePointer, { passive: false });

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('pointerdown', handlePointer);
      canvas.removeEventListener('touchstart', handlePointer);
    };
  }, [canvasRef, jump]);
}
