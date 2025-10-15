import { useEffect, useState } from 'react';
import { Users, Zap, MessageCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    contacts: 0,
    activeAutomations: 0,
    conversations: 0,
    totalRuns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      const [contacts, automations, conversations] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('automations').select('runs').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const totalRuns = automations.data?.reduce((sum, a) => sum + (a.runs || 0), 0) || 0;

      setStats({
        contacts: contacts.count || 0,
        activeAutomations: automations.data?.length || 0,
        conversations: conversations.count || 0,
        totalRuns,
      });
      setLoading(false);
    };

    loadStats();
  }, [user]);

  const statCards = [
    {
      icon: Users,
      label: 'Contatos',
      value: stats.contacts,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: Zap,
      label: 'Automações Ativas',
      value: stats.activeAutomations,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      icon: MessageCircle,
      label: 'Conversas',
      value: stats.conversations,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      icon: TrendingUp,
      label: 'Total de Execuções',
      value: stats.totalRuns,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Início</h1>
        <p className="text-gray-600 mt-2">Visão geral das suas automações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
        <div className="space-y-4">
          {stats.activeAutomations > 0 ? (
            <p className="text-gray-600">Suas automações estão funcionando perfeitamente!</p>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma automação ativa ainda.</p>
              <p className="text-sm text-gray-500 mt-1">
                Crie sua primeira automação para começar!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
