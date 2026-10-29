import type { Resume } from '../renderer/types';
export interface AtsCheck { id: string; status: 'ok' | 'warn' | 'bad' | 'info'; title: string; detail: string; target?: string | null; weight: number }
export function resumeText(r: Resume): string;
export function wordCount(text: string): number;
export function analyzeResume(r: Resume, tpl?: { ats?: 'alta' | 'media' | 'baixa'; name?: string }): { score: number; checks: AtsCheck[]; words: number };
export function extractKeywords(jobText: string, max?: number): { key: string; label: string }[];
export function matchKeywords(r: Resume, jobText: string, max?: number): { keys: string[]; found: string[]; missing: string[]; pct: number };
