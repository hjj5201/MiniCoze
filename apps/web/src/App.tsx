import { useState, useEffect, useCallback, useRef } from 'react';
import { LoginPage } from './modules/auth/login';
import { RegisterPage } from './modules/auth/register';
import { HomePage } from './modules/homepage';
import { WelcomePage } from './modules/welcome';
import { restoreAuthData, isAuthenticated } from './api/auth/auth-store';
import { setupAuthMocks } from './api/auth';

setupAuthMocks();

type Page = 'welcome' | 'login' | 'register' | 'home';

const PAGE_PATH_MAP: Record<Page, string> = {
  welcome: '/welcome',
  login: '/login',
  register: '/register',
  home: '/home',
};

const PATH_PAGE_MAP: Record<string, Page> = {
  '/welcome': 'welcome',
  '/login': 'login',
  '/register': 'register',
  '/home': 'home',
  '/': 'welcome',
};

function pageFromPath(pathname: string): Page {
  return PATH_PAGE_MAP[pathname] ?? 'welcome';
}

function pathFromPage(page: Page): string {
  return PAGE_PATH_MAP[page];
}

export function App() {
  const [page, setPage] = useState<Page>(() => {
    const fromPath = pageFromPath(window.location.pathname);
    if (fromPath === 'home' && !restoreAuthData()) {
      return 'welcome';
    }
    if (fromPath !== 'home' && restoreAuthData()) {
      return 'home';
    }
    return fromPath;
  });

  const navigate = useCallback((next: Page) => {
    setPage(next);
    const url = pathFromPage(next);
    if (window.location.pathname !== url) {
      window.history.pushState(null, '', url);
    }
  }, []);

  useEffect(() => {
    function onPopState() {
      const next = pageFromPath(window.location.pathname);
      if (next === 'home' && !isAuthenticated()) {
        navigate('login');
        return;
      }
      setPage(next);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate]);

  const goHome = useCallback(() => navigate('home'), [navigate]);
  const goLogin = useCallback(() => navigate('login'), [navigate]);
  const goRegister = useCallback(() => navigate('register'), [navigate]);

  const initializedRef = useRef(false);
  if (!initializedRef.current) {
    initializedRef.current = true;
    const target = pathFromPage(page);
    if (window.location.pathname !== target) {
      window.history.replaceState(null, '', target);
    }
  }

  if (page === 'home') {
    return <HomePage onLogout={goLogin} />;
  }
  if (page === 'register') {
    return <RegisterPage onSuccess={goHome} onGoLogin={goLogin} />;
  }
  if (page === 'login') {
    return <LoginPage onSuccess={goHome} onGoRegister={goRegister} />;
  }
  return <WelcomePage onGoLogin={goLogin} />;
}
