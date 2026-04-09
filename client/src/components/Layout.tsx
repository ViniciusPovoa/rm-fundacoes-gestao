import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, BarChart3, Users, Briefcase, Wrench, DollarSign, FileText } from 'lucide-react';
import '../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/obras', label: 'Obras', icon: Briefcase },
    { path: '/servicos', label: 'Serviços', icon: Wrench },
    { path: '/despesas', label: 'Despesas', icon: DollarSign },
    { path: '/receitas', label: 'Receitas', icon: DollarSign },
    { path: '/equipamentos', label: 'Equipamentos', icon: Wrench },
    { path: '/vinculo-equipamentos', label: 'Vinculação', icon: Wrench },
    { path: '/relatorios', label: 'Relatórios', icon: FileText },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <h1>RM Fundações</h1>
            <p className="subtitle">Gestão de Obras</p>
          </div>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <a className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">RM</div>
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">RM Fundações</p>
                <p className="user-role">Administrador</p>
              </div>
            )}
          </div>
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
