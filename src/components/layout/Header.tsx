import { MessageSquare, Bell, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export const Header = () => {
  const { signOut, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (data?.full_name) {
          setFullName(data.full_name);
        } else {
          const userEmail = user.email || '';
          setFullName(userEmail.split('@')[0]);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <header className="bg-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border))] h-16 fixed top-0 left-0 right-0 z-30 transition-colors duration-200">
      <div className="h-full flex items-center justify-between px-6">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 p-2 rounded-lg shadow-md">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[rgb(var(--color-text-primary))] ml-3">ChatFlow Pro</h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-all duration-200"
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            ) : (
              <Moon className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            )}
          </button>

          <button className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-all duration-200 relative">
            <Bell className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-sm"></span>
          </button>

          <div className="flex items-center space-x-2 px-3 py-1.5 bg-[rgb(var(--color-bg-tertiary))] rounded-lg">
            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{fullName}</span>
          </div>

          <div className="relative group">
            <button className="p-2 hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-all duration-200">
              <User className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-bg-secondary))] rounded-lg shadow-lg border border-[rgb(var(--color-border))] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={signOut}
                className="block w-full text-left px-4 py-2 text-sm text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
