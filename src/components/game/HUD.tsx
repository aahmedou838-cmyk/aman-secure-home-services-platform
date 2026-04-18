import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Star, ScrollText, User, Zap, Package, Gift, Save } from "lucide-react";
import { Inventory } from "./Inventory";
import { DailyRewards } from "./DailyRewards";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignInForm } from "@/components/SignInForm";
import { Button } from "@/components/ui/button";
export function HUD() {
  const player = useQuery(api.players.getMe);
  const user = useQuery(api.profiles.currentUser);
  const activeQuests = useQuery(api.game.listActiveQuests) ?? [];
  const [showInventory, setShowInventory] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  if (!player) return null;
  const isGuest = user?.isAnonymous ?? false;
  return (
    <div className="absolute inset-0 pointer-events-none p-6" dir="rtl">
      {/* Top Center: Guest Mode Warning */}
      {isGuest && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-full max-w-xs pointer-events-auto">
          <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
            <DialogTrigger asChild>
              <motion.button
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-aman-navy/90 backdrop-blur-md border border-aman-amber/30 rounded-full text-white shadow-2xl"
              >
                <div className="w-2 h-2 bg-aman-amber rounded-full animate-pulse" />
                <span className="text-[10px] font-black">وضع الضيف - سجل لحفظ تقدمك</span>
                <div className="bg-aman-amber text-aman-navy px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1">
                  <Save className="w-3 h-3" />
                  حفظ
                </div>
              </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2rem]" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right text-2xl font-black">حفظ التقدم</DialogTitle>
                <p className="text-right text-muted-foreground text-sm">قم بربط حسابك ببريد إلكتروني لحفظ مستواك ومقتنياتك للأبد.</p>
              </DialogHeader>
              <div className="py-4">
                <SignInForm />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
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
      {/* Top Right: Minimap + Controls */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-4">
        <div className="w-32 h-32 bg-aman-navy/80 backdrop-blur-lg border-2 border-white/20 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex items-center justify-center">
          <Map className="w-8 h-8 text-aman-teal opacity-50" />
          <motion.div
            animate={{ x: (player.position.x / 2000) * 100 - 50, y: (player.position.y / 2000) * 100 - 50 }}
            className="absolute w-2 h-2 bg-aman-red rounded-full shadow-[0_0_10px_red]"
          />
        </div>
        <div className="flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => setShowInventory(true)}
            className="w-12 h-12 bg-aman-navy/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-aman-teal transition-colors shadow-xl"
          >
            <Package className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowDaily(true)}
            className="w-12 h-12 bg-aman-navy/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-aman-teal transition-colors shadow-xl relative"
          >
            <Gift className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-aman-red rounded-full animate-pulse border-2 border-aman-navy" />
          </button>
        </div>
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
      {/* Floating XP Counter */}
      <div className="absolute top-24 right-20 flex items-center gap-2 bg-aman-amber/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-aman-amber/30 pointer-events-auto">
        <Star className="w-4 h-4 text-aman-amber fill-aman-amber" />
        <span className="text-xs font-black text-aman-amber">{player.xp} خبرة</span>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {showInventory && <Inventory onClose={() => setShowInventory(false)} />}
        {showDaily && <DailyRewards onClose={() => setShowDaily(false)} />}
      </AnimatePresence>
    </div>
  );
}