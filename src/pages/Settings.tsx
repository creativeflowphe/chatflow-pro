import { useState, useEffect } from 'react';
import { User, CreditCard, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      setFullName(data.full_name || '');
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);

    if (!error) {
      alert('Perfil atualizado com sucesso!');
      loadProfile();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">Configurações</h1>
        <p className="text-[rgb(var(--color-text-secondary))] mt-2">Gerencie suas preferências e conta</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] transition-colors duration-200">
          <div className="p-6 border-b border-[rgb(var(--color-border))]">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
              <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Perfil</h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-tertiary))]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]"
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] transition-colors duration-200">
          <div className="p-6 border-b border-[rgb(var(--color-border))]">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
              <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Plano e Pagamento</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[rgb(var(--color-text-primary))]">
                  Plano Atual: {profile?.plan === 'pro' ? 'Pro' : 'Free'}
                </h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                  {profile?.plan === 'pro'
                    ? 'Você tem acesso a todos os recursos premium'
                    : 'Atualize para Pro e tenha acesso ilimitado'}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-lg font-medium ${
                  profile?.plan === 'pro'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]'
                }`}
              >
                {profile?.plan === 'pro' ? 'PRO' : 'FREE'}
              </span>
            </div>

            {profile?.plan === 'free' && (
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Atualizar para Pro
              </button>
            )}
          </div>
        </div>

        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] transition-colors duration-200">
          <div className="p-6 border-b border-[rgb(var(--color-border))]">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
              <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Idioma</h2>
            </div>
          </div>

          <div className="p-6">
            <select
              defaultValue="pt-BR"
              className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
