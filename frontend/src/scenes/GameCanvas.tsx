import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGS, ssFor, family as detectFamily } from '@/store/useGS';
import type { ScenarioStep, StepState } from '@/types';
import { LessonDialog } from '@/components/game/LessonDialog';
import { EncounterDialog } from '@/components/game/EncounterDialog';
import { ConsequenceOverlay } from '@/components/game/ConsequenceOverlay';
import { GameHUD } from '@/components/game/GameHUD';
import { TutorialOverlay } from '@/components/game/TutorialOverlay';

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
  const theme = useGS(s => s.theme);
  const isDark = theme === 'dark';

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

  // Force canvas redraw on theme change
  useEffect(() => {
    resizeCanvas();
  }, [theme, resizeCanvas]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gamePhase !== 'explore') return;
      const gameKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'ц', 'ы', 'в', 'ф'];
      if (gameKeys.includes(event.key.toLowerCase())) {
        keysRef.current.add(event.key.toLowerCase());
        event.preventDefault();
      }
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

    // Theme-based colors
    const bgColor = isDark ? '#0f1117' : '#f9f7f1';
    const gridColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    const roadColor = isDark ? 'rgba(60,65,80,0.6)' : 'rgba(201,185,150,0.56)';
    const roadDashColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.46)';
    const markerColor = isDark ? 'rgba(94,220,120,0.25)' : 'rgba(45,139,77,0.18)';
    const tooltipBg = isDark ? 'rgba(22,23,29,0.96)' : 'rgba(255,255,255,0.98)';
    const tooltipText = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.62)';
    const bannerBg = isDark ? 'rgba(22,23,29,0.94)' : 'rgba(255,255,255,0.94)';
    const bannerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const bannerText = isDark ? '#e8e6e1' : '#1b1b1b';
    const locDescColor = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.58)';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ctx.strokeStyle = gridColor;
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

    // Sun or Moon - positioned at top-right, visible
    const celestialX = 1200;
    const celestialY = isDark ? 70 : 50;
    const celestialPulse = Math.sin(time * 0.3) * 8;
    if (isDark) {
      // Moon
      ctx.fillStyle = 'rgba(200,210,230,0.08)';
      ctx.beginPath();
      ctx.arc(celestialX, celestialY + celestialPulse, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c8d2e6';
      ctx.beginPath();
      ctx.arc(celestialX, celestialY + celestialPulse, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(celestialX + 8, celestialY - 4 + celestialPulse, 14, 0, Math.PI * 2);
      ctx.fill();
      // Stars
      const starPositions = [[80,20],[180,40],[320,15],[480,35],[650,18],[800,45],[950,25],[1050,55],[130,60],[380,50],[550,10],[870,30],[1250,40],[1100,70],[200,30],[700,55],[1000,15],[450,40],[1150,60],[900,10]];
      starPositions.forEach(([sx, sy], i) => {
        const twinkle = Math.sin(time * 2 + i * 0.7) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255,255,255,${0.2 + twinkle * 0.8})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8 + twinkle * 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Sun - bright and visible
      ctx.fillStyle = 'rgba(255,200,50,0.1)';
      ctx.beginPath();
      ctx.arc(celestialX, celestialY + celestialPulse, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd040';
      ctx.beginPath();
      ctx.arc(celestialX, celestialY + celestialPulse, 18, 0, Math.PI * 2);
      ctx.fill();
      // Sun rays
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.2;
        ctx.strokeStyle = `rgba(255,200,50,${0.12 + Math.sin(time + i) * 0.08})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(celestialX + Math.cos(angle) * 22, celestialY + celestialPulse + Math.sin(angle) * 22);
        ctx.lineTo(celestialX + Math.cos(angle) * 30, celestialY + celestialPulse + Math.sin(angle) * 30);
        ctx.stroke();
      }
      // Clouds
      const cloudPositions = [[100, 35], [400, 50], [700, 25], [900, 45]];
      cloudPositions.forEach(([cx, cy], i) => {
        const drift = Math.sin(time * 0.15 + i * 2) * 12;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(cx + drift, cy, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + drift + 15, cy + 2, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + drift - 12, cy + 1, 15, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Decorative elements - trees, bushes, benches, animals
    const decorations = [
      { x: 40, y: 340, type: 'tree' as const },
      { x: 1280, y: 340, type: 'tree' as const },
      { x: 660, y: 20, type: 'tree' as const },
      { x: 660, y: 780, type: 'tree' as const },
      { x: 200, y: 700, type: 'bush' as const },
      { x: 1100, y: 700, type: 'bush' as const },
      { x: 300, y: 380, type: 'bench' as const },
      { x: 1000, y: 380, type: 'bench' as const },
      { x: 660, y: 400, type: 'fountain' as const },
      { x: 150, y: 180, type: 'lamp' as const },
      { x: 1150, y: 180, type: 'lamp' as const },
      { x: 660, y: 600, type: 'lamp' as const },
    ];

    // Animals
    const animals = [
      { x: 180, y: 500, type: 'cat' as const, dir: 1 },
      { x: 900, y: 650, type: 'bird' as const, dir: -1 },
      { x: 500, y: 750, type: 'cat' as const, dir: -1 },
    ];

    decorations.forEach(dec => {
      if (dec.type === 'tree') {
        ctx.fillStyle = isDark ? 'rgba(60,100,50,0.2)' : 'rgba(100,160,80,0.15)';
        ctx.beginPath();
        ctx.arc(dec.x, dec.y, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? '#3a6a30' : '#6b8f5e';
        ctx.beginPath();
        ctx.arc(dec.x, dec.y - 8, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? '#4a3a2a' : '#5a4a3a';
        ctx.fillRect(dec.x - 2, dec.y + 6, 4, 14);
      } else if (dec.type === 'bush') {
        ctx.fillStyle = isDark ? 'rgba(50,90,40,0.25)' : 'rgba(80,140,60,0.2)';
        ctx.beginPath();
        ctx.ellipse(dec.x, dec.y, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? '#3a6a30' : '#5a8a4a';
        ctx.beginPath();
        ctx.ellipse(dec.x, dec.y - 2, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (dec.type === 'bench') {
        ctx.fillStyle = isDark ? 'rgba(100,70,30,0.3)' : 'rgba(120,80,40,0.25)';
        rr(ctx, dec.x - 14, dec.y - 4, 28, 8, 2);
        ctx.fill();
        ctx.fillStyle = isDark ? '#6a5020' : '#8b6914';
        rr(ctx, dec.x - 12, dec.y - 3, 24, 6, 1);
        ctx.fill();
      } else if (dec.type === 'fountain') {
        const fountainPulse = Math.sin(time * 1.5) * 3;
        ctx.fillStyle = isDark ? 'rgba(60,120,160,0.2)' : 'rgba(100,180,220,0.15)';
        ctx.beginPath();
        ctx.arc(dec.x, dec.y, 30 + fountainPulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? 'rgba(60,120,160,0.35)' : 'rgba(100,180,220,0.3)';
        ctx.beginPath();
        ctx.arc(dec.x, dec.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? 'rgba(100,160,200,0.5)' : 'rgba(150,210,240,0.5)';
        ctx.beginPath();
        ctx.arc(dec.x, dec.y, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (dec.type === 'lamp') {
        ctx.fillStyle = isDark ? 'rgba(255,220,100,0.15)' : 'rgba(255,220,100,0.08)';
        ctx.beginPath();
        ctx.arc(dec.x, dec.y, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? '#555' : '#666';
        ctx.fillRect(dec.x - 1, dec.y - 20, 2, 25);
        ctx.fillStyle = '#ffdd55';
        ctx.beginPath();
        ctx.arc(dec.x, dec.y - 22, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw animals
    animals.forEach(a => {
      if (a.type === 'cat') {
        const catBob = Math.sin(time * 3 + a.x) * 1;
        ctx.fillStyle = isDark ? '#4a4a4a' : '#888';
        ctx.beginPath();
        ctx.ellipse(a.x, a.y + catBob, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(a.x + a.dir * 8, a.y - 4 + catBob, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isDark ? '#3a3a3a' : '#777';
        ctx.beginPath();
        ctx.moveTo(a.x + a.dir * 5, a.y - 8 + catBob);
        ctx.lineTo(a.x + a.dir * 3, a.y - 13 + catBob);
        ctx.lineTo(a.x + a.dir * 7, a.y - 9 + catBob);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(a.x + a.dir * 10, a.y - 7 + catBob);
        ctx.lineTo(a.x + a.dir * 11, a.y - 12 + catBob);
        ctx.lineTo(a.x + a.dir * 13, a.y - 6 + catBob);
        ctx.fill();
        // Tail
        ctx.strokeStyle = isDark ? '#4a4a4a' : '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x - a.dir * 10, a.y + catBob);
        ctx.quadraticCurveTo(a.x - a.dir * 16, a.y - 10 + catBob + Math.sin(time * 2) * 3, a.x - a.dir * 14, a.y - 14 + catBob);
        ctx.stroke();
        // Eyes
        ctx.fillStyle = isDark ? '#8f8' : '#5a5';
        ctx.beginPath();
        ctx.arc(a.x + a.dir * 10, a.y - 5 + catBob, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (a.type === 'bird') {
        const birdY = a.y + Math.sin(time * 4 + a.x) * 8;
        const wingAngle = Math.sin(time * 8) * 0.4;
        ctx.fillStyle = isDark ? '#5a6a8a' : '#4a7ab5';
        ctx.beginPath();
        ctx.ellipse(a.x, birdY, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isDark ? '#5a6a8a' : '#4a7ab5';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(a.x - 3, birdY);
        ctx.lineTo(a.x - 10, birdY - 6 + wingAngle * 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(a.x + 3, birdY);
        ctx.lineTo(a.x + 10, birdY - 6 + wingAngle * 8);
        ctx.stroke();
      }
    });

    // Ambient floating particles
    const ambientParticles = [
      { bx: 100, by: 200, speed: 0.3, size: 2 },
      { bx: 300, by: 150, speed: 0.5, size: 1.5 },
      { bx: 500, by: 300, speed: 0.4, size: 2.5 },
      { bx: 700, by: 100, speed: 0.6, size: 1.8 },
      { bx: 900, by: 250, speed: 0.35, size: 2.2 },
      { bx: 1100, by: 180, speed: 0.45, size: 1.6 },
      { bx: 200, by: 600, speed: 0.55, size: 2 },
      { bx: 400, by: 500, speed: 0.3, size: 1.5 },
      { bx: 600, by: 700, speed: 0.4, size: 2.3 },
      { bx: 800, by: 550, speed: 0.5, size: 1.7 },
      { bx: 1000, by: 650, speed: 0.35, size: 2.1 },
      { bx: 1200, by: 400, speed: 0.45, size: 1.9 },
      { bx: 150, by: 450, speed: 0.6, size: 1.4 },
      { bx: 1050, by: 350, speed: 0.3, size: 2.4 },
      { bx: 550, by: 450, speed: 0.5, size: 1.8 },
    ];

    ambientParticles.forEach((p, i) => {
      const px = p.bx + Math.sin(time * p.speed + i * 1.3) * 15;
      const py = p.by + Math.cos(time * p.speed * 0.7 + i * 0.9) * 10;
      const alpha = 0.15 + Math.sin(time * 0.8 + i * 2) * 0.1;
      ctx.fillStyle = isDark ? `rgba(94,220,120,${alpha})` : `rgba(45,139,77,${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

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

      ctx.strokeStyle = roadColor;
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(cx, cy, tx, ty);
      ctx.stroke();

      ctx.strokeStyle = roadDashColor;
      ctx.lineWidth = 2.4;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(cx, cy, tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      const t = (time * 0.2 + index * 0.2) % 1;
      ctx.fillStyle = markerColor;
      const marker = bezierPoint(fx, fy, cx, cy, tx, ty, t);
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    activeLocations.forEach(location => {
      const locationEncounters = encountersByLocation.get(location.name) ?? [];
      const locBg = isDark ? '#1a1c24' : location.bg;
      const locBgEnd = isDark ? '#16171d' : '#ffffff';
      const gradient = ctx.createLinearGradient(location.x, location.y, location.x + location.w, location.y + location.h);
      gradient.addColorStop(0, locBg);
      gradient.addColorStop(1, locBgEnd);
      ctx.fillStyle = gradient;
      rr(ctx, location.x, location.y, location.w, location.h, 22);
      ctx.fill();

      // Decorative corner accent
      ctx.fillStyle = `${location.accent}08`;
      ctx.beginPath();
      ctx.moveTo(location.x + location.w, location.y);
      ctx.lineTo(location.x + location.w, location.y + 60);
      ctx.lineTo(location.x + location.w - 60, location.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = location.border;
      ctx.lineWidth = 2.2;
      rr(ctx, location.x, location.y, location.w, location.h, 22);
      ctx.stroke();

      // Location icon
      const locIcons: Record<string, string> = {
        'Офис': '🏢',
        'Дом': '🏠',
        'Кафе': '☕',
        'Банк': '🏦',
        'Аэропорт': '✈️',
        'Отель': '🏨',
      };
      const icon = locIcons[location.label] || '📍';
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, location.x + location.w - 40, location.y + 40);

      ctx.fillStyle = `${location.accent}16`;
      rr(ctx, location.x + 16, location.y + 16, location.w - 32, 58, 18);
      ctx.fill();

      ctx.fillStyle = location.accent;
      ctx.font = '700 24px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(fitTextByWidth(ctx, location.label, location.w - 150), location.x + 28, location.y + 27);

      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.fillStyle = locDescColor;
      ctx.fillText(fitTextByWidth(ctx, location.desc, location.w - 56), location.x + 28, location.y + 58);

      const badgeText = locationEncounters.length ? `${locationEncounters.length} активные угрозы` : '✓ зона под контролем';
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
      ctx.fillStyle = tooltipBg;
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
      ctx.fillStyle = tooltipText;
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.fillText(shorten(hovered.step.title, 38), tooltipX + 14, tooltipY + 36);
    }

    if (currentMission) {
      const bannerX = WORLD_WIDTH / 2 - 280;
      const bannerY = 18;
      const bannerW = 560;
      const bannerH = 40;
      ctx.fillStyle = bannerBg;
      rr(ctx, bannerX, bannerY, bannerW, bannerH, 18);
      ctx.fill();
      ctx.strokeStyle = bannerBorder;
      ctx.lineWidth = 1;
      rr(ctx, bannerX, bannerY, bannerW, bannerH, 18);
      ctx.stroke();
      ctx.fillStyle = bannerText;
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
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: isDark ? '#0f1117' : '#f9f7f1' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full [image-rendering:auto] [touch-action:none]"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHovered(null)}
        onClick={onClick}
      />

      <GameHUD energy={energy} shield={shield} progress={progress} totalSteps={totalSteps} missionResolvedSteps={missionResolvedSteps} missionCode={currentMission?.code} />

      {/* Tutorial overlay for first-time players */}
      {gamePhase === 'explore' && <TutorialOverlay />}

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

          {/* Mobile hint */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-2 bg-white/92 backdrop-blur rounded-full border border-border/60 shadow-sm md:hidden">
            <span className="text-[10px] text-text-secondary">Используйте джойстик внизу экрана</span>
          </div>

          <div className="absolute left-3 bottom-3 md:hidden pointer-events-none z-50">
            <div
              ref={joystickPadRef}
              className="relative h-32 w-32 rounded-full border-2 border-white/40 bg-black/20 backdrop-blur-sm shadow-xl"
              style={{ touchAction: 'none', pointerEvents: 'auto' }}
              onTouchStart={event => {
                event.preventDefault();
                event.stopPropagation();
                const touch = event.touches[0];
                if (touch) updateJoystick(touch.clientX, touch.clientY);
              }}
              onTouchMove={event => {
                event.preventDefault();
                event.stopPropagation();
                const touch = event.touches[0];
                if (touch) updateJoystick(touch.clientX, touch.clientY);
              }}
              onTouchEnd={event => {
                event.preventDefault();
                event.stopPropagation();
                if (event.touches.length === 0) resetJoystick();
              }}
              onTouchCancel={resetJoystick}
            >
              <div className="absolute inset-4 rounded-full border border-white/20 bg-white/10" />
              <div
                className={`absolute left-1/2 top-1/2 h-14 w-14 rounded-full border-2 border-white/60 bg-white/40 shadow-lg backdrop-blur-sm ${joystick.active ? 'scale-100' : 'scale-95'}`}
                style={{ transform: `translate(calc(-50% + ${joystick.x * 36}px), calc(-50% + ${joystick.y * 36}px))` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
