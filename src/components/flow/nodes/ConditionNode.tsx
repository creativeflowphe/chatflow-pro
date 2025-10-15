import { Handle, Position } from 'reactflow';
import { GitBranch } from 'lucide-react';

export const ConditionNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-500 p-4 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-yellow-500" />
      <div className="flex items-center space-x-2 mb-2">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <GitBranch className="w-4 h-4 text-yellow-600" />
        </div>
        <div className="font-semibold text-gray-900">Condição</div>
      </div>
      <div className="text-sm text-gray-600">
        {data.condition || 'Se... então...'}
      </div>
      <div className="flex justify-between mt-3">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="w-3 h-3 bg-green-500"
          style={{ left: '30%' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="w-3 h-3 bg-red-500"
          style={{ left: '70%' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span className="ml-2">Sim</span>
        <span className="mr-2">Não</span>
      </div>
    </div>
  );
};
