import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/cv-base.css';
import './styles/app.css';
import { injectTemplateCss } from './templates';
import { PrintView } from './PrintView';
import { App } from './App';

injectTemplateCss();
const root = createRoot(document.getElementById('root')!);
if (location.hash === '#print') {
  document.documentElement.classList.add('print-mode');
  root.render(<PrintView />);
} else {
  root.render(<App />);
}
