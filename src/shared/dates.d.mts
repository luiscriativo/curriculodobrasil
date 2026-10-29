export function parseDate(input: unknown): { y: number; m: number | null } | null;
export function formatDate(input: unknown, format?: string, lang?: string): string;
export function formatRange(start: string, end: string, current: boolean, format?: string, lang?: string, sep?: string): string;
export function monthsBetween(start: string, end: string, current: boolean, now?: Date): number | null;
export function formatDuration(months: number | null, lang?: string): string;
export function dayLabel(ts: number, now?: Date): string;
export function timeAgo(ts: number, now?: number): string;
