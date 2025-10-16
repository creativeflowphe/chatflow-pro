import { useEffect, useState } from 'react';
import { Plus, Send, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Broadcast {
  id: string;
  name: string;
  content: string;
  segment_tags: string[];
  scheduled_at: string | null;
  status: string;
  sent_count: number;
  created_at: string;
}

export const Broadcasts = () => {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    loadBroadcasts();
  }, [user]);

  const loadBroadcasts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBroadcasts(data);
    }
    setLoading(false);
  };

  const createBroadcast = async () => {
    if (!user || !name.trim() || !content.trim()) return;

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    const { error } = await supabase.from('broadcasts').insert({
      user_id: user.id,
      name: name.trim(),
      content: content.trim(),
      segment_tags: tagArray,
      status: 'draft',
    });

    if (!error) {
      toast.success('Disparo criado com sucesso!');
      setShowModal(false);
      setName('');
      setContent('');
      setTags('');
      loadBroadcasts();
    } else {
      toast.error('Erro ao criar disparo');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sent: 'bg-green-100 text-green-700',
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      scheduled: 'Agendado',
      sent: 'Enviado',
    };
    return labels[status] || status;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">Disparo de Mensagens</h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-2">Envie mensagens em massa para seus contatos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Disparo</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-12 text-center transition-colors duration-200">
          <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Nenhum disparo criado ainda
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            Crie seu primeiro disparo para enviar mensagens para seus contatos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {broadcasts.map((broadcast) => (
            <div
              key={broadcast.id}
              className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                    {broadcast.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                    {getStatusLabel(broadcast.status)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {broadcast.content}
              </p>

              <div className="space-y-2 text-sm">
                {broadcast.segment_tags.length > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Tags: {broadcast.segment_tags.join(', ')}</span>
                  </div>
                )}

                {broadcast.sent_count > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Send className="w-4 h-4 mr-2" />
                    <span>{broadcast.sent_count} mensagens enviadas</span>
                  </div>
                )}

                {broadcast.scheduled_at && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      Agendado para:{' '}
                      {new Date(broadcast.scheduled_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                  Enviar Agora
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-[rgb(var(--color-border))]">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))]">Novo Disparo de Mensagens</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Disparo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Promoção de Verão"
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Digite a mensagem que será enviada..."
                  rows={5}
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {content.length} caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segmentar por Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: cliente-vip, interessado"
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Deixe em branco para enviar para todos os contatos
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-[rgb(var(--color-border))]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createBroadcast}
                disabled={!name.trim() || !content.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Disparo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
