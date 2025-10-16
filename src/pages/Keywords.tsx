import { useEffect, useState } from 'react';
import { Search, Filter, Key, TrendingUp, Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { NewKeywordModal } from '../components/keywords/NewKeywordModal';
import { EditKeywordModal } from '../components/keywords/EditKeywordModal';

interface Keyword {
  id: string;
  name: string;
  keywords: string[];
  match_type: string;
  case_sensitive: boolean;
  status: 'active' | 'inactive';
  reply_type: string;
  reply_message: string;
  tags: string[];
  priority: number;
  statistics: {
    matches: number;
    triggers: number;
    last_triggered: string | null;
  };
  updated_at: string;
}

export const Keywords = () => {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);

  useEffect(() => {
    loadKeywords();
  }, [user]);

  const loadKeywords = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setKeywords(data);
    }
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    const { error } = await supabase
      .from('keywords')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      toast.success(`Palavra-chave ${newStatus === 'active' ? 'ativada' : 'desativada'}`);
      loadKeywords();
    } else {
      toast.error('Erro ao atualizar status');
    }
  };

  const deleteKeyword = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta palavra-chave?')) return;

    const { error } = await supabase
      .from('keywords')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Palavra-chave excluída com sucesso');
      loadKeywords();
    } else {
      toast.error('Erro ao excluir palavra-chave');
    }
  };

  const filteredKeywords = keywords.filter((keyword) => {
    const matchesSearch =
      keyword.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      keyword.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || keyword.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getMatchTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      exact: 'Exata',
      contains: 'Contém',
      starts_with: 'Começa com',
      ends_with: 'Termina com',
    };
    return labels[type] || type;
  };

  const getReplyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Texto',
      flow: 'Fluxo',
      tag: 'Tag',
      both: 'Texto + Tag',
    };
    return labels[type] || type;
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return updated.toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">Palavras-chave</h1>
          <p className="text-[rgb(var(--color-text-secondary))] mt-2">
            Configure respostas automáticas baseadas em palavras-chave específicas
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Palavra-chave</span>
        </button>
      </div>

      <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] mb-6 transition-colors duration-200">
        <div className="p-4 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar palavras-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredKeywords.length === 0 ? (
        <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-12 text-center transition-colors duration-200">
          <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            {searchTerm || statusFilter !== 'all'
              ? 'Nenhuma palavra-chave encontrada'
              : 'Nenhuma palavra-chave configurada'}
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar seus filtros de busca'
              : 'Configure palavras-chave para acionar respostas automáticas'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Palavra-chave
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredKeywords.map((keyword) => (
            <div
              key={keyword.id}
              className="bg-[rgb(var(--color-bg-secondary))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">{keyword.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getMatchTypeLabel(keyword.match_type)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getReplyTypeLabel(keyword.reply_type)}
                      </span>
                      {keyword.priority > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Prioridade {keyword.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={keyword.status === 'active'}
                      onChange={() => toggleStatus(keyword.id, keyword.status)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Palavras-chave:</p>
                  <div className="flex flex-wrap gap-2">
                    {keyword.keywords.slice(0, 5).map((kw, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200"
                      >
                        {kw}
                      </span>
                    ))}
                    {keyword.keywords.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-gray-500">
                        +{keyword.keywords.length - 5} mais
                      </span>
                    )}
                  </div>
                </div>

                {keyword.reply_message && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {keyword.reply_message}
                    </p>
                  </div>
                )}

                {keyword.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {keyword.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{keyword.statistics.triggers || 0} acionamentos</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingKeyword(keyword)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteKeyword(keyword.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Atualizado {formatDate(keyword.updated_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewKeywordModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={loadKeywords}
      />

      {editingKeyword && (
        <EditKeywordModal
          keyword={editingKeyword}
          isOpen={!!editingKeyword}
          onClose={() => setEditingKeyword(null)}
          onSuccess={loadKeywords}
        />
      )}

    </div>
  );
};
