import { Handle, Position } from 'reactflow';
import { Zap } from 'lucide-react';

export const TriggerNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-4 min-w-[200px]">
      <div className="flex items-center space-x-2 mb-2">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Zap className="w-4 h-4 text-blue-600" />
        </div>
        <div className="font-semibold text-gray-900">Gatilho</div>
      </div>
      <div className="text-sm text-gray-600">
        {data.label || 'Quando usuário envia mensagem'}
      </div>
      {data.keywords && (
        <div className="mt-2 text-xs text-gray-500">
          Palavras-chave: {data.keywords.join(', ')}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};
