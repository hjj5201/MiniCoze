import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { WelcomePage } from './modules/welcome/index';
import { LoginPage } from './modules/auth/login';
import { RegisterPage } from './modules/auth/register';
import { Homepage, HomepageIndex } from './modules/homepage/index';
import { AgentConfigIndex } from './modules/agent-config/index';
import { ArchitecturePage } from './modules/architecture/index';
import { WorkflowCanvasPage } from './modules/workflow-canvas/index';
import { KnowledgeBasePage } from './modules/knowledge-base/index';
import { setupAuthMocks } from './api/auth';
import { restoreAuthData } from './api/auth/auth-store';
import { RequireAuth, RedirectIfAuth, RootRedirect } from './routes/auth-guard';

setupAuthMocks();
restoreAuthData();

function WelcomeRoute() {
  return <WelcomePage />;
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
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/welcome"
          element={
            <RedirectIfAuth>
              <WelcomeRoute />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <LoginRoute />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuth>
              <RegisterRoute />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/homepage"
          element={
            <RequireAuth>
              <Homepage />
            </RequireAuth>
          }
        >
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
