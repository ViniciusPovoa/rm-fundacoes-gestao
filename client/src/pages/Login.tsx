import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { LogIn, AlertCircle, ShieldCheck, Building2, Drill } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { normalizeUsername } from '../lib/input-formatters';
import logoRm from '../assets/logo-rm.png';
import '../styles/login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedUsername = normalizeUsername(username);
      await login(normalizedUsername, password);
      setLocation('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-grid"></div>
        <img src={logoRm} alt="" className="login-watermark login-watermark-main" />
        <img src={logoRm} alt="" className="login-watermark login-watermark-soft" />
      </div>

      <div className="login-shell">
        <section className="login-showcase">
          <div className="login-showcase-content">
            <div className="login-brand-chip">
              <span className="brand-dot"></span>
              RM Fundações
            </div>

            <h1>Controle de obras com uma presença mais forte, técnica e profissional.</h1>
            <p>
              Entre no ambiente da RM para acompanhar suas obras, contratos, receitas, despesas
              e a operação do dia a dia em um só lugar.
            </p>

            <div className="login-feature-list">
              <div className="login-feature-item">
                <ShieldCheck size={18} />
                <span>Painel central para gerir a operação da empresa</span>
              </div>
              <div className="login-feature-item">
                <Building2 size={18} />
                <span>Obras, clientes e contratos organizados com clareza</span>
              </div>
              <div className="login-feature-item">
                <Drill size={18} />
                <span>Controle técnico da rotina operacional em um só ambiente</span>
              </div>
            </div>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo-frame">
                <img src={logoRm} alt="RM Fundações" className="login-logo" />
              </div>
              <div className="login-eyebrow">Área restrita</div>
              <h2>Entrar no sistema</h2>
              <p>Use suas credenciais para acessar a plataforma de gestão.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">Usuário</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                  onBlur={(e) => setUsername(normalizeUsername(e.target.value))}
                  placeholder="Digite o seu usuário"
                  disabled={loading}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                <LogIn size={18} />
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="login-footer">
              <p className="login-hint">
                Acesso controlado pelo administrador da plataforma.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
