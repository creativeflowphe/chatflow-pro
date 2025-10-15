import { Handle, Position } from 'reactflow';
import { MessageSquare } from 'lucide-react';

export const MessageNode = ({ data }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-green-500 p-4 min-w-[250px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      <div className="flex items-center space-x-2 mb-2">
        <div className="bg-green-100 p-2 rounded-lg">
          <MessageSquare className="w-4 h-4 text-green-600" />
        </div>
        <div className="font-semibold text-gray-900">Mensagem</div>
      </div>
      <div className="text-sm text-gray-600 mb-2">
        {data.content || 'Digite sua mensagem...'}
      </div>
      {data.buttons && data.buttons.length > 0 && (
        <div className="space-y-1 mt-2">
          {data.buttons.map((btn: string, idx: number) => (
            <div key={idx} className="bg-blue-50 px-3 py-1 rounded text-xs text-blue-700">
              {btn}
            </div>
          ))}
        </div>
      )}
      {data.delay && (
        <div className="mt-2 text-xs text-gray-500">
          Aguardar: {data.delay}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
};
