import { X, Sparkles, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: typeof Sparkles;
  type: string;
  trigger_type: string;
  flow_data: any;
}

export const TemplatesModal = ({ isOpen, onClose, onSuccess }: TemplatesModalProps) => {
  const { user } = useAuth();

  const templates: Template[] = [
    {
      id: 'welcome',
      name: 'Boas-vindas',
      description: 'Responde automaticamente quando o usuário diz "oi" com mensagem e botões de ação',
      icon: Sparkles,
      type: 'message_response',
      trigger_type: 'message_received',
      flow_data: {
        nodes: [
          {
            id: '1',
            type: 'trigger',
            position: { x: 100, y: 100 },
            data: {
              label: 'Quando usuário envia mensagem',
              keywords: ['oi', 'olá', 'ola', 'hey', 'opa'],
            },
          },
          {
            id: '2',
            type: 'message',
            position: { x: 100, y: 250 },
            data: {
              label: 'Mensagem de boas-vindas',
              content: 'Olá! Bem-vindo! Como posso ajudar você hoje?',
              buttons: ['Ver produtos', 'Falar com atendente', 'Mais informações'],
            },
          },
          {
            id: '3',
            type: 'action_tag',
            position: { x: 100, y: 400 },
            data: {
              action: 'Adicionar tag',
              details: 'cliente-novo',
            },
          },
        ],
        edges: [
          {
            id: 'e1-2',
            source: '1',
            target: '2',
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: 'arrowclosed' },
          },
          {
            id: 'e2-3',
            source: '2',
            target: '3',
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: 'arrowclosed' },
          },
        ],
      },
    },
    {
      id: 'followup',
      name: 'Follow-up Sequência',
      description: 'Sequência de acompanhamento com delay de 1 dia e mensagem promocional',
      icon: Clock,
      type: 'sequence',
      trigger_type: 'sequence_start',
      flow_data: {
        nodes: [
          {
            id: '1',
            type: 'trigger',
            position: { x: 100, y: 100 },
            data: {
              label: 'Iniciar sequência',
            },
          },
          {
            id: '2',
            type: 'message',
            position: { x: 100, y: 250 },
            data: {
              label: 'Mensagem de follow-up (Delay: 1 dia)',
              content: 'Obrigado pelo seu interesse! Tem alguma dúvida sobre nossos produtos?',
              delay: 'Após 1 dia',
            },
          },
          {
            id: '3',
            type: 'message',
            position: { x: 100, y: 400 },
            data: {
              label: 'Mensagem promocional (Delay: 3 dias)',
              content: 'Oferta especial para você! Use o cupom PROMO20 para 20% de desconto em qualquer produto. Válido até amanhã!',
              delay: 'Após 3 dias',
            },
          },
          {
            id: '4',
            type: 'action_tag',
            position: { x: 100, y: 550 },
            data: {
              action: 'Adicionar tag',
              details: 'seguencia-completa',
            },
          },
        ],
        edges: [
          {
            id: 'e1-2',
            source: '1',
            target: '2',
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: 'arrowclosed' },
          },
          {
            id: 'e2-3',
            source: '2',
            target: '3',
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: 'arrowclosed' },
          },
          {
            id: 'e3-4',
            source: '3',
            target: '4',
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: 'arrowclosed' },
          },
        ],
      },
    },
  ];

  const handleCreateFromTemplate = async (template: Template) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('automations')
      .insert({
        user_id: user.id,
        name: template.name,
        description: template.description,
        type: template.type,
        trigger_type: template.trigger_type,
        flow_data: template.flow_data,
        status: 'inactive',
        runs: 0,
        ctr: 0,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erro ao criar automação do template');
    } else {
      toast.success(`Template "${template.name}" criado com sucesso!`);
      onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Templates de Automação</h2>
            <p className="text-sm text-gray-500 mt-1">
              Comece rápido com templates prontos para usar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {template.flow_data.nodes.length} nós
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.type === 'sequence' ? 'Sequência' : 'Resposta Automática'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateFromTemplate(template)}
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Usar Template
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Os templates criados iniciarão em modo inativo. Edite e ative-os quando estiver pronto.
          </p>
        </div>
      </div>
    </div>
  );
};
