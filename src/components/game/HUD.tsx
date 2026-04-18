import React from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import { Map, Star, ScrollText, User, Zap } from "lucide-react";
export function HUD() {
  const player = useQuery(api.players.getMe);
  const activeQuests = useQuery(api.game.listActiveQuests) ?? [];
  if (!player) return null;
  return (
    <div className="absolute inset-0 pointer-events-none p-6" dir="rtl">
      {/* Top Left: Player Info */}
      <div className="absolute top-6 left-6 flex items-center gap-4 pointer-events-auto">
        <div className="relative">
          <div className="w-16 h-16 bg-aman-navy border-4 border-aman-teal rounded-2xl flex items-center justify-center text-white shadow-xl">
            <User className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-aman-amber text-aman-navy w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border-2 border-white">
            {player.level}
          </div>
        </div>
        <div className="space-y-1 text-left">
          <h3 className="text-white font-black text-lg drop-shadow-lg text-right">{player.nickname}</h3>
          <div className="w-48 h-3 bg-white/10 rounded-full border border-white/20 overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-aman-teal to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${(player.xp % 100)}%` }}
              transition={{ type: "spring", stiffness: 50 }}
            />
          </div>
        </div>
      </div>
      {/* Top Right: Minimap */}
      <div className="absolute top-6 right-6 w-32 h-32 bg-aman-navy/80 backdrop-blur-lg border-2 border-white/20 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex items-center justify-center">
        <Map className="w-8 h-8 text-aman-teal opacity-50" />
        <motion.div
          animate={{ x: (player.position.x / 2000) * 100 - 50, y: (player.position.y / 2000) * 100 - 50 }}
          className="absolute w-2 h-2 bg-aman-red rounded-full shadow-[0_0_10px_red]"
        />
      </div>
      {/* Bottom Left: Quest Tracker */}
      <div className="absolute bottom-8 left-6 pointer-events-auto">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-aman-navy/90 backdrop-blur-xl p-4 rounded-3xl border border-white/10 text-white min-w-[220px] shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
            <ScrollText className="w-4 h-4 text-aman-amber" />
            <span className="text-xs font-black">المهمات النشطة</span>
          </div>
          <div className="space-y-3">
            {activeQuests.length === 0 ? (
              <p className="text-[10px] opacity-40 text-center py-2">لا توجد مهمات نشطة</p>
            ) : (
              activeQuests.map(q => (
                <div key={q._id} className="flex items-start gap-2">
                  <Zap className="w-3 h-3 text-aman-teal mt-1 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold">مهمة: {q.questId}</p>
                    <p className="text-[8px] opacity-60">تواصل مع السكان للتقدم</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
      {/* Floating Secrets Counter */}
      <div className="absolute top-24 right-6 flex items-center gap-2 bg-aman-amber/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-aman-amber/30 pointer-events-auto">
        <Star className="w-4 h-4 text-aman-amber fill-aman-amber" />
        <span className="text-xs font-black text-aman-amber">{player.xp} خبرة</span>
      </div>
    </div>
  );
}