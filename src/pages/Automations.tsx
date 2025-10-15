import { useEffect, useState } from 'react';
import { Search, Filter, Zap, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Automation {
  id: string;
  name: string;
  description: string;
  type: string;
  trigger_type: string;
  status: 'active' | 'inactive';
  runs: number;
  ctr: number;
  updated_at: string;
}

export const Automations = () => {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomations();
  }, [user]);

  const loadAutomations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setAutomations(data);
    }
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    const { error } = await supabase
      .from('automations')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      loadAutomations();
    }
  };

  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || automation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      message_response: 'Resposta Automática',
      sequence: 'Sequência',
      custom_rules: 'Regras Personalizadas',
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Automações</h1>
        <p className="text-gray-600 mt-2">Gerencie suas automações de chat</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-4 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar automações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      ) : filteredAutomations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all'
              ? 'Nenhuma automação encontrada'
              : 'Nenhuma automação criada ainda'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar seus filtros de busca'
              : 'Crie sua primeira automação para começar a automatizar seus chats'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAutomations.map((automation) => (
            <div
              key={automation.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/automations/editor/${automation.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {automation.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{getTypeLabel(automation.type)}</p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={automation.status === 'active'}
                      onChange={() => toggleStatus(automation.id, automation.status)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {automation.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {automation.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>{automation.runs || 0} execuções</span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatDate(automation.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewAutomationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={loadAutomations}
      />

      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSuccess={loadAutomations}
      />

      <Toaster position="top-right" />
    </div>
  );
};
