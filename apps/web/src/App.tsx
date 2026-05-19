import { useState } from 'react';
import { LoginPage } from './modules/auth/login';
import { RegisterPage } from './modules/auth/register';
import { HomePage } from './modules/homepage';
import { WelcomePage } from './modules/welcome';
import { restoreAuthData } from './api/auth-store';

type Page = 'welcome' | 'login' | 'register' | 'home';

export function App() {
  const [page, setPage] = useState<Page>(() => {
    return restoreAuthData() ? 'home' : 'welcome';
  });

  function goHome() {
    setPage('home');
  }
  function goLogin() {
    setPage('login');
  }
  function goRegister() {
    setPage('register');
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
