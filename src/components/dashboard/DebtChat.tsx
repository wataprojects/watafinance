"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/lib/supabase-env";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DebtChatProps {
  debtId: string;
  currentUserId: string;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

const DebtChat: React.FC<DebtChatProps> = ({ debtId, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`debt_messages_${debtId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'debt_messages',
        filter: `debt_id=eq.${debtId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debtId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('debt_messages')
      .select('*')
      .eq('debt_id', debtId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    
    const { error } = await supabase
      .from('debt_messages')
      .insert({
        debt_id: debtId,
        sender_id: currentUserId,
        message: newMessage.trim()
      });

    if (!error) {
      setNewMessage("");
      
      // Also create an event
      await supabase.from('debt_events').insert({
        debt_id: debtId,
        user_id: currentUserId,
        event_type: 'message',
        event_data: { message: newMessage.trim() }
      });
    }
    
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "HH:mm", { locale: es });
  };

  return (
    <div className="flex flex-col h-64">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm">No hay mensajes aún</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-amber-500 text-black rounded-br-md'
                      : 'bg-zinc-800 text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-black/60' : 'text-zinc-500'}`}>
                    {formatMessageTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex gap-2 pt-2 border-t border-zinc-800">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
          className="bg-zinc-800 border-zinc-700 text-white text-sm"
          disabled={sending}
        />
        <Button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          className="bg-amber-500 hover:bg-amber-600 text-black px-3"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DebtChat;