import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WelcomePage } from './modules/welcome/index';
import { LoginPage, RegisterPage } from './modules/auth';
import { Homepage, HomepageIndex } from './modules/homepage/index';
import { ArchitecturePage } from './modules/architecture/index';
import { CreatAgent } from './modules/agent-config/index';
import { WorkflowCanvasPage } from './modules/workflow-canvas/index';
import { KnowledgeBasePage, KnowledgeCreate, KnowledgeDetail, KnowledgeList } from './modules/knowledge-base/index';
import { setupAuthMocks } from './api/auth';
import { restoreAuthData } from './api/auth/auth-store';
import { RequireAuth, RedirectIfAuth, RootRedirect } from './routes/auth-guard';
setupAuthMocks();
restoreAuthData();

function WelcomeRoute() {
  return <WelcomePage />;
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
              <LoginPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuth>
              <RegisterPage />
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
          <Route path="agent-config" element={<CreatAgent />} />
          <Route path="architecture" element={<ArchitecturePage />} />
          <Route path="workflow-canvas" element={<Navigate to="/workflow-canvas" replace />} />
          <Route path="knowledge-base" element={<Navigate to="/knowledge" replace />} />
        </Route>
        <Route path="workflow-canvas" element={<WorkflowCanvasPage />} />
        <Route
          path="/knowledge"
          element={
            <RequireAuth>
              <KnowledgeBasePage />
            </RequireAuth>
          }
        >
          <Route index element={<KnowledgeList />} />
          <Route path="create" element={<KnowledgeCreate />} />
          <Route path=":id" element={<KnowledgeDetail />} />
        </Route>
        <Route path="/knowledge-base/*" element={<Navigate to="/knowledge" replace />} />
      </Routes>

    </BrowserRouter>
  );
}
