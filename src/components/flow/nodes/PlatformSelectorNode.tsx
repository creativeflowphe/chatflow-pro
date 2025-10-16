import { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Network, Instagram, MessageCircle, Facebook, Twitter, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useNodeTheme } from '../../../hooks/useNodeTheme';

interface Platform {
  id: string;
  platform: string;
  platform_username: string;
  is_active: boolean;
}

export const PlatformSelectorNode = ({ data, id }: any) => {
  const { setNodes } = useReactFlow();
  const { user } = useAuth();
  const { isDark } = useNodeTheme();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(data.selectedPlatforms || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlatforms();
  }, [user]);

  const loadPlatforms = async () => {
    if (!user) return;

    const { data: connections, error } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (!error && connections) {
      setPlatforms(connections);
    }
    setLoading(false);
  };

  const togglePlatform = (platformId: string) => {
    const newSelected = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter((p) => p !== platformId)
      : [...selectedPlatforms, platformId];

    setSelectedPlatforms(newSelected);

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, selectedPlatforms: newSelected },
          };
        }
        return node;
      })
    );

    if (newSelected.length > selectedPlatforms.length) {
      toast.success('Plataforma adicionada!');
    } else {
      toast.success('Plataforma removida!');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      default:
        return <Network className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'from-purple-500 to-pink-500';
      case 'whatsapp':
        return 'from-green-500 to-green-600';
      case 'facebook':
        return 'from-blue-600 to-blue-700';
      case 'twitter':
        return 'from-blue-400 to-blue-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`rounded-lg shadow-xl border-2 border-blue-600 min-w-[320px] ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 rounded-t-lg ${isDark ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`}>
        <div className="flex items-center space-x-3 text-white">
          <div className="bg-white/20 p-2 rounded-lg">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-lg">Selecione as Plataformas</div>
            <div className="text-sm text-blue-100">Escolha onde esta automação funcionará</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : platforms.length === 0 ? (
          <div className="text-center py-8">
            <Network className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Nenhuma conexão ativa encontrada</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Conecte suas redes sociais primeiro</p>
          </div>
        ) : (
          <div className="space-y-2">
            {platforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? isDark ? 'border-blue-500 bg-blue-900/30' : 'border-blue-500 bg-blue-50'
                      : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50' : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`bg-gradient-to-br ${getPlatformColor(
                        platform.platform
                      )} p-2 rounded-lg text-white`}
                    >
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold text-sm capitalize ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        {platform.platform}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>@{platform.platform_username}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="bg-blue-600 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selectedPlatforms.length > 0 && (
          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-xs mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedPlatforms.length} plataforma(s) selecionada(s)
            </div>
            <div className="flex flex-wrap gap-1">
              {platforms
                .filter((p) => selectedPlatforms.includes(p.id))
                .map((p) => (
                  <span
                    key={p.id}
                    className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'}`}
                  >
                    {p.platform}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} id="target-top" className="w-3 h-3 !bg-red-500" style={{ left: '40%' }} />
      <Handle type="source" position={Position.Top} id="source-top" className="w-3 h-3 !bg-green-500" style={{ left: '60%' }} />

      <Handle type="target" position={Position.Right} id="target-right" className="w-3 h-3 !bg-red-500" style={{ top: '40%' }} />
      <Handle type="source" position={Position.Right} id="source-right" className="w-3 h-3 !bg-green-500" style={{ top: '60%' }} />

      <Handle type="target" position={Position.Bottom} id="target-bottom" className="w-3 h-3 !bg-red-500" style={{ left: '40%' }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="w-3 h-3 !bg-green-500" style={{ left: '60%' }} />

      <Handle type="target" position={Position.Left} id="target-left" className="w-3 h-3 !bg-red-500" style={{ top: '40%' }} />
      <Handle type="source" position={Position.Left} id="source-left" className="w-3 h-3 !bg-green-500" style={{ top: '60%' }} />
    </div>
  );
};
