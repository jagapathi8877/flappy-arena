import type { GameState } from '../../types/game';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PIPE_WIDTH,
  PIPE_CAP_HEIGHT,
  PIPE_CAP_OVERHANG,
  GROUND_HEIGHT,
} from '../../utils/constants';

// ===== CLASSIC FLAPPY BIRD COLOR PALETTE =====
const SKY_TOP = '#4dc9f6';
const SKY_BOTTOM = '#70c5ce';
const CLOUD_COLOR = 'rgba(255,255,255,0.9)';

// City / buildings silhouette
const BUILDING_DARK = '#6aaa3b';
const BUILDING_MID = '#8ec63f';
const BUILDING_LIGHT = '#b5d76b';

// Pipes — classic bright green with dark outlines
const PIPE_FILL = '#73bf2e';
const PIPE_FILL_LIGHT = '#8cd630';
const PIPE_BORDER = '#3e6f1b';
const PIPE_HIGHLIGHT = 'rgba(255,255,255,0.18)';
const PIPE_SHADOW = 'rgba(0,0,0,0.12)';

// Ground
const GRASS_GREEN = '#5cb83a';
const DIRT_TAN = '#ded895';
const DIRT_DARK = '#c4a243';

// Score
const SCORE_WHITE = '#ffffff';
const SCORE_STROKE = '#555555';

// ===== DRAWING HELPERS =====

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ===== BACKGROUND =====

function drawBackground(ctx: CanvasRenderingContext2D, cloudOffset: number) {
  const skyH = GAME_HEIGHT - GROUND_HEIGHT;

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, skyH);
  grad.addColorStop(0, SKY_TOP);
  grad.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_WIDTH, skyH);

  // --- Clouds (soft puffy) ---
  ctx.fillStyle = CLOUD_COLOR;
  const clouds = [
    { x: 50, y: 70, s: 1.1 },
    { x: 190, y: 45, s: 0.75 },
    { x: 320, y: 95, s: 0.9 },
    { x: 470, y: 55, s: 0.65 },
    { x: -30, y: 110, s: 0.8 },
  ];
  for (const c of clouds) {
    const cx = ((c.x - cloudOffset * 0.25 + GAME_WIDTH + 200) % (GAME_WIDTH + 200)) - 100;
    const cy = c.y;
    const sc = c.s;
    ctx.beginPath();
    ctx.arc(cx, cy, 22 * sc, 0, Math.PI * 2);
    ctx.arc(cx + 18 * sc, cy - 10 * sc, 16 * sc, 0, Math.PI * 2);
    ctx.arc(cx + 35 * sc, cy - 2 * sc, 20 * sc, 0, Math.PI * 2);
    ctx.arc(cx - 14 * sc, cy + 3 * sc, 15 * sc, 0, Math.PI * 2);
    ctx.arc(cx + 12 * sc, cy + 4 * sc, 18 * sc, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- City / bush silhouette (distant, behind pipes) ---
  const silhouetteY = skyH - 30;
  drawCitySilhouette(ctx, cloudOffset, silhouetteY);
}

function drawCitySilhouette(
  ctx: CanvasRenderingContext2D,
  offset: number,
  baseY: number,
) {
  // Simple layered bush/building shapes scrolling slowly
  const speed = 0.08;
  const ox = (offset * speed) % 400;

  // Back layer (darker, taller)
  ctx.fillStyle = BUILDING_DARK;
  const backBuildings = [
    { x: 0, w: 30, h: 35 },
    { x: 40, w: 25, h: 50 },
    { x: 75, w: 35, h: 30 },
    { x: 120, w: 28, h: 55 },
    { x: 160, w: 40, h: 25 },
    { x: 210, w: 30, h: 45 },
    { x: 255, w: 35, h: 32 },
    { x: 300, w: 25, h: 48 },
    { x: 340, w: 38, h: 28 },
    { x: 385, w: 30, h: 40 },
    { x: 425, w: 28, h: 52 },
    { x: 465, w: 35, h: 30 },
  ];
  for (const b of backBuildings) {
    const bx = ((b.x - ox + 500) % 500) - 50;
    ctx.fillRect(bx, baseY - b.h + 10, b.w, b.h);
  }

  // Front layer (lighter, shorter)
  ctx.fillStyle = BUILDING_MID;
  const frontBushes = [
    { x: 15, w: 35, h: 18 },
    { x: 65, w: 40, h: 22 },
    { x: 115, w: 30, h: 15 },
    { x: 170, w: 45, h: 20 },
    { x: 230, w: 35, h: 24 },
    { x: 280, w: 40, h: 16 },
    { x: 335, w: 30, h: 22 },
    { x: 380, w: 42, h: 18 },
    { x: 435, w: 35, h: 20 },
    { x: 480, w: 40, h: 24 },
  ];
  for (const b of frontBushes) {
    const bx = ((b.x - ox * 1.3 + 540) % 540) - 40;
    ctx.beginPath();
    ctx.ellipse(bx + b.w / 2, baseY + 5, b.w / 2, b.h, 0, Math.PI, 0);
    ctx.fill();
  }

  // Horizon line
  ctx.fillStyle = BUILDING_LIGHT;
  ctx.fillRect(0, baseY + 2, GAME_WIDTH, 8);
}

// ===== PIPES — CLASSIC STYLE =====

function drawSinglePipe(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  height: number,
  capAtStart: boolean, // true = cap at top of this segment
) {
  if (height <= 0) return;

  const bodyX = x;
  const bodyW = PIPE_WIDTH;

  // Pipe body
  const bodyGrad = ctx.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
  bodyGrad.addColorStop(0, PIPE_FILL);
  bodyGrad.addColorStop(0.3, PIPE_FILL_LIGHT);
  bodyGrad.addColorStop(0.7, PIPE_FILL);
  bodyGrad.addColorStop(1, PIPE_BORDER);
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(bodyX, topY, bodyW, height);

  // Pipe body border
  ctx.strokeStyle = PIPE_BORDER;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(bodyX, topY, bodyW, height);

  // Left highlight
  ctx.fillStyle = PIPE_HIGHLIGHT;
  ctx.fillRect(bodyX + 5, topY, 7, height);

  // Right shadow
  ctx.fillStyle = PIPE_SHADOW;
  ctx.fillRect(bodyX + bodyW - 8, topY, 8, height);

  // --- Cap ---
  const capX = x - PIPE_CAP_OVERHANG;
  const capW = bodyW + PIPE_CAP_OVERHANG * 2;
  const capH = PIPE_CAP_HEIGHT;
  const capY = capAtStart ? topY : topY + height - capH;

  // Cap gradient
  const capGrad = ctx.createLinearGradient(capX, 0, capX + capW, 0);
  capGrad.addColorStop(0, PIPE_FILL);
  capGrad.addColorStop(0.25, PIPE_FILL_LIGHT);
  capGrad.addColorStop(0.75, PIPE_FILL);
  capGrad.addColorStop(1, PIPE_BORDER);

  ctx.fillStyle = capGrad;
  drawRoundRect(ctx, capX, capY, capW, capH, 4);
  ctx.fill();
  ctx.strokeStyle = PIPE_BORDER;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Cap highlight
  ctx.fillStyle = PIPE_HIGHLIGHT;
  ctx.fillRect(capX + 5, capY + 3, 7, capH - 6);

  // Cap top/bottom edge line
  ctx.fillStyle = PIPE_SHADOW;
  ctx.fillRect(capX + 2, capAtStart ? capY + capH - 3 : capY + 1, capW - 4, 2);
}

// ===== GROUND =====

function drawGround(ctx: CanvasRenderingContext2D, groundOffset: number) {
  const gy = GAME_HEIGHT - GROUND_HEIGHT;

  // Grass strip
  ctx.fillStyle = GRASS_GREEN;
  ctx.fillRect(0, gy, GAME_WIDTH, 14);

  // Grass highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(0, gy, GAME_WIDTH, 4);

  // Dirt
  ctx.fillStyle = DIRT_TAN;
  ctx.fillRect(0, gy + 14, GAME_WIDTH, GROUND_HEIGHT - 14);

  // Scrolling dirt stripes
  ctx.fillStyle = DIRT_DARK;
  const stripeW = 28;
  for (let i = -2; i < GAME_WIDTH / stripeW + 3; i++) {
    const px = i * stripeW - (groundOffset % stripeW);
    ctx.fillRect(px, gy + 18, 14, 5);
    ctx.fillRect(px + 8, gy + 28, 14, 5);
    ctx.fillRect(px + 3, gy + 38, 10, 4);
  }
}

// ===== CLASSIC FLAPPY BIRD =====

function drawBird(ctx: CanvasRenderingContext2D, bird: GameState['bird']) {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.angle);

  // R = collision radius; we draw visually larger for quality
  const R = bird.size * 1.15;
  const RX = R * 0.92;                  // horizontal radius (slightly narrower)
  const RY = R * 0.78;                  // vertical radius   (shorter → slim oval)
  const OC = '#543416';                 // outline: dark brown
  const LW = Math.max(2.2, R * 0.16);  // outline stroke

  // ---- Tail feathers ----
  ctx.save();
  ctx.strokeStyle = OC;
  ctx.lineWidth = LW * 0.55;
  ctx.lineCap = 'round';
  const tailX = -RX * 0.95;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(tailX, i * RY * 0.22);
    ctx.lineTo(tailX - R * 0.32, i * RY * 0.38);
    ctx.stroke();
  }
  ctx.restore();

  // ---- Wing (behind body) ----
  const wf = bird.flapFrame % 3;
  const wingDY = wf === 0 ? RY * 0.55 : wf === 2 ? -RY * 0.55 : 0;
  const wingAngle = wf === 0 ? 0.35 : wf === 2 ? -0.35 : 0;

  ctx.save();
  ctx.translate(-RX * 0.18, wingDY);
  ctx.rotate(wingAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, RX * 0.55, RY * 0.38, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#D4A820';
  ctx.fill();
  ctx.strokeStyle = OC;
  ctx.lineWidth = LW;
  ctx.stroke();
  ctx.restore();

  // ---- Body (slim oval) ----
  ctx.beginPath();
  ctx.ellipse(0, 0, RX, RY, 0, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(
    -RX * 0.2, -RY * 0.25, R * 0.04,
    0, 0, R * 0.92,
  );
  bg.addColorStop(0, '#FCE038');
  bg.addColorStop(0.5, '#F8C830');
  bg.addColorStop(1, '#E4AD18');
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = OC;
  ctx.lineWidth = LW;
  ctx.stroke();

  // ---- Beak ----
  const beakCX = RX * 0.82;
  // Top beak — orange
  ctx.beginPath();
  ctx.ellipse(beakCX, -RY * 0.03, RX * 0.58, RY * 0.28, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = '#F07030';
  ctx.fill();
  ctx.strokeStyle = OC;
  ctx.lineWidth = LW * 0.7;
  ctx.stroke();

  // Bottom beak — red-orange
  ctx.beginPath();
  ctx.ellipse(beakCX, RY * 0.07, RX * 0.48, RY * 0.24, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#E04828';
  ctx.fill();
  ctx.strokeStyle = OC;
  ctx.lineWidth = LW * 0.7;
  ctx.stroke();

  // ---- Eye (white) ----
  const eyeX = RX * 0.32;
  const eyeY = -RY * 0.30;
  const eyeR = RY * 0.50;

  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = OC;
  ctx.lineWidth = LW * 0.75;
  ctx.stroke();

  // ---- Pupil ----
  const pupX = eyeX + eyeR * 0.28;
  const pupY = eyeY + eyeR * 0.10;
  const pupR = eyeR * 0.50;

  ctx.beginPath();
  ctx.arc(pupX, pupY, pupR, 0, Math.PI * 2);
  ctx.fillStyle = '#1A1A2E';
  ctx.fill();

  // Pupil glint
  ctx.beginPath();
  ctx.arc(pupX - pupR * 0.35, pupY - pupR * 0.35, pupR * 0.30, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fill();

  ctx.restore();
}

// ===== SCORE =====

function drawScore(ctx: CanvasRenderingContext2D, score: number) {
  ctx.save();
  ctx.font = 'bold 52px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 5;
  ctx.strokeStyle = SCORE_STROKE;
  ctx.fillStyle = SCORE_WHITE;
  ctx.strokeText(String(score), GAME_WIDTH / 2, 65);
  ctx.fillText(String(score), GAME_WIDTH / 2, 65);
  ctx.restore();
}

// ===== START MESSAGE =====

function drawStartMessage(ctx: CanvasRenderingContext2D) {
  ctx.save();

  // Semi-transparent panel
  const panelW = 240;
  const panelH = 80;
  const px = (GAME_WIDTH - panelW) / 2;
  const py = GAME_HEIGHT / 2 - 70;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  drawRoundRect(ctx, px, py, panelW, panelH, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = 'bold 20px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2b2b2b';
  ctx.fillText('TAP OR PRESS SPACE', GAME_WIDTH / 2, py + 35);
  ctx.font = '15px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(43,43,43,0.55)';
  ctx.fillText('to start playing', GAME_WIDTH / 2, py + 58);

  ctx.restore();
}

// ===== MAIN RENDER =====

export function render(ctx: CanvasRenderingContext2D, state: GameState) {
  // 1. Background (sky + clouds + city silhouette)
  drawBackground(ctx, state.cloudOffset);

  // 2. Pipes
  const playableHeight = GAME_HEIGHT - GROUND_HEIGHT;
  for (const p of state.pipes) {
    // Top pipe: body goes from y=0 down to topHeight, cap is at the bottom of this segment
    drawSinglePipe(ctx, p.x, 0, p.topHeight, false);
    // Bottom pipe: body goes from gap bottom to ground, cap at the top of this segment
    const bottomY = p.topHeight + p.gap;
    drawSinglePipe(ctx, p.x, bottomY, playableHeight - bottomY, true);
  }

  // 3. Ground (in front of everything except bird/score)
  drawGround(ctx, state.groundOffset);

  // 4. Bird
  drawBird(ctx, state.bird);

  // 5. Particles
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // 6. Score
  if (state.isStarted) {
    drawScore(ctx, state.currentScore);
  }

  // 7. Start message
  if (!state.isStarted && !state.isDead) {
    drawStartMessage(ctx);
  }
}
