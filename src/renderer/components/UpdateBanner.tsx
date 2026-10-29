// Banner de atualização: disponível → baixando (com %, MB e velocidade) → pronta para instalar.
import { useState } from 'react';
import { api } from '../api';
import { useStore } from '../store';
import { Icon } from './Icon';

const mb = (n?: number) => (n ? (n / 1048576).toFixed(n > 1e8 ? 0 : 1).replace('.', ',') : '0');

export function UpdateBanner() {
  const { update } = useStore();
  const [hidden, setHidden] = useState<string | null>(null);
  if (!update) return null;
  const key = `${update.state}:${update.version}`;
  if (hidden === key) return null;
  if (update.state === 'available') {
    return (
      <div className="banner info">
        <span className="bi"><Icon name="download" /></span>
        <div className="bt"><b>Nova versão disponível: {update.version}</b><div>Você está na {update.current}. {update.manual ? 'Baixe pelo site para atualizar.' : 'O download é feito aqui mesmo, sem perder nada.'}</div></div>
        {update.notesUrl ? <button className="btn ghost sm" onClick={() => api.shell.external(update.notesUrl!)}>Ver novidades</button> : null}
        <button className="btn primary sm" onClick={() => api.update.download()}>{update.manual ? 'Baixar no site' : 'Baixar atualização'}</button>
        <button className="iconbtn" aria-label="Agora não" onClick={() => setHidden(key)}><Icon name="x" size={16} /></button>
      </div>
    );
  }
  if (update.state === 'downloading') {
    return (
      <div className="banner info">
        <span className="bi"><span className="spinner" /></span>
        <div className="bt"><b>Baixando a versão {update.version}… <span className="num">{update.percent}%</span></b>
          <div className="num">{mb(update.transferred)} de {mb(update.total)} MB{update.bytesPerSecond ? ` · ${mb(update.bytesPerSecond)} MB/s` : ''}</div></div>
        <div className="bar" style={{ width: `${update.percent}%` }} />
      </div>
    );
  }
  if (update.state === 'downloaded') {
    return (
      <div className="banner ok">
        <span className="bi"><Icon name="check-circle" /></span>
        <div className="bt"><b>Atualização pronta: versão {update.version}</b><div>Reinicie para instalar agora — ou ela será instalada quando você fechar o app.</div></div>
        <button className="btn primary sm" onClick={() => api.update.install()}>Reiniciar e instalar</button>
        <button className="iconbtn" aria-label="Depois" onClick={() => setHidden(key)}><Icon name="x" size={16} /></button>
      </div>
    );
  }
  if (update.state === 'error' && update.error) {
    return (
      <div className="banner bad">
        <span className="bi"><Icon name="alert-circle" /></span>
        <div className="bt"><b>Não foi possível atualizar</b><div>{update.error}</div></div>
        <button className="btn sm" onClick={() => api.update.check()}>Tentar de novo</button>
        <button className="iconbtn" aria-label="Fechar" onClick={() => setHidden(key)}><Icon name="x" size={16} /></button>
      </div>
    );
  }
  return null;
}
