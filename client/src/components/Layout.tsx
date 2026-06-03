import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Menu,
  X,
  BarChart3,
  Users,
  Building2,
  Hammer,
  HandCoins,
  TrendingUp,
  Truck,
  Link2,
  FileText,
  LogOut,
  FileSignature,
  Calculator,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoRm from '../assets/logo-rm.png';
import '../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.innerWidth <= 768;
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.innerWidth > 768;
  });
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleViewportChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const mobile = event.matches;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleViewportChange(mediaQuery);

    const listener = (event: MediaQueryListEvent) => handleViewportChange(event);
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  const handleSidebarToggle = () => {
    setSidebarOpen((current) => !current);
  };

  const handleNavigate = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const displayName = user?.nome || user?.username || 'Admin';
  const sidebarStateClass = isMobile
    ? (sidebarOpen ? 'open mobile-open' : 'mobile-hidden')
    : (sidebarOpen ? 'open' : 'closed');

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/obras', label: 'Obras', icon: Building2 },
    { path: '/servicos', label: 'Serviços', icon: Hammer },
    { path: '/despesas', label: 'Despesas', icon: HandCoins },
    { path: '/receitas', label: 'Receitas', icon: TrendingUp },
    { path: '/equipamentos', label: 'Equipamentos', icon: Truck },
    { path: '/vinculo-equipamentos', label: 'Vinculação', icon: Link2 },
    { path: '/relatorios', label: 'Relatorios', icon: FileText },
    { path: '/contratos', label: 'Contratos', icon: FileSignature },
    { path: '/folha-pagamento', label: 'Folha Pagamento', icon: Calculator },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="layout">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      {isMobile && !sidebarOpen && (
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={handleSidebarToggle}
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarStateClass}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-shell">
              <div className="logo-badge">
                <img src={logoRm} alt="RM Fundações" className="logo-image" />
              </div>
            </div>
          </div>
          <button
            className="toggle-btn"
            onClick={handleSidebarToggle}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={handleNavigate}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{displayName[0]?.toUpperCase() || 'A'}</div>
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">{displayName}</p>
                <p className="user-role">Administrador</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
