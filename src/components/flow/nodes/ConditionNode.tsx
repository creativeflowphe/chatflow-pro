import { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { GitBranch, Copy, Trash2, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNodeTheme } from '../../../hooks/useNodeTheme';

export const ConditionNode = ({ data, id }: any) => {
  const { setNodes, getNodes } = useReactFlow();
  const { isDark, getNodeClasses } = useNodeTheme();
  const classes = getNodeClasses('yellow');
  const [isEditing, setIsEditing] = useState(false);
  const [editCondition, setEditCondition] = useState(data.condition || '');
  const [showActions, setShowActions] = useState(false);

  const handleSave = () => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, condition: editCondition },
          };
        }
        return node;
      })
    );
    setIsEditing(false);
    toast.success('Condição atualizada!');
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
      className={`rounded-lg shadow-lg border-2 min-w-[200px] relative group ${isDark ? 'bg-gray-800 border-yellow-600' : 'bg-white border-yellow-500'}`}
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
          <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
            <GitBranch className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
          <div className={`font-semibold ${classes.headerText}`}>Condição</div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editCondition}
              onChange={(e) => setEditCondition(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${classes.input}`}
              placeholder="Ex: Tag contém 'cliente'"
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg transition-colors"
              >
                <Check className="w-3 h-3" />
                <span>Salvar</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditCondition(data.condition || '');
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        ) : (
          <div className={`text-sm ${classes.text}`}>
            {data.condition || 'Se... então...'}
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} id="target-top" className="w-3 h-3 !bg-red-500" style={{ left: '40%' }} />
      <Handle type="source" position={Position.Top} id="source-top" className="w-3 h-3 !bg-green-500" style={{ left: '60%' }} />

      <Handle type="target" position={Position.Right} id="target-right" className="w-3 h-3 !bg-red-500" style={{ top: '40%' }} />
      <Handle type="source" position={Position.Right} id="source-right" className="w-3 h-3 !bg-green-500" style={{ top: '60%' }} />

      <Handle type="target" position={Position.Bottom} id="target-bottom" className="w-3 h-3 !bg-red-500" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 !bg-green-500" style={{ left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 !bg-orange-500" style={{ left: '70%' }} />

      <Handle type="target" position={Position.Left} id="target-left" className="w-3 h-3 !bg-red-500" style={{ top: '40%' }} />
      <Handle type="source" position={Position.Left} id="source-left" className="w-3 h-3 !bg-green-500" style={{ top: '60%' }} />

      <div className={`flex justify-between text-xs mt-1 px-4 ${classes.textSecondary}`}>
        <span>Não</span>
        <span>Sim</span>
        <span>Não</span>
      </div>
    </div>
  );
};
