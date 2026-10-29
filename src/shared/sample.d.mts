import type { Resume } from '../renderer/types';
export const SAMPLE_PHOTO: string;
export function fillWithSample(r: Resume): Resume;
export function sampleResume(o?: { withPhoto?: boolean; template?: string }): Resume;
