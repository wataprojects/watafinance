"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Clock, 
  CheckCircle, 
  MessageCircle, 
  CreditCard, 
  Banknote, 
  XCircle,
  Plus,
  Send,
  DollarSign,
  Edit
} from "lucide-react";

interface DebtTimelineProps {
  debtId: string;
}

interface DebtEvent {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
  user_id: string;
}

const eventConfig: Record<string, { icon: any; color: string; label: string }> = {
  created: { icon: Plus, color: "text-amber-400", label: "Creada" },
  accepted: { icon: CheckCircle, color: "text-green-400", label: "Aceptada" },
  rejected: { icon: XCircle, color: "text-red-400", label: "Rechazada" },
  negotiating: { icon: MessageCircle, color: "text-blue-400", label: "En negociación" },
  payment: { icon: DollarSign, color: "text-purple-400", label: "Pago registrado" },
  paid: { icon: Banknote, color: "text-emerald-400", label: "Pagada" },
  amount_changed: { icon: Edit, color: "text-orange-400", label: "Monto modificado" },
  message: { icon: Send, color: "text-zinc-400", label: "Mensaje" }
};

const DebtTimeline: React.FC<DebtTimelineProps> = ({ debtId }) => {
  const [events, setEvents] = useState<DebtEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    
    // Subscribe to new events
    const channel = supabase
      .channel(`debt_events_${debtId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'debt_events',
        filter: `debt_id=eq.${debtId}`
      }, (payload) => {
        setEvents(prev => [payload.new as DebtEvent, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debtId]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('debt_events')
      .select('*')
      .eq('debt_id', debtId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "d MMM yyyy 'a las' HH:mm", { locale: es });
  };

  const renderEventContent = (event: DebtEvent) => {
    const config = eventConfig[event.event_type] || eventConfig.created;
    const Icon = config.icon;
    const data = event.event_data || {};

    return (
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color.replace('text-', 'bg-')}/20`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{config.label}</p>
          {data.message && (
            <p className="text-xs text-zinc-400 mt-0.5">{data.message}</p>
          )}
          {data.amount && (
            <p className="text-xs text-purple-400 mt-0.5">
              Cantidad: {data.amount}€
              {data.total_paid !== undefined && (
                <> · Pagado: {data.total_paid}€ ({data.percentage}%)</>
              )}
            </p>
          )}
          {data.proposed_amount && (
            <p className="text-xs text-blue-400 mt-0.5">
              Propuesta: {data.proposed_amount}€
            </p>
          )}
          <p className="text-[10px] text-zinc-500 mt-1">
            {formatEventDate(event.created_at)}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-zinc-800 rounded" />
              <div className="h-3 w-32 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
        <p className="text-zinc-500 text-sm">Sin eventos aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative">
          {/* Timeline connector */}
          {index < events.length - 1 && (
            <div className="absolute left-4 top-10 w-0.5 h-full bg-zinc-800" />
          )}
          {renderEventContent(event)}
        </div>
      ))}
    </div>
  );
};

export default DebtTimeline;