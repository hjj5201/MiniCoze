import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { WelcomePage } from './modules/welocome/index';
import { LoginPage } from './modules/auth/login';
import { RegisterPage } from './modules/auth/register';
import { Homepage, HomepageIndex } from './modules/homepage/index';
import { AgentConfigIndex } from './modules/agent-config/index';
import { ArchitecturePage } from './modules/architecture/index';
import { WorkflowCanvasPage } from './modules/workflow-canvas/index';
import { KnowledgeBasePage } from './modules/knowledge-base/index';

function WelcomeRoute() {
  const navigate = useNavigate();
  return <WelcomePage onGoLogin={() => navigate('/login')} />;
}

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onSuccess={() => navigate('/homepage')}
      onGoRegister={() => navigate('/register')}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();
  return (
    <RegisterPage
      onSuccess={() => navigate('/homepage')}
      onGoLogin={() => navigate('/login')}
    />
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<WelcomeRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/homepage" element={<Homepage />}>
          <Route index element={<HomepageIndex />} />
          <Route path="agent-config" element={<AgentConfigIndex />} />
          <Route path="architecture" element={<ArchitecturePage />} />
          <Route path="workflow-canvas" element={<WorkflowCanvasPage />} />
          <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
