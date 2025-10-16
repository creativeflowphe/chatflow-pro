import { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Cog, Copy, Trash2, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNodeTheme } from '../../../hooks/useNodeTheme';

export const ActionNode = ({ data, id }: any) => {
  const { setNodes, getNodes } = useReactFlow();
  const { isDark, getNodeClasses } = useNodeTheme();
  const classes = getNodeClasses('purple');
  const [isEditing, setIsEditing] = useState(false);
  const [editDetails, setEditDetails] = useState(data.details || '');
  const [showActions, setShowActions] = useState(false);

  const handleSave = () => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, details: editDetails },
          };
        }
        return node;
      })
    );
    setIsEditing(false);
    toast.success('Ação atualizada!');
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
      className={`rounded-lg shadow-lg border-2 min-w-[200px] relative group ${isDark ? 'bg-gray-800 border-purple-600' : 'bg-white border-purple-500'}`}
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
          <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
            <Cog className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div className={`font-semibold ${classes.headerText}`}>Ação</div>
        </div>
        <div className={`text-sm mb-2 ${classes.text}`}>
          {data.action || 'Selecione uma ação'}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editDetails}
              onChange={(e) => setEditDetails(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${classes.input}`}
              placeholder="Detalhes da ação..."
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
              >
                <Check className="w-3 h-3" />
                <span>Salvar</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditDetails(data.details || '');
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        ) : (
          data.details && (
            <div className={`text-xs ${classes.textSecondary}`}>
              {data.details}
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
