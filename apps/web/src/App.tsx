import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WelcomePage } from './modules/welcome/index';
import { LoginPage, RegisterPage } from './modules/auth';
import { Homepage, HomepageIndex } from './modules/homepage/index';
import { ArchitecturePage } from './modules/architecture/index';
import { CreatAgent } from './modules/agent-config/index';
import { WorkflowCanvasPage } from './modules/workflow-canvas/index';
import { KnowledgeBasePage } from './modules/knowledge-base/index';
import { setupAuthMocks } from './api/auth';
import { restoreAuthData } from './api/auth/auth-store';
import { Document } from './modules/knowledge-base/page/Document';
import { Productionline } from './modules/knowledge-base/page/Productionline';
import { Setting } from './modules/knowledge-base/page/Setting';
import { RetrieveTest } from './modules/knowledge-base/page/RetrieveTest';
import { RequireAuth, RedirectIfAuth, RootRedirect } from './routes/auth-guard';

// 通过环境变量 VITE_USE_AUTH_MOCK 控制是否使用 mock 数据
// .env 中设置 VITE_USE_AUTH_MOCK=false 则走真实后端
const useAuthMock = import.meta.env.VITE_USE_AUTH_MOCK !== 'false';
if (useAuthMock) {
  setupAuthMocks();
}
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
          <Route path="knowledge-base" element={<Navigate to="/knowledge-base" replace />} />
        </Route>
        <Route path="workflow-canvas" element={<WorkflowCanvasPage />} />
        <Route
          path="/knowledge-base"
          element={
            <RequireAuth>
              <KnowledgeBasePage />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="document" replace />} />
          <Route path="document" element={<Document />} />
          <Route path="productionline" element={<Productionline />} />
          <Route path="retrieveTest" element={<RetrieveTest />} />
          <Route path="setting" element={<Setting />} />
        </Route>
      </Routes>

    </BrowserRouter>
  );
}
