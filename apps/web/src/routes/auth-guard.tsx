import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../api/auth/auth-store';

interface Props {
  children: React.ReactNode;
}

export function RequireAuth({ children }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function RedirectIfAuth({ children }: Props) {
  if (isAuthenticated()) {
    return <Navigate to="/homepage" replace />;
  }
  return <>{children}</>;
}

export function RootRedirect() {
  if (isAuthenticated()) {
    return <Navigate to="/homepage" replace />;
  }
  return <Navigate to="/welcome" replace />;
}
