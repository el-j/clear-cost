import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { AboutPage } from './components/pages/AboutPage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { ToolPage } from './components/pages/ToolPage';
import { I18nProvider } from './i18n/index';

function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <div className="min-h-screen overflow-x-hidden">
          <Header />
          <Routes>
            <Route path="/" element={<ToolPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </HashRouter>
    </I18nProvider>
  );
}

export default App;
