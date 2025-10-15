import { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Connection {
  id: string;
  platform: string;
  account_name: string;
}

export const NewContactModal = ({ isOpen, onClose, onSuccess }: NewContactModalProps) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [platformUserId, setPlatformUserId] = useState('');
  const [connectionId, setConnectionId] = useState('');
  const [platform, setPlatform] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadConnections();
    }
  }, [isOpen, user]);

  const loadConnections = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('connections')
      .select('id, platform, account_name')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!error && data) {
      setConnections(data);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleConnectionChange = (connId: string) => {
    setConnectionId(connId);
    const conn = connections.find(c => c.id === connId);
    if (conn) {
      setPlatform(conn.platform);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    if (!name.trim() || !platformUserId.trim() || !connectionId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          name: name.trim(),
          platform: platform || 'other',
          platform_user_id: platformUserId.trim(),
          tags,
          last_interaction: new Date().toISOString(),
        });

      if (error) {
        console.error('Erro ao criar contato:', error);
        if (error.code === '23505') {
          toast.error('Contato já existe com este ID de plataforma');
        } else {
          toast.error(`Erro ao criar contato: ${error.message}`);
        }
        return;
      }

      toast.success('Contato criado com sucesso!');
      setName('');
      setPlatformUserId('');
      setConnectionId('');
      setTags([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast.error(error.message || 'Erro ao criar contato');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Contato</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Ex: João Silva"
              required
            />
          </div>

          {connections.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conexão / Plataforma <span className="text-red-500">*</span>
              </label>
              <select
                value={connectionId}
                onChange={(e) => handleConnectionChange(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                required
              >
                <option value="">Selecione uma conexão</option>
                {connections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.platform.charAt(0).toUpperCase() + conn.platform.slice(1)} - {conn.account_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {connections.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Nenhuma conexão ativa encontrada. Configure uma conexão primeiro na página de Conexões.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID da Plataforma <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={platformUserId}
              onChange={(e) => setPlatformUserId(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Ex: @joao_silva ou 123456789"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Username ou ID único do contato na plataforma
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Digite uma tag e pressione Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={loading}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Tag className="w-5 h-5" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={loading}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || connections.length === 0 || !name.trim() || !platformUserId.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Criando...' : 'Criar Contato'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
