import { useEffect, useState } from 'react';
import { Plus, Instagram, Facebook, MessageCircle, Music } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

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
    if (!user || !selectedPlatform || !accountName.trim()) return;

    const { error } = await supabase.from('connections').insert({
      user_id: user.id,
      platform: selectedPlatform,
      account_name: accountName.trim(),
      access_token: 'stub_token_' + Date.now(),
      status: 'active',
    });

    if (!error) {
      toast.success(`${getPlatformName(selectedPlatform)} conectado com sucesso!`);
      setShowModal(false);
      setSelectedPlatform('');
      setAccountName('');
      loadConnections();
    } else {
      if (error.code === '23505') {
        toast.error('Conexão já existe, edite a existente!');
      } else {
        toast.error('Erro ao conectar plataforma');
      }
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
                  setShowModal(true);
                }
              }}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 text-center hover:shadow-md transition-all ${
                connected ? 'border-green-500' : 'border-gray-200'
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
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      Desconectar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Conectar {getPlatformName(selectedPlatform)}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Esta é uma demonstração. Em produção, você seria redirecionado para autenticar
                com OAuth.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Ex: @minha_conta"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPlatform('');
                  setAccountName('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={connectPlatform}
                disabled={!accountName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Conectar
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
};
