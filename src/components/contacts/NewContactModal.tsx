import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: '',
    platform_id: '',
    connection_id: '',
    tags: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!formData.name || !formData.platform_id || !formData.connection_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const { error } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        connection_id: formData.connection_id,
        name: formData.name,
        platform_id: formData.platform_id,
        tags: tagsArray,
      });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast.error('Contato já existe com este ID de plataforma');
      } else {
        toast.error('Erro ao criar contato');
      }
    } else {
      toast.success('Contato criado com sucesso!');
      setFormData({ name: '', platform_id: '', connection_id: '', tags: '' });
      onSuccess();
      onClose();
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID da Plataforma <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.platform_id}
              onChange={(e) => setFormData({ ...formData, platform_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: joao_silva_123"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Username ou ID único do contato na plataforma
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conexão <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.connection_id}
              onChange={(e) => setFormData({ ...formData, connection_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma conexão</option>
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.platform} - {conn.account_name}
                </option>
              ))}
            </select>
            {connections.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Nenhuma conexão ativa encontrada. Configure uma conexão primeiro.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: cliente-vip, interessado"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separe múltiplas tags por vírgula
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || connections.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Contato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
