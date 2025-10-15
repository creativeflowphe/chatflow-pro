import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Play, Save, Power, PowerOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TriggerNode } from '../components/flow/nodes/TriggerNode';
import { MessageNode } from '../components/flow/nodes/MessageNode';
import { ConditionNode } from '../components/flow/nodes/ConditionNode';
import { ActionNode } from '../components/flow/nodes/ActionNode';
import { BroadcastNode } from '../components/flow/nodes/BroadcastNode';
import { PlatformSelectorNode } from '../components/flow/nodes/PlatformSelectorNode';
import { NodePalette } from '../components/flow/NodePalette';
import toast from 'react-hot-toast';

const nodeTypes = {
  platformSelector: PlatformSelectorNode,
  trigger: TriggerNode,
  message: MessageNode,
  condition: ConditionNode,
  action_tag: ActionNode,
  action_api: ActionNode,
  action_sequence: ActionNode,
  broadcast: BroadcastNode,
};

export const FlowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [automation, setAutomation] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAutomation();
  }, [id, user]);

  const loadAutomation = async () => {
    if (!id || !user) return;

    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setAutomation(data);
      if (data.flow_data?.nodes && data.flow_data.nodes.length > 0) {
        setNodes(data.flow_data.nodes);
      } else {
        const initialNode = {
          id: 'platformSelector-initial',
          type: 'platformSelector',
          position: { x: 250, y: 50 },
          data: {
            label: 'Selecione as Plataformas',
            selectedPlatforms: data.selected_platforms || [],
          },
        };
        setNodes([initialNode]);
      }
      if (data.flow_data?.edges) {
        setEdges(data.flow_data.edges);
      }
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: getNodeLabel(type),
          ...getDefaultNodeData(type),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getNodeLabel = (type: string) => {
    const labels: Record<string, string> = {
      platformSelector: 'Selecione as Plataformas',
      trigger: 'Quando usuário envia mensagem',
      message: 'Enviar mensagem',
      condition: 'Se condição',
      action_tag: 'Adicionar tag',
      action_api: 'Chamada API',
      action_sequence: 'Iniciar sequência',
      broadcast: 'Enviar Broadcast',
    };
    return labels[type] || type;
  };

  const getDefaultNodeData = (type: string) => {
    const defaults: Record<string, any> = {
      platformSelector: { selectedPlatforms: [] },
      trigger: { keywords: ['oi', 'olá'] },
      message: { content: 'Olá! Como posso ajudar?', buttons: [] },
      condition: { condition: 'Tag contém "cliente"' },
      action_tag: { action: 'Adicionar tag', details: 'cliente-interessado' },
      action_api: { action: 'Chamada API', details: 'POST /api/webhook' },
      action_sequence: { action: 'Iniciar sequência', details: 'Sequência de boas-vindas' },
      broadcast: { content: 'Mensagem broadcast', tags: ['todos'] },
    };
    return defaults[type] || {};
  };

  const handleSave = async () => {
    if (!id || !user) return;

    setSaving(true);

    try {
      const platformSelectorNode = nodes.find((n) => n.type === 'platformSelector');
      const selectedPlatforms = platformSelectorNode?.data?.selectedPlatforms || [];

      const { error } = await supabase
        .from('automations')
        .update({
          flow_data: { nodes, edges },
          selected_platforms: selectedPlatforms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (!error) {
        toast.success('Fluxo salvo com sucesso!');
      } else {
        toast.error('Erro ao salvar fluxo');
        console.error('Erro:', error);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro ao salvar fluxo');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!id || !user || !automation) return;

    const newStatus = !automation.is_active;

    const { error } = await supabase
      .from('automations')
      .update({ is_active: newStatus })
      .eq('id', id);

    if (!error) {
      setAutomation({ ...automation, is_active: newStatus });
      toast.success(`Automação ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);
    } else {
      toast.error('Erro ao alterar status da automação');
    }
  };

  if (!automation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/automations')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{automation.name}</h1>
            <p className="text-sm text-gray-500">{automation.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Play className="w-4 h-4" />
            <span>Testar</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Publicar'}</span>
          </button>

          <button
            onClick={toggleStatus}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              automation.is_active
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {automation.is_active ? (
              <>
                <Power className="w-4 h-4" />
                <span>Ativo</span>
              </>
            ) : (
              <>
                <PowerOff className="w-4 h-4" />
                <span>Inativo</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>

        <NodePalette onDragStart={onDragStart} />
      </div>

    </div>
  );
};
