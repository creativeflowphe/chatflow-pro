import { useEffect, useState } from 'react';
import { Plus, Instagram, Facebook, MessageCircle, Music } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { disconnectInstagram } from '../services/instagramOAuth';

interface Connection {
  id: string;
  platform: string;
  platform_username: string;
  is_active: boolean;
  created_at: string;
}

export const Connections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
    { id: 'facebook', name: 'Facebook Messenger', icon: Facebook, color: 'bg-blue-600' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: 'bg-black' },
  ];

  useEffect(() => {
    loadConnections();
  }, [user]);

  const loadConnections = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Map fields to match interface (account_name -> platform_username, status -> is_active)
      const mappedConnections = data.map(conn => ({
        id: conn.id,
        platform: conn.platform,
        platform_username: conn.account_name || conn.platform_username,
        is_active: conn.status === 'active',
        created_at: conn.created_at,
      }));
      setConnections(mappedConnections);
    }
    setLoading(false);
  };

  const connectPlatform = async (e: React.FormEvent, platform: string) => {
    e.preventDefault();

    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    if (!platform) {
      toast.error('Selecione uma plataforma');
      return;
    }

    setConnecting(true);

    try {
      if (platform === 'instagram') {
        // Hardcoded new ID for OAuth (no env)
        const INSTAGRAM_APP_ID = '31813681161608818';
        const REDIRECT_URI = 'https://chatflow-pro-chi.vercel.app/auth/instagram/callback';
        const scopes = 'business_management,instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_read_engagement';
        const state = Date.now().toString();  // Simple state

        // Save state in Supabase for callback validation
        const { error: stateError } = await supabase
          .from('oauth_states')
          .insert({
            user_id: user.id,
            state,
            platform: 'instagram',
            redirect_uri: REDIRECT_URI,
          });

        if (stateError) {
          throw new Error('Erro ao salvar state de OAuth');
        }

        // OAuth URL with hardcoded new ID
        const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}&ret=login`;

        // Redirect to OAuth
        window.location.href = authUrl;
      } else {
        const existingConnection = connections.find(c => c.platform === platform);

        if (existingConnection) {
          toast.error('Conexão já existe! Edite a conexão existente.');
          setConnecting(false);
          return;
        }

        const { error } = await supabase
          .from('connections')
          .insert([
            {
              user_id: user.id,
              platform,
              account_name: `${platform}_conta_teste`,
              account_id: `${platform}_user_${Date.now()}`,
              access_token: `fake_token_${platform}`,
              status: 'active',
              metadata: {}
            },
          ]);

        if (error) {
          console.error('Erro ao conectar:', error);
          if (error.code === '23505') {
            toast.error('Conexão já existe! Edite a conexão existente.');
          } else {
            toast.error(`Erro ao conectar: ${error.message}`);
          }
        } else {
          toast.success(`${getPlatformName(platform)} conectado com sucesso!`);
          await loadConnections();
        }
      }
    } catch (error: any) {
      console.error('Erro ao conectar plataforma:', error);
      toast.error(error.message || 'Erro ao conectar plataforma');
      // Fallback manual BM token insert (hardcoded token)
      if (platform === 'instagram') {
        const BM_TOKEN = 'EAHEGX9yinnIBPgCZCPcHxwj0cIfp8v2puLoVlmwU87aiP2NB9Qyq0hSu48lCbAxqIPE4ZB6PEwFU4LP5SvEliefOgOMtN2zDYAUJ4hE9HLax9ZCsAwHVRIgnH4m8KSbCgcEa5ZBSagwY53b0v8P9kO7o5BErFZCGb3xbjyaoGYLMr2JGjWyl8LUZCTKeZCRjBPLNwZDZD';  // Seu token BM
        const { error: manualError } = await supabase
          .from('connections')
          .insert({
            user_id: user.id,
            platform: 'instagram',
            account_name: '@pheenixvesting',
            account_id: '17841025451798',
            access_token: BM_TOKEN,
            status: 'active',
            metadata: { verify_token: 'chatflow-ig-verify-2025-abc123def456' }
          });
        if (manualError) {
          toast.error('Erro ao salvar token BM manual: ' + manualError.message);
        } else {
          toast.success('Instagram conectado via BM token!');
          await loadConnections();
        }
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (connectionId: string, platform: string) => {
    if (!confirm('Deseja realmente desconectar esta conta?')) return;

    try {
      if (platform === 'instagram') {
        const success = await disconnectInstagram(connectionId);
        if (!success) {
          toast.error('Erro ao desconectar conta');
          return;
        }
      } else {
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('id', connectionId);

        if (error) {
          console.error('Erro ao desconectar:', error);
          toast.error('Erro ao desconectar conta');
          return;
        }
      }

      toast.success('Conta desconectada com sucesso!');
      await loadConnections();
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      toast.error(error.message || 'Erro ao desconectar conta');
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platforms.find((pl) => pl.id === platform);
    return p ? p.icon : MessageCircle;
  };

  const getPlatformName = (platform: string) => {
    const p = platforms.find((pl) => pl.id === platform);
    return p ? p.name : platform;
  };

  const getPlatformColor = (platform: string) => {
    const p = platforms.find((pl) => pl.id === platform);
    return p ? p.color : 'bg-gray-500';
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">Conexões</h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-2">Conecte suas contas de redes sociais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const connected = connections.find((c) => c.platform === platform.id);

          return (
            <button
              key={platform.id}
              onClick={(e) => {
                if (!connected && !connecting) {
                  setSelectedPlatform(platform.id);
                  connectPlatform(e, platform.id);
                }
              }}
              disabled={!!connected || connecting}
              className={`bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border-2 p-6 text-center hover:shadow-md transition-all ${
                connected ? 'border-green-500 cursor-default' : connecting ? 'border-blue-300 opacity-50 cursor-wait' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className={`${platform.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-[rgb(var(--color-text-primary))] mb-1">{platform.name}</h3>
              {connected ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Conectado
                </span>
              ) : connecting && selectedPlatform === platform.id ? (
                <span className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700"></div>
                  <span>Conectando...</span>
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  Conectar
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : connections.length === 0 ? (
        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-12 text-center transition-colors duration-200">
          <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Nenhuma conexão configurada
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            Conecte suas contas de redes sociais para começar a automatizar
          </p>
        </div>
      ) : (
        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] transition-colors duration-200">
          <div className="p-6 border-b border-[rgb(var(--color-border))]">
            <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Minhas Conexões</h2>
          </div>

          <div className="divide-y divide-[rgb(var(--color-border))]">
            {connections.map((connection) => {
              const Icon = getPlatformIcon(connection.platform);
              const color = getPlatformColor(connection.platform);

              return (
                <div key={connection.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[rgb(var(--color-text-primary))]">
                        {getPlatformName(connection.platform)}
                      </h3>
                      <p className="text-sm text-gray-600">@{connection.platform_username}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        connection.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {connection.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => handleDisconnect(connection.id, connection.platform)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      Desconectar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
