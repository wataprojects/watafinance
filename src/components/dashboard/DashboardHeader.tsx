"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NotificationPanel from "./NotificationPanel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SUPABASE_URL } from "@/lib/supabase-env";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = "Monyro",
  subtitle = "Tu gestión financiera",
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    navigate("/");
    setLoading(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500">
              <span className="font-bold text-black">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-xs text-green-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationPanel onNotificationsChange={setNotificationCount} />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/profile")}
              className="rounded-2xl text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label="Abrir perfil"
            >
              <User className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loading}
              className="rounded-2xl text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;