"use client";

import { useEffect, useMemo, useState } from "react";
import { User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Preset avatar URLs - using DiceBear for consistent, professional avatars
const PRESET_AVATARS = [
  // Male avatars
  { id: "male-1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=male1&backgroundColor=b6e3f4", gender: "male" },
  { id: "male-2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=male2&backgroundColor=c0aede", gender: "male" },
  { id: "male-3", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=male3&backgroundColor=ffd5dc", gender: "male" },
  { id: "male-4", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=male4&backgroundColor=d1d4f9", gender: "male" },
  { id: "male-5", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=male5&backgroundColor=ffdfbf", gender: "male" },
  { id: "male-6", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=male6&backgroundColor=c0aede", gender: "male" },
  // Female avatars
  { id: "female-1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=female1&backgroundColor=ffd5dc", gender: "female" },
  { id: "female-2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=female2&backgroundColor=b6e3f4", gender: "female" },
  { id: "female-3", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=female3&backgroundColor=d1d4f9", gender: "female" },
  { id: "female-4", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=female4&backgroundColor=ffdfbf", gender: "female" },
  { id: "female-5", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=female5&backgroundColor=c0aede", gender: "female" },
  { id: "female-6", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=female6&backgroundColor=ffd5dc", gender: "female" },
  // Neutral/Abstract avatars
  { id: "neutral-1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral1&backgroundColor=c0aede", gender: "neutral" },
  { id: "neutral-2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral2&backgroundColor=b6e3f4", gender: "neutral" },
  { id: "neutral-3", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral3&backgroundColor=ffd5dc", gender: "neutral" },
  { id: "neutral-4", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral4&backgroundColor=d1d4f9", gender: "neutral" },
  { id: "neutral-5", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral5&backgroundColor=ffdfbf", gender: "neutral" },
  { id: "neutral-6", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=neutral6&backgroundColor=c0aede", gender: "neutral" },
  // More variety
  { id: "variety-1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=variety1&backgroundColor=ffdfbf", gender: "neutral" },
  { id: "variety-2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=variety2&backgroundColor=b6e3f4", gender: "neutral" },
  { id: "variety-3", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=variety3&backgroundColor=ffd5dc", gender: "neutral" },
  { id: "variety-4", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=variety4&backgroundColor=d1d4f9", gender: "neutral" },
  { id: "variety-5", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=variety5&backgroundColor=c0aede", gender: "neutral" },
  { id: "variety-6", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=variety6&backgroundColor=ffdfbf", gender: "neutral" },
];

type TabType = "all" | "male" | "female" | "neutral";

interface AvatarUploadProps {
  currentUrl?: string | null;
  userId: string;
  onUpload: (url: string) => void;
}

const AvatarUpload = ({ currentUrl, userId, onUpload }: AvatarUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentUrl || null);
  }, [currentUrl]);

  // Check if current URL matches a preset
  const isPresetSelected = useMemo(() => {
    if (!previewUrl) return false;
    return PRESET_AVATARS.some(avatar => avatar.url === previewUrl);
  }, [previewUrl]);

  // Filter avatars based on active tab
  const filteredAvatars = useMemo(() => {
    if (activeTab === "all") return PRESET_AVATARS;
    return PRESET_AVATARS.filter(avatar => avatar.gender === activeTab);
  }, [activeTab]);

  const handleSelectAvatar = async (avatarUrl: string) => {
    setIsSaving(true);
    setPreviewUrl(avatarUrl);
    
    // Simulate a brief save delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onUpload(avatarUrl);
    setIsSaving(false);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    onUpload("");
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "male", label: "Masculinos" },
    { id: "female", label: "Femeninos" },
    { id: "neutral", label: "Neutros" },
  ];

  return (
    <div className="space-y-4">
      {/* Current Avatar Preview */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="h-28 w-28 overflow-hidden rounded-3xl border-2 border-zinc-800 bg-zinc-900 shadow-lg">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Avatar actual" 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                <User className="h-12 w-12 text-zinc-500" />
              </div>
            )}
          </div>
          {isSaving && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      {/* Avatar Selection Grid */}
      <div className="space-y-3">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                activeTab === tab.id
                  ? "bg-green-500 text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Avatar Grid */}
        <ScrollArea className="h-[280px] rounded-xl bg-zinc-900/50 p-3">
          <div className="grid grid-cols-4 gap-3">
            {filteredAvatars.map(avatar => (
              <button
                key={avatar.id}
                onClick={() => handleSelectAvatar(avatar.url)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-2xl border-2 transition-all hover:scale-105 hover:shadow-lg",
                  previewUrl === avatar.url
                    ? "border-green-500 shadow-green-500/20 shadow-lg"
                    : "border-zinc-700 hover:border-zinc-600"
                )}
              >
                <img
                  src={avatar.url}
                  alt={`Avatar ${avatar.id}`}
                  className="h-full w-full object-cover"
                />
                {previewUrl === avatar.url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 shadow-lg">
                      <Check className="h-4 w-4 text-black" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Current Selection Indicator */}
        {previewUrl && isPresetSelected && (
          <p className="text-center text-xs text-zinc-500">
            Avatar seleccionado de la galería
          </p>
        )}

        {/* Remove Button */}
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveAvatar}
            className="w-full rounded-2xl border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          >
            Quitar avatar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;