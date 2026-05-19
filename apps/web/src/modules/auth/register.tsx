import { useState, type FormEvent } from 'react';
import { register, type RegisterPayload } from '../../api/auth';

interface Props {
  onSuccess: () => void;
  onGoLogin: () => void;
}
export function RegisterPage({ onSuccess, onGoLogin }: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  function handleChange(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setError('');
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData as RegisterPayload);
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '请求失败，请稍后重试';

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">MC</span>
          <span className="auth-brand-text">MiniCoze</span>
        </div>

        <h1 className="auth-title">注册 MiniCoze</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span className="auth-label">用户名</span>
            <input
              className="auth-input"
              type="text"
              name="username"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={handleChange('username')}
              required
              autoComplete="username"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">邮箱</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              placeholder="请输入邮箱"
              value={formData.email}
              onChange={handleChange('email')}
              required
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">密码</span>
            <input
              className="auth-input"
              type="password"
              name="password"
              placeholder="请输入密码（至少 6 位）"
              value={formData.password}
              onChange={handleChange('password')}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '处理中...' : '注 册'}
          </button>
        </form>

        <p className="auth-switch">
          已有账号？
          <button className="auth-switch-btn" type="button" onClick={onGoLogin}>
            立即登录
          </button>
        </p>
      </div>
    </main>
  );
}
