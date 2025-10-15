import { Zap, MessageSquare, GitBranch, Tag, Send, Link, Radio } from 'lucide-react';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export const NodePalette = ({ onDragStart }: NodePaletteProps) => {
  const nodeTypes = [
    {
      category: 'Gatilhos',
      nodes: [
        { type: 'trigger', label: 'Mensagem Recebida', icon: Zap, color: 'blue' },
      ],
    },
    {
      category: 'Mensagens',
      nodes: [
        { type: 'message', label: 'Enviar Mensagem', icon: MessageSquare, color: 'green' },
      ],
    },
    {
      category: 'Condições',
      nodes: [
        { type: 'condition', label: 'Condição If/Else', icon: GitBranch, color: 'yellow' },
      ],
    },
    {
      category: 'Ações',
      nodes: [
        { type: 'action_tag', label: 'Adicionar Tag', icon: Tag, color: 'purple' },
        { type: 'action_api', label: 'Chamada API', icon: Link, color: 'purple' },
        { type: 'action_sequence', label: 'Iniciar Sequência', icon: Send, color: 'purple' },
        { type: 'broadcast', label: 'Broadcast', icon: Radio, color: 'purple' },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Paleta de Nós</h3>

      <div className="space-y-4">
        {nodeTypes.map((category) => (
          <div key={category.category}>
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
              {category.category}
            </h4>
            <div className="space-y-2">
              {category.nodes.map((node) => {
                const Icon = node.icon;
                const colors = getColorClasses(node.color);
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className={`${colors.bg} ${colors.border} border-2 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                      <span className={`text-sm font-medium ${colors.text}`}>
                        {node.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          Arraste os nós para o canvas para criar seu fluxo de automação.
        </p>
      </div>
    </div>
  );
};
