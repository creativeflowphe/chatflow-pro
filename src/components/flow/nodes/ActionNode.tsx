import { Handle, Position } from 'reactflow';
import { Cog } from 'lucide-react';

export const ActionNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-500 p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <div className="flex items-center space-x-2 mb-2">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Cog className="w-4 h-4 text-purple-600" />
        </div>
        <div className="font-semibold text-gray-900">Ação</div>
      </div>
      <div className="text-sm text-gray-600">
        {data.action || 'Selecione uma ação'}
      </div>
      {data.details && (
        <div className="mt-2 text-xs text-gray-500">
          {data.details}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
    </div>
  );
};
