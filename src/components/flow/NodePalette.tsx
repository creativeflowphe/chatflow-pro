import { Zap, MessageSquare, GitBranch, Tag, Send, Link, Radio } from 'lucide-react';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  isDark: boolean;
}

export const NodePalette = ({ onDragStart, isDark }: NodePaletteProps) => {
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
    if (isDark) {
      const darkColors: Record<string, { bg: string; text: string; border: string }> = {
        blue: { bg: 'bg-blue-900/30', text: 'text-blue-300', border: 'border-blue-600' },
        green: { bg: 'bg-green-900/30', text: 'text-green-300', border: 'border-green-600' },
        yellow: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-600' },
        purple: { bg: 'bg-purple-900/30', text: 'text-purple-300', border: 'border-purple-600' },
      };
      return darkColors[color] || darkColors.blue;
    }
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`w-64 border-l p-4 overflow-y-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Paleta de Nós</h3>

      <div className="space-y-4">
        {nodeTypes.map((category) => (
          <div key={category.category}>
            <h4 className={`text-xs font-medium uppercase mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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

      <div className={`mt-6 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Arraste os nós para o canvas para criar seu fluxo de automação.
        </p>
      </div>
    </div>
  );
};
