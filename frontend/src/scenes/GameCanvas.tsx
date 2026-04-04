import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGS, ssFor, family as detectFamily } from '@/store/useGS';
import type { ScenarioStep, StepState } from '@/types';
import { LessonDialog } from '@/components/game/LessonDialog';
import { EncounterDialog } from '@/components/game/EncounterDialog';
import { ConsequenceOverlay } from '@/components/game/ConsequenceOverlay';
import { GameHUD } from '@/components/game/GameHUD';

const WORLD_WIDTH = 1320;
const WORLD_HEIGHT = 840;

type LocationNode = {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bg: string;
  border: string;
  accent: string;
  label: string;
  desc: string;
};

type MissionLayout = {
  locs: string[];
  conns: Array<{ f: string; t: string }>;
};

const LOCATIONS: Record<string, LocationNode> = {
  'office-hq': { name: 'office-hq', x: 56, y: 72, w: 382, h: 230, bg: '#e9f8ff', border: '#88d4ef', accent: '#167ca2', label: 'ШТАБ', desc: 'Рабочие письма и задачи' },
  'soc-room': { name: 'soc-room', x: 462, y: 432, w: 392, h: 240, bg: '#eef5ff', border: '#a7c6f2', accent: '#3567b6', label: 'SOC', desc: 'Проверка инцидентов и логов' },
  'meeting-room': { name: 'meeting-room', x: 882, y: 82, w: 382, h: 228, bg: '#fff1f4', border: '#f0afbe', accent: '#ae4261', label: 'ПЕРЕГОВОРКА', desc: 'Звонки и запросы от руководства' },

  apartment: { name: 'apartment', x: 62, y: 84, w: 372, h: 226, bg: '#fff0f7', border: '#efadd2', accent: '#af3b72', label: 'КВАРТИРА', desc: 'Личный ноутбук и смартфон' },
  courtyard: { name: 'courtyard', x: 456, y: 430, w: 386, h: 236, bg: '#efffee', border: '#9edaa7', accent: '#2a8b46', label: 'ДВОР', desc: 'Повседневные уведомления и звонки' },
  mailbox: { name: 'mailbox', x: 884, y: 94, w: 378, h: 230, bg: '#fff8e6', border: '#ecd07b', accent: '#b78810', label: 'ПОЧТОМАТ', desc: 'Доставка, коды и личные сервисы' },

  'coffee-bar': { name: 'coffee-bar', x: 58, y: 80, w: 378, h: 226, bg: '#fff4de', border: '#ebc66a', accent: '#b17700', label: 'КОФЕЙНЯ', desc: 'Открытый Wi-Fi и быстрые покупки' },
  'station-hall': { name: 'station-hall', x: 468, y: 432, w: 388, h: 236, bg: '#eef6ff', border: '#a2c7ef', accent: '#2d6cab', label: 'ВОКЗАЛ', desc: 'Публичные точки доступа' },
  metro: { name: 'metro', x: 888, y: 98, w: 374, h: 228, bg: '#f3edff', border: '#ccb3f0', accent: '#715bb7', label: 'МЕТРО', desc: 'QR, уведомления и спешка' },

  'bank-branch': { name: 'bank-branch', x: 54, y: 86, w: 380, h: 228, bg: '#fff0f1', border: '#efacb5', accent: '#ac3546', label: 'ОТДЕЛЕНИЕ', desc: 'Платежи и переводы' },
  'atm-zone': { name: 'atm-zone', x: 462, y: 428, w: 392, h: 236, bg: '#fff7e8', border: '#ecd288', accent: '#b38313', label: 'ЗОНА ATM', desc: 'Карты, PIN и проверка операций' },
  'market-square': { name: 'market-square', x: 886, y: 96, w: 376, h: 230, bg: '#eefdf7', border: '#95debf', accent: '#20855c', label: 'ПЛОЩАДЬ', desc: 'Переводы и покупки на ходу' },

  airport: { name: 'airport', x: 56, y: 76, w: 382, h: 232, bg: '#eaf8ff', border: '#8fd6ef', accent: '#167da3', label: 'ТЕРМИНАЛ', desc: 'Посадка, багаж и уведомления' },
  hotel: { name: 'hotel', x: 462, y: 430, w: 392, h: 238, bg: '#fff7e8', border: '#ebd18a', accent: '#b58916', label: 'ОТЕЛЬ', desc: 'Заселение и звонки с ресепшена' },
  lounge: { name: 'lounge', x: 884, y: 92, w: 380, h: 232, bg: '#f2edff', border: '#c6b3ef', accent: '#6a57b2', label: 'ЛАУНЖ', desc: 'Публичные зарядки и USB-риски' },

  coworking: { name: 'coworking', x: 60, y: 80, w: 376, h: 228, bg: '#efffe8', border: '#a8df88', accent: '#5d8d12', label: 'КОВОРКИНГ', desc: 'Работа рядом с незнакомыми людьми' },
  'home-office': { name: 'home-office', x: 464, y: 434, w: 388, h: 236, bg: '#eef6ff', border: '#a8c8f0', accent: '#3369b1', label: 'ДОМАШНИЙ ОФИС', desc: 'VPN и личные устройства' },
  'vpn-console': { name: 'vpn-console', x: 886, y: 96, w: 376, h: 232, bg: '#fff0f6', border: '#f0b1cf', accent: '#b33e77', label: 'VPN-ПОРТАЛ', desc: 'Удаленный доступ и обновления' },
};

const MISSION_LAYOUTS: Record<string, MissionLayout> = {
  office: {
    locs: ['office-hq', 'soc-room', 'meeting-room'],
    conns: [
      { f: 'office-hq', t: 'soc-room' },
      { f: 'office-hq', t: 'meeting-room' },
      { f: 'soc-room', t: 'meeting-room' },
    ],
  },
  home: {
    locs: ['apartment', 'courtyard', 'mailbox'],
    conns: [
      { f: 'apartment', t: 'courtyard' },
      { f: 'courtyard', t: 'mailbox' },
      { f: 'apartment', t: 'mailbox' },
    ],
  },
  wifi: {
    locs: ['coffee-bar', 'station-hall', 'metro'],
    conns: [
      { f: 'coffee-bar', t: 'station-hall' },
      { f: 'station-hall', t: 'metro' },
      { f: 'coffee-bar', t: 'metro' },
    ],
  },
  banking: {
    locs: ['bank-branch', 'atm-zone', 'market-square'],
    conns: [
      { f: 'bank-branch', t: 'atm-zone' },
      { f: 'atm-zone', t: 'market-square' },
      { f: 'bank-branch', t: 'market-square' },
    ],
  },
  travel: {
    locs: ['airport', 'hotel', 'lounge'],
    conns: [
      { f: 'airport', t: 'hotel' },
      { f: 'airport', t: 'lounge' },
      { f: 'hotel', t: 'lounge' },
    ],
  },
  remote: {
    locs: ['coworking', 'home-office', 'vpn-console'],
    conns: [
      { f: 'coworking', t: 'home-office' },
      { f: 'home-office', t: 'vpn-console' },
      { f: 'coworking', t: 'vpn-console' },
    ],
  },
};

type EncounterPoint = {
  x: number;
  y: number;
  r: number;
  step: ScenarioStep;
  color: string;
  label: string;
  type: string;
  locName: string;
};

type JoystickState = {
  x: number;
  y: number;
  active: boolean;
};

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value));
}

function shorten(text: string, max = 24) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function fitTextByWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let next = text;
  while (next.length > 1 && ctx.measureText(`${next}…`).width > maxWidth) {
    next = next.slice(0, -1);
  }
  return `${next}…`;
}

function bezierPoint(fx: number, fy: number, cx: number, cy: number, tx: number, ty: number, t: number) {
  const nt = 1 - t;
  return {
    x: nt * nt * fx + 2 * nt * t * cx + t * t * tx,
    y: nt * nt * fy + 2 * nt * t * cy + t * t * ty,
  };
}

function getEncounterSpots(location: LocationNode) {
  const rowBottom = location.y + location.h - 50;
  const rowUpper = location.y + location.h - 86;
  return [
    { x: location.x + 90, y: rowBottom },
    { x: location.x + location.w / 2, y: rowBottom },
    { x: location.x + location.w - 90, y: rowBottom },
    { x: location.x + location.w * 0.34, y: rowUpper },
    { x: location.x + location.w * 0.66, y: rowUpper },
  ];
}

function getEncounters(stepStates: Map<number, StepState>, missionCode?: string, steps?: ScenarioStep[]): EncounterPoint[] {
  if (!missionCode || !steps?.length) return [];

  const layout = MISSION_LAYOUTS[missionCode];
  if (!layout) return [];

  const colors: Record<string, string> = {
    email: '#dc3f4d',
    wifi: '#d39718',
    mobile: '#2c79d7',
    identity: '#8b52d8',
    social: '#1aa06f',
    generic: '#5f6b7a',
  };

  return steps
    .filter(step => !ssFor(stepStates, step.id).resolved)
    .map((step, index) => {
      const locName = layout.locs[index % layout.locs.length];
      const location = LOCATIONS[locName];
      const spots = getEncounterSpots(location);
      const spot = spots[Math.floor(index / layout.locs.length) % spots.length] ?? spots[0];
      const type = detectFamily(step);

      return {
        x: spot.x,
        y: spot.y,
        r: 24,
        step,
        color: colors[type] || colors.generic,
        label: step.attack_type,
        type,
        locName,
      };
    });
}

function drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, dir: string, moving: boolean, frame: number) {
  const bob = moving ? Math.sin(frame * 4) * 1.8 : 0;
  const cy = y + bob;
  const legSwing = moving ? Math.sin(frame * 6) * 5.5 : 0;
  const armSwing = moving ? Math.sin(frame * 6 + Math.PI / 2) * 7 : 0;
  const lookX = dir === 'left' ? -2 : dir === 'right' ? 2 : 0;
  const lookY = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;

  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  ctx.beginPath();
  ctx.ellipse(x, y + 24, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#344250';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 5.5, cy + 12);
  ctx.lineTo(x - 5.5 + legSwing, cy + 25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 5.5, cy + 12);
  ctx.lineTo(x + 5.5 - legSwing, cy + 25);
  ctx.stroke();

  ctx.fillStyle = '#263238';
  ctx.beginPath();
  ctx.ellipse(x - 5.5 + legSwing, cy + 25, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 5.5 - legSwing, cy + 25, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  const shirtGradient = ctx.createLinearGradient(x, cy - 12, x, cy + 14);
  shirtGradient.addColorStop(0, '#41aa62');
  shirtGradient.addColorStop(1, '#1f7446');
  ctx.fillStyle = shirtGradient;
  rr(ctx, x - 12, cy - 12, 24, 26, 5);
  ctx.fill();

  ctx.fillStyle = '#225d37';
  ctx.fillRect(x - 12, cy + 9, 24, 3.5);

  ctx.fillStyle = '#ffffff';
  rr(ctx, x - 6, cy - 7, 12, 8, 2);
  ctx.fill();
  ctx.fillStyle = '#2d8b4d';
  ctx.font = 'bold 5px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ЦИ', x, cy - 3.5);

  ctx.strokeStyle = '#2d8b4d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 12, cy - 2);
  ctx.lineTo(x - 17 - armSwing, cy + 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 12, cy - 2);
  ctx.lineTo(x + 17 + armSwing, cy + 8);
  ctx.stroke();

  ctx.fillStyle = '#ffcc80';
  ctx.beginPath();
  ctx.arc(x - 17 - armSwing, cy + 8, 2.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 17 + armSwing, cy + 8, 2.7, 0, Math.PI * 2);
  ctx.fill();

  const headGradient = ctx.createRadialGradient(x - 1, cy - 18, 0, x, cy - 16, 12);
  headGradient.addColorStop(0, '#ffe0b2');
  headGradient.addColorStop(1, '#ffcc80');
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x, cy - 16, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4e342e';
  ctx.beginPath();
  ctx.arc(x, cy - 20, 11, Math.PI * 1.1, Math.PI * 1.9);
  ctx.fill();

  ctx.fillStyle = '#37474f';
  ctx.beginPath();
  ctx.arc(x - 4 + lookX, cy - 17 + lookY, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 4 + lookX, cy - 17 + lookY, 1.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(x - 6 + lookX, cy - 19 + lookY);
  ctx.lineTo(x - 2 + lookX, cy - 18.3 + lookY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 2 + lookX, cy - 18.3 + lookY);
  ctx.lineTo(x + 6 + lookX, cy - 19 + lookY);
  ctx.stroke();

  ctx.fillStyle = '#4e342e';
  ctx.beginPath();
  ctx.moveTo(x - 7, cy - 12);
  ctx.quadraticCurveTo(x - 8, cy - 4, x - 5, cy - 1);
  ctx.quadraticCurveTo(x, cy + 2, x + 5, cy - 1);
  ctx.quadraticCurveTo(x + 8, cy - 4, x + 7, cy - 12);
  ctx.quadraticCurveTo(x, cy - 8, x - 7, cy - 12);
  ctx.fill();
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const dismissedEncounterIdRef = useRef<number | null>(null);
  const playerRef = useRef({ x: 640, y: 430, dir: 'down' as 'up' | 'down' | 'left' | 'right', moving: false, frame: 0 });
  const joystickRef = useRef({ x: 0, y: 0 });
  const joystickPadRef = useRef<HTMLDivElement>(null);

  const sim = useGS(s => s.sim);
  const stepStates = useGS(s => s.ss);
  const gamePhase = useGS(s => s.gp);
  const encTriggered = useGS(s => s.encTriggered);
  const currentMissionIndex = useGS(s => s.mi);
  const setPPos = useGS(s => s.setPPos);
  const setPDir = useGS(s => s.setPDir);
  const setPMov = useGS(s => s.setPMov);
  const setEncTrig = useGS(s => s.setEncTrig);
  const setEncStep = useGS(s => s.setEncStep);
  const px = useGS(s => s.px);
  const py = useGS(s => s.py);
  const energy = useGS(s => s.energy);
  const shield = useGS(s => s.shield);
  const progress = useGS(s => s.prog);

  const missions = sim?.missions ?? [];
  const currentMission = missions[currentMissionIndex] ?? missions[0] ?? null;
  const totalSteps = currentMission?.steps.length ?? 0;
  const missionResolvedSteps = currentMission?.steps.filter(step => ssFor(stepStates, step.id).resolved).length ?? 0;
  const encounters = useMemo(
    () => getEncounters(stepStates, currentMission?.code, currentMission?.steps),
    [currentMission?.code, currentMission?.steps, stepStates],
  );
  const [encounterStep, setEncounterStepState] = useState<ScenarioStep | null>(null);
  const [hovered, setHovered] = useState<EncounterPoint | null>(null);
  const [joystick, setJoystick] = useState<JoystickState>({ x: 0, y: 0, active: false });

  const layout = currentMission ? MISSION_LAYOUTS[currentMission.code] : null;
  const activeLocations = useMemo(
    () => (layout ? layout.locs.map(locName => LOCATIONS[locName]).filter(Boolean) : []),
    [layout],
  );
  const activeConnections = layout?.conns ?? [];

  const encountersByLocation = useMemo(() => {
    const grouped = new Map<string, EncounterPoint[]>();
    encounters.forEach(encounter => {
      const bucket = grouped.get(encounter.locName) ?? [];
      bucket.push(encounter);
      grouped.set(encounter.locName, bucket);
    });
    return grouped;
  }, [encounters]);

  const resetJoystick = useCallback(() => {
    joystickRef.current = { x: 0, y: 0 };
    setJoystick({ x: 0, y: 0, active: false });
  }, []);

  const updateJoystick = useCallback((clientX: number, clientY: number) => {
    const pad = joystickPadRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const range = rect.width * 0.33;
    let x = (clientX - centerX) / range;
    let y = (clientY - centerY) / range;
    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }
    joystickRef.current = { x, y };
    setJoystick({ x, y, active: true });
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gamePhase !== 'explore') return;
      keysRef.current.add(event.key.toLowerCase());
      event.preventDefault();
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase]);

  useEffect(() => {
    playerRef.current.x = px;
    playerRef.current.y = py;
  }, [px, py]);

  useEffect(() => {
    if (!currentMission) return;
    dismissedEncounterIdRef.current = null;
    keysRef.current.clear();
    setHovered(null);
    resetJoystick();
  }, [currentMission?.id, resetJoystick]);

  useEffect(() => {
    if (gamePhase !== 'explore') {
      keysRef.current.clear();
      resetJoystick();
    }
  }, [gamePhase, resetJoystick]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = canvas.width / WORLD_WIDTH;
    const scaleY = canvas.height / WORLD_HEIGHT;
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const player = playerRef.current;
    const time = Date.now() / 1000;

    if (gamePhase === 'explore') {
      const dismissed = encounters.find(encounter => encounter.step.id === dismissedEncounterIdRef.current);
      if (!dismissed || Math.hypot(player.x - dismissed.x, player.y - dismissed.y) > dismissed.r + 56) {
        dismissedEncounterIdRef.current = null;
      }

      const speed = 2.6;
      let inputX = 0;
      let inputY = 0;

      if (keysRef.current.has('w') || keysRef.current.has('ц') || keysRef.current.has('arrowup')) inputY -= 1;
      if (keysRef.current.has('s') || keysRef.current.has('ы') || keysRef.current.has('arrowdown')) inputY += 1;
      if (keysRef.current.has('a') || keysRef.current.has('ф') || keysRef.current.has('arrowleft')) inputX -= 1;
      if (keysRef.current.has('d') || keysRef.current.has('в') || keysRef.current.has('arrowright')) inputX += 1;

      inputX += joystickRef.current.x;
      inputY += joystickRef.current.y;

      const magnitude = Math.hypot(inputX, inputY);
      if (magnitude > 1) {
        inputX /= magnitude;
        inputY /= magnitude;
      }

      const dx = inputX * speed;
      const dy = inputY * speed;

      if (dx || dy) {
        player.x = clamp(player.x + dx, 24, WORLD_WIDTH - 24);
        player.y = clamp(player.y + dy, 26, WORLD_HEIGHT - 20);
        player.moving = true;
        player.frame += 0.12;
        if (Math.abs(dx) > Math.abs(dy)) {
          player.dir = dx > 0 ? 'right' : 'left';
        } else {
          player.dir = dy > 0 ? 'down' : 'up';
        }
        setPPos(player.x, player.y);
        setPDir(player.dir);
        setPMov(true);
      } else {
        player.moving = false;
        setPMov(false);
      }

      if (!encTriggered) {
        for (const encounter of encounters) {
          if (dismissedEncounterIdRef.current === encounter.step.id) continue;
          if (Math.hypot(player.x - encounter.x, player.y - encounter.y) < encounter.r + 20) {
            setEncTrig(true);
            setEncStep(encounter.step);
            setEncounterStepState(encounter.step);
            break;
          }
        }
      }
    }

    ctx.fillStyle = '#f9f7f1';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ctx.strokeStyle = 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < WORLD_WIDTH; gx += 48) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, WORLD_HEIGHT);
      ctx.stroke();
    }
    for (let gy = 0; gy < WORLD_HEIGHT; gy += 48) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(WORLD_WIDTH, gy);
      ctx.stroke();
    }

    activeConnections.forEach((connection, index) => {
      const from = LOCATIONS[connection.f];
      const to = LOCATIONS[connection.t];
      if (!from || !to) return;
      const fx = from.x + from.w / 2;
      const fy = from.y + from.h / 2;
      const tx = to.x + to.w / 2;
      const ty = to.y + to.h / 2;

      const curveOffset = (index % 2 === 0 ? 1 : -1) * 84;
      const cx = (fx + tx) / 2 + (index % 3 === 0 ? 28 : -28);
      const cy = (fy + ty) / 2 + curveOffset;

      ctx.strokeStyle = 'rgba(201,185,150,0.56)';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(cx, cy, tx, ty);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.46)';
      ctx.lineWidth = 2.4;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(cx, cy, tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      const t = (time * 0.2 + index * 0.2) % 1;
      ctx.fillStyle = 'rgba(45,139,77,0.18)';
      const marker = bezierPoint(fx, fy, cx, cy, tx, ty, t);
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    activeLocations.forEach(location => {
      const locationEncounters = encountersByLocation.get(location.name) ?? [];
      const gradient = ctx.createLinearGradient(location.x, location.y, location.x + location.w, location.y + location.h);
      gradient.addColorStop(0, location.bg);
      gradient.addColorStop(1, '#ffffff');
      ctx.fillStyle = gradient;
      rr(ctx, location.x, location.y, location.w, location.h, 22);
      ctx.fill();

      ctx.strokeStyle = location.border;
      ctx.lineWidth = 2.2;
      rr(ctx, location.x, location.y, location.w, location.h, 22);
      ctx.stroke();

      ctx.fillStyle = `${location.accent}16`;
      rr(ctx, location.x + 16, location.y + 16, location.w - 32, 58, 18);
      ctx.fill();

      ctx.fillStyle = location.accent;
      ctx.font = '700 24px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(fitTextByWidth(ctx, location.label, location.w - 150), location.x + 28, location.y + 27);

      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(0,0,0,0.58)';
      ctx.fillText(fitTextByWidth(ctx, location.desc, location.w - 56), location.x + 28, location.y + 58);

      const badgeText = locationEncounters.length ? `${locationEncounters.length} активные угрозы` : 'зона под контролем';
      const badgeWidth = 166;
      ctx.fillStyle = locationEncounters.length ? `${location.accent}16` : 'rgba(45,139,77,0.13)';
      rr(ctx, location.x + location.w - badgeWidth - 24, location.y + 28, badgeWidth, 30, 15);
      ctx.fill();
      ctx.fillStyle = locationEncounters.length ? location.accent : '#217545';
      ctx.font = '600 11px "Segoe UI", sans-serif';
      ctx.fillText(fitTextByWidth(ctx, badgeText, badgeWidth - 16), location.x + location.w - badgeWidth - 12, location.y + 37);

      const chips = locationEncounters.length
        ? locationEncounters.slice(0, 3)
        : [{ label: 'В этой зоне сейчас нет новых угроз', color: '#2d8b4d' }] as Array<{ label: string; color: string }>;

      chips.forEach((chip, index) => {
        const chipY = location.y + 98 + index * 40;
        const chipX = location.x + 24;
        const chipW = location.w - 48;
        const chipH = 32;
        ctx.fillStyle = `${chip.color}12`;
        rr(ctx, chipX, chipY, chipW, chipH, 12);
        ctx.fill();
        ctx.strokeStyle = `${chip.color}30`;
        ctx.lineWidth = 1;
        rr(ctx, chipX, chipY, chipW, chipH, 12);
        ctx.stroke();
        ctx.fillStyle = chip.color;
        ctx.font = '600 12px "Segoe UI", sans-serif';
        ctx.fillText(fitTextByWidth(ctx, chip.label, chipW - 26), chipX + 12, chipY + 9);
      });
    });

    encounters.forEach(encounter => {
      const isHovered = hovered?.step.id === encounter.step.id;
      const radius = encounter.r * (isHovered ? 1.12 : 1);
      const pulse = Math.sin(time * 2 + encounter.x) * 0.18 + 0.92;

      const glow = ctx.createRadialGradient(encounter.x, encounter.y, 0, encounter.x, encounter.y, radius * 2.8);
      glow.addColorStop(0, `${encounter.color}26`);
      glow.addColorStop(1, `${encounter.color}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(encounter.x, encounter.y, radius * 2.3 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `${encounter.color}20`;
      ctx.strokeStyle = `${encounter.color}88`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(encounter.x, encounter.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const icons: Record<string, string> = {
        email: '✉',
        wifi: '◉',
        mobile: '◫',
        identity: '⌘',
        social: '◎',
        generic: '!',
      };
      ctx.font = `${Math.round(radius * 0.92)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = encounter.color;
      ctx.fillText(icons[encounter.type] || '!', encounter.x, encounter.y + 1);
    });

    drawCharacter(ctx, player.x, player.y, player.dir, player.moving, player.frame);

    if (hovered && gamePhase === 'explore') {
      const tooltipWidth = 286;
      const tooltipHeight = 68;
      const tooltipX = clamp(hovered.x - tooltipWidth / 2, 12, WORLD_WIDTH - tooltipWidth - 12);
      const tooltipY = clamp(hovered.y - tooltipHeight - 46, 12, WORLD_HEIGHT - tooltipHeight - 12);
      ctx.fillStyle = 'rgba(255,255,255,0.98)';
      ctx.strokeStyle = `${hovered.color}32`;
      ctx.lineWidth = 1;
      rr(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = hovered.color;
      ctx.font = '700 12px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(shorten(hovered.label, 34), tooltipX + 14, tooltipY + 14);
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.fillText(shorten(hovered.step.title, 38), tooltipX + 14, tooltipY + 36);
    }

    if (currentMission) {
      const bannerX = WORLD_WIDTH / 2 - 280;
      const bannerY = 18;
      const bannerW = 560;
      const bannerH = 40;
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      rr(ctx, bannerX, bannerY, bannerW, bannerH, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      rr(ctx, bannerX, bannerY, bannerW, bannerH, 18);
      ctx.stroke();
      ctx.fillStyle = '#1b1b1b';
      ctx.font = '600 13px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fitTextByWidth(ctx, `${currentMission.title} • исследуйте зоны и запускайте эпизоды`, bannerW - 26), WORLD_WIDTH / 2, bannerY + bannerH / 2 + 1);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [activeConnections, activeLocations, currentMission, encounters, encountersByLocation, encTriggered, gamePhase, hovered, setEncStep, setEncTrig, setPDir, setPMov, setPPos]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const triggerEncounter = useCallback(
    (encounter: EncounterPoint) => {
      if (dismissedEncounterIdRef.current === encounter.step.id) return;
      setEncTrig(true);
      setEncStep(encounter.step);
      setEncounterStepState(encounter.step);
    },
    [setEncStep, setEncTrig],
  );

  const getPointFromEvent = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (WORLD_WIDTH / rect.width),
      y: (event.clientY - rect.top) * (WORLD_HEIGHT / rect.height),
    };
  }, []);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getPointFromEvent(event);
      if (!point) return;
      let found: EncounterPoint | null = null;
      for (const encounter of encounters) {
        if (Math.hypot(point.x - encounter.x, point.y - encounter.y) < encounter.r + 12) {
          found = encounter;
          break;
        }
      }
      setHovered(found);
    },
    [encounters, getPointFromEvent],
  );

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (gamePhase !== 'explore') return;
      const point = getPointFromEvent(event);
      if (!point) return;
      for (const encounter of encounters) {
        if (Math.hypot(point.x - encounter.x, point.y - encounter.y) < encounter.r + 18) {
          triggerEncounter(encounter);
          break;
        }
      }
    },
    [encounters, gamePhase, getPointFromEvent, triggerEncounter],
  );

  const onClose = useCallback(() => {
    const stepId = encounterStep?.id ?? null;
    const encounter = stepId ? encounters.find(item => item.step.id === stepId) : null;
    const player = playerRef.current;

    if (encounter) {
      const dx = player.x - encounter.x || 1;
      const dy = player.y - encounter.y || 1;
      const distance = Math.hypot(dx, dy) || 1;
      player.x = clamp(encounter.x + (dx / distance) * (encounter.r + 52), 24, WORLD_WIDTH - 24);
      player.y = clamp(encounter.y + (dy / distance) * (encounter.r + 52), 26, WORLD_HEIGHT - 20);
      setPPos(player.x, player.y);
      dismissedEncounterIdRef.current = stepId;
    }

    keysRef.current.clear();
    resetJoystick();
    setHovered(null);
    setPMov(false);
    setEncTrig(false);
    setEncStep(null);
    setEncounterStepState(null);
  }, [encounterStep?.id, encounters, resetJoystick, setEncStep, setEncTrig, setPMov, setPPos]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f9f7f1]">
      <canvas
        ref={canvasRef}
        className="w-full h-full [image-rendering:auto]"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHovered(null)}
        onClick={onClick}
      />

      <GameHUD energy={energy} shield={shield} progress={progress} totalSteps={totalSteps} missionResolvedSteps={missionResolvedSteps} />

      <AnimatePresence>
        {encounterStep && !useGS.getState().fb && gamePhase === 'lesson' && <LessonDialog step={encounterStep} onClose={onClose} />}
        {encounterStep && !useGS.getState().fb && gamePhase === 'decision' && <EncounterDialog step={encounterStep} onClose={onClose} />}
      </AnimatePresence>

      <AnimatePresence>
        {useGS.getState().fb && gamePhase === 'consequence' && <ConsequenceOverlay />}
      </AnimatePresence>

      {gamePhase === 'explore' && (
        <>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-white/92 backdrop-blur rounded-full border border-border/60 shadow-sm hidden md:block">
            <span className="text-[11px] text-text-secondary">WASD или стрелки - движение • Подойдите к маркеру угрозы • Сначала обучение, потом отдельный тест</span>
          </div>

          <div className="absolute left-4 bottom-4 md:hidden pointer-events-auto">
            <div
              ref={joystickPadRef}
              className="relative h-28 w-28 rounded-full border border-border/70 bg-white/86 shadow-lg"
              style={{ touchAction: 'none' }}
              onTouchStart={event => {
                event.preventDefault();
                const touch = event.touches[0];
                if (touch) updateJoystick(touch.clientX, touch.clientY);
              }}
              onTouchMove={event => {
                event.preventDefault();
                const touch = event.touches[0];
                if (touch) updateJoystick(touch.clientX, touch.clientY);
              }}
              onTouchEnd={event => {
                event.preventDefault();
                if (event.touches.length === 0) resetJoystick();
              }}
              onTouchCancel={resetJoystick}
            >
              <div className="absolute inset-3 rounded-full border border-border/60 bg-bg-secondary/55" />
              <div
                className={`absolute left-1/2 top-1/2 h-12 w-12 rounded-full border border-border bg-white shadow ${joystick.active ? 'scale-100' : 'scale-95'}`}
                style={{ transform: `translate(calc(-50% + ${joystick.x * 32}px), calc(-50% + ${joystick.y * 32}px))` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-text-secondary text-center">Джойстик</p>
          </div>
        </>
      )}
    </div>
  );
}
