import { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Zap, Copy, Trash2, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNodeTheme } from '../../../hooks/useNodeTheme';

export const TriggerNode = ({ data, id }: any) => {
  const { setNodes, getNodes } = useReactFlow();
  const { isDark, getNodeClasses } = useNodeTheme();
  const classes = getNodeClasses('blue');
  const [isEditing, setIsEditing] = useState(false);
  const [editKeywords, setEditKeywords] = useState(data.keywords?.join(', ') || '');
  const [showActions, setShowActions] = useState(false);

  const handleSave = () => {
    const keywordsArray = editKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, keywords: keywordsArray },
          };
        }
        return node;
      })
    );
    setIsEditing(false);
    toast.success('Gatilho atualizado!');
  };

  const handleCopy = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);
    if (!currentNode) return;

    const newNode = {
      ...currentNode,
      id: `${currentNode.type}-${Date.now()}`,
      position: {
        x: currentNode.position.x + 50,
        y: currentNode.position.y + 50,
      },
      data: { ...currentNode.data },
    };

    setNodes((nodes) => [...nodes, newNode]);
    toast.success('Nó duplicado!');
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    toast.success('Nó excluído!');
  };

  return (
    <div
      className={`rounded-lg shadow-lg border-2 min-w-[200px] relative group ${isDark ? 'bg-gray-800 border-blue-600' : 'bg-white border-blue-500'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showActions && (
        <div className={`absolute -top-10 right-0 flex items-center space-x-1 rounded-lg shadow-lg border p-1 ${classes.actionBar}`}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-50 rounded transition-colors"
            title="Duplicar"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
            <Zap className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className={`font-semibold ${classes.headerText}`}>Gatilho</div>
        </div>
        <div className={`text-sm mb-2 ${classes.text}`}>
          {data.label || 'Quando usuário envia mensagem'}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editKeywords}
              onChange={(e) => setEditKeywords(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${classes.input}`}
              placeholder="oi, olá, help (separadas por vírgula)"
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
              >
                <Check className="w-3 h-3" />
                <span>Salvar</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditKeywords(data.keywords?.join(', ') || '');
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        ) : (
          data.keywords && (
            <div className={`text-xs ${classes.textSecondary}`}>
              Palavras-chave: {data.keywords.join(', ')}
            </div>
          )
        )}
      </div>

      <Handle type="target" position={Position.Top} id="target-top" className="w-3 h-3 !bg-red-500" style={{ left: '40%' }} />
      <Handle type="source" position={Position.Top} id="source-top" className="w-3 h-3 !bg-green-500" style={{ left: '60%' }} />

      <Handle type="target" position={Position.Right} id="target-right" className="w-3 h-3 !bg-red-500" style={{ top: '40%' }} />
      <Handle type="source" position={Position.Right} id="source-right" className="w-3 h-3 !bg-green-500" style={{ top: '60%' }} />

      <Handle type="target" position={Position.Bottom} id="target-bottom" className="w-3 h-3 !bg-red-500" style={{ left: '40%' }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="w-3 h-3 !bg-green-500" style={{ left: '60%' }} />

      <Handle type="target" position={Position.Left} id="target-left" className="w-3 h-3 !bg-red-500" style={{ top: '40%' }} />
      <Handle type="source" position={Position.Left} id="source-left" className="w-3 h-3 !bg-green-500" style={{ top: '60%' }} />
    </div>
  );
};
