import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Zap,
  MessageCircle,
  Send,
  Link as LinkIcon,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Users, label: 'Contatos', path: '/contacts' },
  {
    icon: Zap,
    label: 'Automação',
    path: '/automations',
    submenu: [
      { label: 'Minhas Automações', path: '/automations' },
      { label: 'Básico', path: '/automations/basic' },
      { label: 'Palavras-chave', path: '/automations/keywords' },
      { label: 'Sequências', path: '/automations/sequences' },
      { label: 'Regras', path: '/automations/rules' },
    ],
  },
  { icon: MessageCircle, label: 'Chat ao Vivo', path: '/chat' },
  { icon: Send, label: 'Disparo de Mensagens', path: '/broadcasts' },
  { icon: LinkIcon, label: 'Conexões', path: '/connections' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export const Sidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Automação');
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenu === item.label;
          const isItemActive = isActive(item.path);

          return (
            <div key={item.label}>
              <Link
                to={item.path}
                onClick={(e) => {
                  if (hasSubmenu) {
                    e.preventDefault();
                    setExpandedMenu(isExpanded ? null : item.label);
                  }
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isItemActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {hasSubmenu && (
                  <div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </Link>

              {hasSubmenu && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu!.map((subitem) => (
                    <Link
                      key={subitem.path}
                      to={subitem.path}
                      className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                        isActive(subitem.path)
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {subitem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
