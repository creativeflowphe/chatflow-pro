import { Handle, Position } from 'reactflow';
import { Radio } from 'lucide-react';

export const BroadcastNode = ({ data }: any) => {
  return (
    <div className="bg-purple-50 border-2 border-purple-400 rounded-lg shadow-md min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1.5 bg-purple-500 rounded">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-purple-900">Broadcast</span>
        </div>

        <div className="text-xs text-purple-700 space-y-1">
          <p className="font-medium">{data.label || 'Enviar Broadcast'}</p>
          {data.tags && data.tags.length > 0 && (
            <div className="mt-2">
              <p className="text-purple-600 mb-1">Para tags:</p>
              <div className="flex flex-wrap gap-1">
                {data.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-200 text-purple-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.content && (
            <p className="mt-2 text-purple-600 line-clamp-2">{data.content}</p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};
