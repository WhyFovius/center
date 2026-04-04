export interface User { id: number; username: string; full_name: string; created_at: string; }
export interface StepOption { id: number; option_key: string; label: string; details: string; is_correct: boolean; hint: string; impact_text: string; points: number; security_delta: number; }
export interface ScenarioStep { id: number; code: string; title: string; attack_type: string; location: string; brief: string; payload: string; options: StepOption[]; explanation: string; why_dangerous: string; reference_items: string[]; }
export interface Mission { id: number; code: string; title: string; subtitle: string; description: string; order_index: number; steps: ScenarioStep[]; }
export interface StepState { step_id: number; attempts_count: number; mistakes_count: number; resolved: boolean; first_try_success: boolean; chosen_option_id: number | null; resolved_at: string | null; }
export interface Progress { security_level: number; reputation: number; resolved_steps: number; first_try_resolved: number; total_mistakes: number; success_rate: number; league: string; unlocked_mission_index: number; }
export interface SimulatorState { user: User; missions: Mission[]; step_states: StepState[]; progress: Progress; total_steps: number; }
export interface AttemptResponse { correct: boolean; title: string; message: string; detail: string; references: string[]; step_state: StepState; progress: Progress; all_completed: boolean; }
export interface Certificate { available: boolean; certificate_id: string; message: string; created_at: string; }
export interface Consequence { status: 'contained' | 'breach'; badge: string; summary: string; coach: string; emotionalOutcome: string; missedSignal: string; inductiveRule: string; timeline: { stage: string; text: string }[]; metrics: { label: string; value: string; tone: 'positive' | 'negative' | 'neutral' }[]; }
export interface FeedbackState { kind: 'success' | 'warning' | 'info'; title: string; message: string; detail: string; references: string[]; stepId: number | null; consequence: Consequence | null; }
export type GameScreen = 'auth' | 'menu' | 'lobby' | 'game' | 'os' | 'profile' | 'leaderboard' | 'corporate';
export type LearningBand = 'novice' | 'intermediate' | 'advanced';
export type ScenarioTrack = 'network' | 'social' | 'mobile';
export type Lang = 'ru' | 'kz' | 'en';
export type Theme = 'light' | 'dark' | 'bw';
