import { getCurrentUser } from '../../api/auth-store';
import { logout } from '../../api/auth';

export function HomePage({ onLogout }: { onLogout: () => void }) {
  const user = getCurrentUser();

  return (
    <main className="home-shell">
      <header className="home-header">
        <div className="home-header-left">
          <span className="home-brand-mark">MC</span>
          <span className="home-brand-text">MiniCoze</span>
        </div>
        <div className="home-header-right">
          {user && (
            <span className="home-user-name">{user.username}</span>
          )}
          <button
            className="home-logout-btn"
            type="button"
            onClick={() => {
              logout();
              onLogout();
            }}
          >
            退出登录
          </button>
        </div>
      </header>
      
      <section className="home-content">
        <div className="home-empty">
          <p className="home-empty-text">主页面 — 内容待开发</p>
        </div>
      </section>
    </main>
  );
}
