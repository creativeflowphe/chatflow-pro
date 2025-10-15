import { useState } from 'react';
import { X, Plus, Trash2, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface NewKeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewKeywordModal = ({ isOpen, onClose, onSuccess }: NewKeywordModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [matchType, setMatchType] = useState<'exact' | 'contains' | 'starts_with' | 'ends_with'>('contains');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [replyType, setReplyType] = useState<'text' | 'tag' | 'both'>('text');
  const [replyMessage, setReplyMessage] = useState('');
  const [tags, setTags] = useState<string[]>(['']);
  const [priority, setPriority] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const addKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const updateKeyword = (index: number, value: string) => {
    const updated = [...keywords];
    updated[index] = value;
    setKeywords(updated);
  };

  const removeKeyword = (index: number) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const updateTag = (index: number, value: string) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const removeTag = (index: number) => {
    if (tags.length > 1) {
      setTags(tags.filter((_, i) => i !== index));
    }
  };

  const handleCreate = async () => {
    if (!user || !name.trim()) {
      toast.error('Preencha o nome da regra');
      return;
    }

    const filteredKeywords = keywords.filter(k => k.trim() !== '');
    if (filteredKeywords.length === 0) {
      toast.error('Adicione pelo menos uma palavra-chave');
      return;
    }

    if (replyType === 'text' || replyType === 'both') {
      if (!replyMessage.trim()) {
        toast.error('Preencha a mensagem de resposta');
        return;
      }
    }

    const filteredTags = tags.filter(t => t.trim() !== '');
    if ((replyType === 'tag' || replyType === 'both') && filteredTags.length === 0) {
      toast.error('Adicione pelo menos uma tag');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('keywords')
      .insert({
        user_id: user.id,
        name: name.trim(),
        keywords: filteredKeywords,
        match_type: matchType,
        case_sensitive: caseSensitive,
        status: 'active',
        reply_type: replyType,
        reply_message: replyMessage.trim(),
        tags: filteredTags,
        priority,
        statistics: { matches: 0, triggers: 0, last_triggered: null },
      });

    setLoading(false);

    if (error) {
      console.error('Erro ao criar palavra-chave:', error);
      toast.error(`Erro ao criar palavra-chave: ${error.message}`);
    } else {
      toast.success('Palavra-chave criada com sucesso!');
      onSuccess();
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setKeywords(['']);
    setMatchType('contains');
    setCaseSensitive(false);
    setReplyType('text');
    setReplyMessage('');
    setTags(['']);
    setPriority(0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Nova Palavra-chave</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Regra
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Saudações"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Palavras-chave
              </label>
              <button
                onClick={addKeyword}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {keywords.map((keyword, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    placeholder="Ex: oi, olá, hey"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {keywords.length > 1 && (
                    <button
                      onClick={() => removeKeyword(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Correspondência
              </label>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="exact">Correspondência Exata</option>
                <option value="contains">Contém</option>
                <option value="starts_with">Começa com</option>
                <option value="ends_with">Termina com</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="caseSensitive"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="caseSensitive" className="ml-2 text-sm text-gray-700">
              Diferenciar maiúsculas de minúsculas
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Resposta
            </label>
            <select
              value={replyType}
              onChange={(e) => setReplyType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="text">Enviar Mensagem</option>
              <option value="tag">Adicionar Tags</option>
              <option value="both">Mensagem + Tags</option>
            </select>
          </div>

          {(replyType === 'text' || replyType === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem de Resposta
              </label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Digite a mensagem que será enviada automaticamente..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Você pode usar variáveis como: {'{nome}'}, {'{telefone}'}, {'{email}'}
              </p>
            </div>
          )}

          {(replyType === 'tag' || replyType === 'both') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tags a Adicionar
                </label>
                <button
                  onClick={addTag}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </button>
              </div>
              <div className="space-y-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      placeholder="Ex: cliente-interessado"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {tags.length > 1 && (
                      <button
                        onClick={() => removeTag(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Dica:</p>
                <p>
                  Use prioridade maior para palavras-chave mais específicas. Quando múltiplas regras
                  correspondem, a com maior prioridade será executada primeiro.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando...' : 'Criar Palavra-chave'}
          </button>
        </div>
      </div>
    </div>
  );
};
