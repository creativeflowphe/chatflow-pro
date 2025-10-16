import { useEffect, useState } from 'react';
import { Search, MessageCircle, User, Send, Power } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  username: string;
  full_name: string;
  platform: string;
  platform_user_id: string;
  auto_reply_enabled: boolean;
  last_interaction: string;
}

interface Message {
  id: string;
  direction: string;
  content: string;
  created_at: string;
  is_automated: boolean;
}

export const Chat = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact);
      const subscription = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `contact_id=eq.${selectedContact}`
        }, () => {
          loadMessages(selectedContact);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedContact]);

  const loadContacts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('last_interaction', { ascending: false, nullsFirst: false });

    if (!error && data) {
      setContacts(data);
      if (data.length > 0) {
        setSelectedContact(data[0].id);
      }
    }
    setLoading(false);
  };

  const loadMessages = async (contactId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedContact || !user) return;

    const contact = contacts.find(c => c.id === selectedContact);
    if (!contact) return;

    const { error } = await supabase.from('messages').insert({
      user_id: user.id,
      contact_id: selectedContact,
      platform: contact.platform,
      direction: 'outbound',
      content: messageInput.trim(),
      is_automated: false,
      status: 'sent',
    });

    if (!error) {
      setMessageInput('');
      await supabase
        .from('contacts')
        .update({ last_interaction: new Date().toISOString() })
        .eq('id', selectedContact);
      loadMessages(selectedContact);
    } else {
      toast.error('Erro ao enviar mensagem');
    }
  };

  const toggleAutoReply = async (contactId: string, currentState: boolean) => {
    const { error } = await supabase
      .from('contacts')
      .update({ auto_reply_enabled: !currentState })
      .eq('id', contactId);

    if (!error) {
      setContacts(contacts.map(c =>
        c.id === contactId ? { ...c, auto_reply_enabled: !currentState } : c
      ));
      toast.success(!currentState ? 'Respostas automáticas ativadas' : 'Respostas automáticas desativadas');
    } else {
      toast.error('Erro ao atualizar configuração');
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    (contact.full_name || contact.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedContactData = contacts.find((c) => c.id === selectedContact);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 ml-64 mt-16 flex bg-[rgb(var(--color-bg-primary))] transition-colors duration-200">
      <div className="w-80 border-r border-[rgb(var(--color-border))] flex flex-col bg-[rgb(var(--color-bg-secondary))]">
        <div className="p-4 border-b border-[rgb(var(--color-border))]">
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-3">Chat ao Vivo</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[rgb(var(--color-border))] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600">Nenhum contato</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--color-border))]">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedContact === contact.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {contact.full_name || contact.username || 'Sem nome'}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {contact.platform} - {contact.platform_user_id}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        contact.auto_reply_enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {contact.auto_reply_enabled ? 'Auto: ON' : 'Auto: OFF'}
                    </span>
                    {contact.last_interaction && (
                      <span className="text-xs text-gray-500">
                        {formatTime(contact.last_interaction)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedContactData ? (
          <>
            <div className="h-16 border-b border-[rgb(var(--color-border))] flex items-center justify-between px-6 bg-[rgb(var(--color-bg-secondary))]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-[rgb(var(--color-text-primary))]">
                    {selectedContactData.full_name || selectedContactData.username || 'Sem nome'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedContactData.platform} - {selectedContactData.platform_user_id}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleAutoReply(selectedContactData.id, selectedContactData.auto_reply_enabled)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedContactData.auto_reply_enabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={selectedContactData.auto_reply_enabled ? 'Desativar respostas automáticas' : 'Ativar respostas automáticas'}
              >
                <Power className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedContactData.auto_reply_enabled ? 'Auto ON' : 'Auto OFF'}
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.direction === 'inbound' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      message.direction === 'inbound'
                        ? 'bg-gray-200 text-gray-900'
                        : message.is_automated
                        ? 'bg-green-100 text-gray-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p
                        className={`text-xs ${
                          message.direction === 'outbound' && !message.is_automated ? 'text-blue-200' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                      {message.is_automated && (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded ml-2">
                          Auto
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[rgb(var(--color-border))] p-4 bg-[rgb(var(--color-bg-secondary))]">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))]"
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
