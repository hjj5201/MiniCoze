import { useState, type FormEvent } from 'react';
import { login, type LoginPayload } from '../../api/auth';

interface Props {
  onSuccess: () => void;
  onGoRegister: () => void;
}

export function LoginPage({ onSuccess, onGoRegister }: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
      await login(formData as LoginPayload);
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

        <h1 className="auth-title">登录 MiniCoze</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleChange('password')}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '处理中...' : '登 录'}
          </button>
        </form>

        <p className="auth-switch">
          还没有账号？
          <button className="auth-switch-btn" type="button" onClick={onGoRegister}>
            立即注册
          </button>
        </p>
      </div>
    </main>
  );
}
