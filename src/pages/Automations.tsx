import { useEffect, useState } from 'react';
import { Search, Filter, Zap, Clock, TrendingUp, Grid, List, MoreVertical, Copy, Trash2, Play, Pause, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { NewAutomationModal } from '../components/automations/NewAutomationModal';
import { TemplatesModal } from '../components/automations/TemplatesModal';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  is_active: boolean;
  selected_platforms: any[];
  flow_data: any;
  updated_at: string;
}

export const Automations = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalRuns: 0 });

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/basic')) return 'Automações Básicas';
    if (path.includes('/keywords')) return 'Palavras-chave';
    if (path.includes('/sequences')) return 'Sequências';
    if (path.includes('/rules')) return 'Regras';
    return 'Minhas Automações';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    if (path.includes('/basic')) return 'Respostas automáticas simples para mensagens';
    if (path.includes('/keywords')) return 'Automações acionadas por palavras-chave específicas';
    if (path.includes('/sequences')) return 'Sequências de mensagens automatizadas com delays';
    if (path.includes('/rules')) return 'Regras personalizadas avançadas';
    return 'Gerencie suas automações de chat';
  };

  useEffect(() => {
    loadAutomations();
  }, [user]);

  useEffect(() => {
    setStats({
      total: automations.length,
      active: automations.filter(a => a.is_active).length,
      inactive: automations.filter(a => !a.is_active).length,
      totalRuns: 0
    });
  }, [automations]);

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

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    const { error } = await supabase
      .from('automations')
      .update({ is_active: newStatus })
      .eq('id', id);

    if (!error) {
      loadAutomations();
      toast.success(`Automação ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);
    } else {
      toast.error('Erro ao alterar status da automação');
    }
  };

  const deleteAutomation = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta automação?')) return;

    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Automação excluída com sucesso!');
      loadAutomations();
    } else {
      toast.error('Erro ao excluir automação');
    }
  };

  const duplicateAutomation = async (automation: Automation) => {
    if (!user) return;

    const { error } = await supabase
      .from('automations')
      .insert({
        user_id: user.id,
        name: `${automation.name} (Cópia)`,
        description: automation.description,
        trigger_type: automation.trigger_type,
        flow_data: automation.flow_data,
        selected_platforms: automation.selected_platforms || [],
        is_active: false
      });

    if (!error) {
      toast.success('Automação duplicada com sucesso!');
      loadAutomations();
    } else {
      toast.error('Erro ao duplicar automação');
    }
  };

  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          automation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && automation.is_active) ||
                         (statusFilter === 'inactive' && !automation.is_active);
    return matchesSearch && matchesStatus;
  });

  const getTypeLabel = (triggerType: string) => {
    const labels: Record<string, string> = {
      message_received: 'Resposta Automática',
      sequence_start: 'Sequência',
      custom: 'Regras Personalizadas',
    };
    return labels[triggerType] || triggerType || 'Automação';
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-gray-600 mt-2">{getPageDescription()}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Templates</span>
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>Nova Automação</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Automações</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inativas</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Pause className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Execuções</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalRuns.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
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

            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Limpar Filtros
              </button>
            )}
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
      ) : viewMode === 'grid' ? (
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
                    <p className="text-sm text-gray-500 mt-1">{getTypeLabel(automation.trigger_type)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automation.is_active}
                        onChange={() => toggleStatus(automation.id, automation.is_active)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>

                    <div className="relative">
                      <button
                        onClick={() => setSelectedAutomation(selectedAutomation === automation.id ? null : automation.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {selectedAutomation === automation.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              duplicateAutomation(automation);
                              setSelectedAutomation(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Duplicar</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteAutomation(automation.id);
                              setSelectedAutomation(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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
                      <span>0 execuções</span>
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {filteredAutomations.map((automation) => (
              <div key={automation.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automation.is_active}
                        onChange={() => toggleStatus(automation.id, automation.is_active)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>

                    <div className="flex-1">
                      <Link
                        to={`/automations/editor/${automation.id}`}
                        className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {automation.name}
                      </Link>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{getTypeLabel(automation.trigger_type)}</span>
                        {automation.description && (
                          <span className="text-sm text-gray-600">• {automation.description}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>0</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDate(automation.updated_at)}</span>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setSelectedAutomation(selectedAutomation === automation.id ? null : automation.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {selectedAutomation === automation.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              duplicateAutomation(automation);
                              setSelectedAutomation(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Duplicar</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteAutomation(automation.id);
                              setSelectedAutomation(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

    </div>
  );
};
