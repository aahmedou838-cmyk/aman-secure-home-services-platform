import React from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import { X, User, Shield, Star, Info } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import { ITEMS_REGISTRY } from "@/lib/gameConstants";
interface SocialCardProps {
  playerId: Id<"players">;
  onClose: () => void;
}
export function SocialCard({ playerId, onClose }: SocialCardProps) {
  const profile = useQuery(api.game.getSocialProfile, { playerId });
  if (!profile) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="w-full max-w-[320px] bg-slate-900 border-2 border-aman-teal/30 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-aman-teal/40 to-transparent" />
        <button onClick={onClose} className="absolute top-4 left-4 p-1 bg-black/20 hover:bg-black/40 rounded-full text-white/60 transition-colors z-10">
          <X className="w-4 h-4" />
        </button>
        <div className="p-8 space-y-6 relative">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-aman-navy border-4 border-aman-teal rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative">
              <User className="w-10 h-10" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-aman-amber text-aman-navy rounded-lg flex items-center justify-center font-black text-xs border-2 border-slate-900">
                {profile.level}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-white">{profile.nickname}</h3>
              <p className="text-[10px] text-aman-teal font-bold tracking-widest uppercase">مستكشف مدينة الأسرار</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-white/40 text-[10px] font-bold border-b border-white/5 pb-2">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-aman-amber" /> {profile.xp} XP</span>
              <span className="flex items-center gap-1">المستوى {profile.level} <Shield className="w-3 h-3 text-aman-teal" /></span>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-white/60 text-right flex items-center justify-end gap-1">
                 أهم المقتنيات <Info className="w-3 h-3" />
              </p>
              <div className="flex gap-2 justify-center">
                {profile.topItems.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic py-4">لا توجد مقتنيات نادرة بعد</p>
                ) : (
                  profile.topItems.map((itemKey) => {
                    const def = ITEMS_REGISTRY[itemKey];
                    return (
                      <div key={itemKey} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/10 group relative">
                        {def?.icon}
                        <div className="absolute -bottom-8 bg-black p-1 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {def?.name}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <div className="pt-4">
            <div className="p-4 bg-aman-teal/10 rounded-2xl border border-aman-teal/20 text-center">
               <p className="text-[10px] text-aman-teal font-black">الحالة: نشط الآن في نواكشوط</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}