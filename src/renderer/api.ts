import type { Resume, Settings, UpdateStatus, ExportResult } from './types';

type Off = () => void;
export interface Api {
  info(): Promise<{ name: string; version: string; isDev: boolean; platform: string; versions: Record<string, string>; userData: string; dataDir: string }>;
  settings: { get(): Promise<Settings>; set(patch: Partial<Settings>): Promise<Settings> };
  titleBar(mode: 'light' | 'dark'): Promise<boolean>;
  resumes: {
    list(): Promise<{ resumes: Resume[]; broken: string[] }>;
    get(id: string): Promise<Resume>;
    save(r: Resume): Promise<Resume>;
    remove(id: string): Promise<boolean>;
    restore(id: string): Promise<Resume>;
    import(paths?: string[]): Promise<{ canceled?: boolean; imported: Resume[]; errors?: string[] }>;
    exportJson(r: Resume): Promise<{ canceled?: boolean; file?: string }>;
    backup(): Promise<{ canceled?: boolean; file?: string; count?: number }>;
  };
  pdf: {
    export(r: Resume, opts?: { ats?: boolean; saveAs?: boolean; jobId?: string }): Promise<ExportResult>;
    preview(r: Resume): Promise<Uint8Array>;
    onProgress(cb: (p: { job: string; step: string; pct: number; text: string }) => void): Off;
  };
  shell: { open(p: string): Promise<string>; reveal(p: string): Promise<boolean>; external(url: string): Promise<boolean>; pickFolder(): Promise<string | null> };
  diag: {
    run(): Promise<{ id: string; status: 'ok' | 'warn' | 'bad'; title: string; detail: string; path?: string; fix?: string }[]>;
    pdfTest(): Promise<{ ms: number; pages: number; size: number; ok: boolean; missing: string[]; words: number; roundTrip: boolean; sample: string }>;
  };
  update: {
    status(): Promise<UpdateStatus>; check(): Promise<UpdateStatus>; download(): Promise<UpdateStatus>; install(): Promise<{ ok: boolean }>;
    onStatus(cb: (s: UpdateStatus) => void): Off;
  };
  onToast(cb: (t: { kind: 'success' | 'info' | 'warn' | 'error'; text: string }) => void): Off;
  pathForFile(f: File): string;
  print: { onRender(cb: (m: { id: number; resume: Resume; templateOverride: string | null }) => void): Off; done(m: unknown): void };
  dev: Record<string, (...a: any[]) => Promise<any>>;
}

declare global {
  interface Window { api: Api }
}

export const api = window.api;
