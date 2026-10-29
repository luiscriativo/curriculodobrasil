// Estado do app (currículos, configurações, navegação) e ações compartilhadas entre as telas.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from './api';
import type { Resume, Settings, UpdateStatus } from './types';
import { useConfirm, useToast } from './components/ui';
import { createResume, duplicateResume, normalizeResume } from '../shared/model.mjs';
import { sampleResume } from '../shared/sample.mjs';
import { getTemplate } from './templates';

export type View =
  | { name: 'home' }
  | { name: 'templates'; applyTo?: string }
  | { name: 'editor'; id: string; tab?: string }
  | { name: 'settings'; section?: string }
  | { name: 'diagnostics' };

type Info = Awaited<ReturnType<typeof api.info>>;

interface Store {
  ready: boolean;
  info: Info | null;
  settings: Settings | null;
  setSettings: (patch: Partial<Settings>) => Promise<void>;
  resumes: Resume[];
  broken: string[];
  view: View;
  nav: (v: View) => void;
  update: UpdateStatus | null;
  theme: 'light' | 'dark';
  reload: () => Promise<void>;
  create: (o?: { template?: string; sample?: boolean; title?: string }) => Promise<Resume>;
  save: (r: Resume) => Promise<Resume>;
  patchLocal: (r: Resume) => void;
  duplicate: (r: Resume) => Promise<void>;
  remove: (r: Resume) => Promise<void>;
  exportPdf: (r: Resume, o?: { ats?: boolean; saveAs?: boolean }) => Promise<void>;
  importFiles: (paths?: string[]) => Promise<void>;
  newOpen: boolean;
  setNewOpen: (v: boolean) => void;
}

const Ctx = createContext<Store>(null as never);
export const useStore = () => useContext(Ctx);

const sizeLabel = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
const baseName = (p: string) => p.split(/[\\/]/).pop() || p;

export function StoreProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [ready, setReady] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);
  const [settings, setSettingsState] = useState<Settings | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [broken, setBroken] = useState<string[]>([]);
  const [view, setView] = useState<View>({ name: 'home' });
  const [update, setUpdate] = useState<UpdateStatus | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const exporting = useRef(new Set<string>());
  // Excluídos nesta sessão: um salvamento atrasado do editor não pode recriar o arquivo
  const deleted = useRef(new Set<string>());

  const reload = useCallback(async () => {
    const r = await api.resumes.list();
    setResumes(r.resumes);
    setBroken(r.broken);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [i, s] = await Promise.all([api.info(), api.settings.get()]);
        setInfo(i);
        setSettingsState(s);
        await reload();
        setUpdate(await api.update.status());
      } catch (e) {
        toast.show({ kind: 'error', title: 'Não foi possível carregar seus currículos', text: (e as Error).message });
      } finally {
        setReady(true);
      }
    })();
    const offU = api.update.onStatus(setUpdate);
    const offT = api.onToast((t) => toast.show({ kind: t.kind, title: t.text }));
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onMq = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onMq);
    return () => { offU(); offT(); mq.removeEventListener('change', onMq); };
  }, [reload, toast]);

  const theme: 'light' | 'dark' = settings?.theme === 'dark' || (settings?.theme !== 'light' && systemDark) ? 'dark' : 'light';
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    api.titleBar(theme).catch(() => {});
  }, [theme]);

  const setSettings = useCallback(async (patch: Partial<Settings>) => {
    setSettingsState((s) => (s ? { ...s, ...patch } : s));
    try {
      setSettingsState(await api.settings.set(patch));
    } catch (e) {
      toast.show({ kind: 'error', title: 'Não foi possível salvar a configuração', text: (e as Error).message });
    }
  }, [toast]);

  const patchLocal = useCallback((r: Resume) => {
    setResumes((list) => [r, ...list.filter((x) => x.id !== r.id)].sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  const save = useCallback(async (r: Resume) => {
    if (deleted.current.has(r.id)) return r;
    const saved = await api.resumes.save(r);
    patchLocal(saved);
    return saved;
  }, [patchLocal]);

  const create = useCallback(async (o: { template?: string; sample?: boolean; title?: string } = {}) => {
    const lang = settings?.defaultLang || 'pt';
    let r: Resume;
    if (o.sample) {
      r = normalizeResume(sampleResume({ template: o.template || 'ipanema' })) as Resume;
    } else {
      r = createResume({ name: settings?.userName || '', template: o.template || 'ipanema', lang }) as Resume;
      r.docTitle = o.title || (settings?.userName ? `Currículo — ${settings.userName}` : 'Meu currículo');
    }
    r.style.dateFormat = settings?.defaultDateFormat || 'mm/yyyy';
    if (o.title) r.docTitle = o.title;
    const saved = await save(r);
    return saved;
  }, [settings, save]);

  const duplicate = useCallback(async (r: Resume) => {
    try {
      const copy = await save(duplicateResume(r) as Resume);
      toast.show({ kind: 'success', title: 'Currículo duplicado', text: copy.docTitle, actions: [{ label: 'Abrir', onClick: () => setView({ name: 'editor', id: copy.id }) }] });
    } catch (e) {
      toast.show({ kind: 'error', title: 'Não foi possível duplicar', text: (e as Error).message });
    }
  }, [save, toast]);

  const remove = useCallback(async (r: Resume) => {
    const ok = await confirm({ title: 'Excluir este currículo?', text: <>“{r.docTitle}” sai da lista. Você pode desfazer logo em seguida; os PDFs já exportados não são apagados.</>, ok: 'Excluir', danger: true });
    if (!ok) return;
    try {
      deleted.current.add(r.id);
      await api.resumes.remove(r.id);
      setResumes((l) => l.filter((x) => x.id !== r.id));
      setView((v) => (v.name === 'editor' && v.id === r.id ? { name: 'home' } : v));
      toast.show({
        kind: 'info', title: 'Currículo excluído', text: r.docTitle, timeout: 9000,
        actions: [{ label: 'Desfazer', onClick: async () => { try { deleted.current.delete(r.id); patchLocal(await api.resumes.restore(r.id)); } catch (e) { toast.show({ kind: 'error', title: 'Não foi possível restaurar', text: (e as Error).message }); } } }],
      });
    } catch (e) {
      deleted.current.delete(r.id);
      toast.show({ kind: 'error', title: 'Não foi possível excluir', text: (e as Error).message });
    }
  }, [confirm, toast, patchLocal]);

  const exportPdf = useCallback(async (r: Resume, o: { ats?: boolean; saveAs?: boolean } = {}) => {
    const key = `${r.id}:${o.ats ? 'ats' : 'pdf'}`;
    if (exporting.current.has(key)) {
      toast.show({ kind: 'info', title: 'Este PDF já está sendo gerado', text: 'Aguarde terminar.' });
      return;
    }
    exporting.current.add(key);
    const jobId = Math.random().toString(36).slice(2);
    let tid = '';
    const off = api.pdf.onProgress((p) => {
      if (p.job !== jobId) return;
      if (!tid) tid = toast.show({ id: jobId, kind: 'progress', title: o.ats ? 'Gerando a versão ATS…' : 'Gerando o PDF…', text: p.text, progress: p.pct });
      else toast.update(tid, { text: p.text, progress: p.pct });
    });
    try {
      const res = await api.pdf.export(r, { ...o, jobId });
      if (res.canceled) { if (tid) toast.dismiss(tid); return; }
      const c = res.check;
      const textInfo = !c ? null : c.ok
        ? `Texto legível por sistemas de RH ✓ (${c.words} palavras${c.pages ? `, ${c.pages} ${c.pages === 1 ? 'página' : 'páginas'}` : ''})`
        : c.error ? `Não foi possível conferir o texto: ${c.error}` : `Atenção: não encontramos no texto do PDF: ${c.missing?.join(', ')}.`;
      const data = {
        kind: (c && !c.ok ? 'warn' : 'success') as 'warn' | 'success',
        title: o.ats ? 'Versão ATS salva' : 'PDF salvo',
        text: <>{baseName(res.file)} · {sizeLabel(res.size)}{textInfo ? <><br />{textInfo}</> : null}</>,
        actions: [{ label: 'Abrir', onClick: () => api.shell.open(res.file) }, { label: 'Mostrar na pasta', onClick: () => api.shell.reveal(res.file) }],
        timeout: 9000,
      };
      if (tid) toast.update(tid, data); else toast.show(data);
      if (!o.ats && settings?.alsoAts && getTemplate(r.template).ats !== 'alta') {
        exporting.current.delete(key);
        await exportPdf(r, { ats: true });
      }
    } catch (e) {
      const data = { kind: 'error' as const, title: 'Não foi possível gerar o PDF', text: (e as Error).message, actions: [{ label: 'Tentar de novo', onClick: () => exportPdf(r, o) }, { label: 'Diagnóstico', onClick: () => setView({ name: 'diagnostics' }) }] };
      if (tid) toast.update(tid, data); else toast.show(data);
    } finally {
      off();
      exporting.current.delete(key);
    }
  }, [toast, settings]);

  const importFiles = useCallback(async (paths?: string[]) => {
    try {
      const res = await api.resumes.import(paths);
      if (res.canceled) return;
      for (const r of res.imported) patchLocal(r);
      if (res.imported.length) {
        const one = res.imported.length === 1 ? res.imported[0] : null;
        toast.show({
          kind: 'success', title: one ? 'Currículo importado' : `${res.imported.length} currículos importados`, text: one?.docTitle,
          actions: one ? [{ label: 'Abrir', onClick: () => setView({ name: 'editor', id: one.id }) }] : undefined,
        });
      }
      for (const err of res.errors || []) toast.show({ kind: 'error', title: 'Não foi possível importar', text: err });
    } catch (e) {
      toast.show({ kind: 'error', title: 'Não foi possível importar', text: (e as Error).message });
    }
  }, [patchLocal, toast]);

  const value = useMemo<Store>(() => ({
    ready, info, settings, setSettings, resumes, broken, view, nav: setView, update, theme, reload, create, save, patchLocal, duplicate, remove, exportPdf, importFiles, newOpen, setNewOpen,
  }), [ready, info, settings, setSettings, resumes, broken, view, update, theme, reload, create, save, patchLocal, duplicate, remove, exportPdf, importFiles, newOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
