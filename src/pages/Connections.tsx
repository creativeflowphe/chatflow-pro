import { useEffect, useState } from 'react';
import { Plus, Instagram, Facebook, MessageCircle, Music } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { initiateInstagramOAuth, disconnectInstagram } from '../services/instagramOAuth';

interface Connection {
  id: string;
  platform: string;
  account_name: string;
  status: string;
  created_at: string;
}

export const Connections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(true);

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
      setConnections(data);
    }
    setLoading(false);
  };

  const connectPlatform = async () => {
    if (!user || !selectedPlatform) return;

    try {
      if (selectedPlatform === 'instagram') {
        await initiateInstagramOAuth(user.id);
      } else {
        toast.error('Esta plataforma ainda não está disponível');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao conectar plataforma');
    }
  };

  const handleDisconnect = async (connectionId: string, platform: string) => {
    if (!confirm('Deseja realmente desconectar esta conta?')) return;

    let success = false;

    if (platform === 'instagram') {
      success = await disconnectInstagram(connectionId);
    }

    if (success) {
      toast.success('Conta desconectada com sucesso!');
      loadConnections();
    } else {
      toast.error('Erro ao desconectar conta');
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
          <h1 className="text-3xl font-bold text-gray-900">Conexões</h1>
          <p className="text-gray-600 mt-2">Conecte suas contas de redes sociais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const connected = connections.find((c) => c.platform === platform.id);

          return (
            <button
              key={platform.id}
              onClick={() => {
                if (!connected) {
                  setSelectedPlatform(platform.id);
                  connectPlatform();
                }
              }}
              disabled={!!connected}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 text-center hover:shadow-md transition-all ${
                connected ? 'border-green-500 cursor-default' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className={`${platform.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>
              {connected ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Conectado
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma conexão configurada
          </h3>
          <p className="text-gray-600 mb-4">
            Conecte suas contas de redes sociais para começar a automatizar
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Minhas Conexões</h2>
          </div>

          <div className="divide-y divide-gray-200">
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
                      <h3 className="font-semibold text-gray-900">
                        {getPlatformName(connection.platform)}
                      </h3>
                      <p className="text-sm text-gray-600">{connection.account_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        connection.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {connection.status === 'active' ? 'Ativo' : 'Inativo'}
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


      <Toaster position="top-right" />
    </div>
  );
};
