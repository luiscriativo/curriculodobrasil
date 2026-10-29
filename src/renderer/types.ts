export type SectionType =
  | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'courses' | 'projects'
  | 'awards' | 'volunteer' | 'references' | 'interests' | 'custom';

export interface EntryItem {
  id: string; role: string; org: string; location: string; start: string; end: string; current: boolean; description: string;
}
export interface LevelItem { id: string; name: string; level: number }
export interface TagItem { id: string; name: string }
export type Item = EntryItem & LevelItem & TagItem;

export interface Section {
  id: string; type: SectionType; title: string; hidden: boolean; placement: 'auto' | 'main' | 'aside'; text: string; items: Item[];
}

export interface Profile {
  name: string; title: string; email: string; phone: string; location: string; website: string; linkedin: string; github: string;
  birth: string; extra: { id: string; label: string; value: string }[]; photo: string | null; photoPos: { x: number; y: number; zoom: number };
}

export interface ResumeStyle {
  accent: string | null; font: string | null; fontScale: number; spacing: number; photoShape: string | null; grayscale: boolean;
  dateFormat: 'mm/yyyy' | 'mon yyyy' | 'month yyyy' | 'yyyy'; lang: 'pt' | 'en' | 'es'; paper: 'A4' | 'Letter'; showLevels: boolean; decorativeSpacing: boolean;
}

export interface Resume {
  schema: number; id: string; docTitle: string; createdAt: number; updatedAt: number; template: string;
  style: ResumeStyle; profile: Profile; sections: Section[];
}

export interface Settings {
  theme: 'system' | 'light' | 'dark'; userName: string; welcomed: boolean; exportDir: string; askWhere: boolean; fileNamePattern: string;
  openAfterExport: boolean; embedData: boolean; verifyText: boolean; alsoAts: boolean; defaultLang: 'pt' | 'en' | 'es';
  defaultDateFormat: ResumeStyle['dateFormat']; listView: 'grid' | 'list';
}

export interface UpdateStatus {
  state: 'idle' | 'dev' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  current: string; version: string | null; percent: number; manual: boolean; error: string | null; checkedAt: number | null;
  notesUrl?: string; bytesPerSecond?: number; transferred?: number; total?: number;
}

export interface ExportResult {
  canceled?: boolean; file: string; size: number; pages: number | null;
  check: null | { ok: boolean; missing?: string[]; words?: number; pages?: number; error?: string };
}
