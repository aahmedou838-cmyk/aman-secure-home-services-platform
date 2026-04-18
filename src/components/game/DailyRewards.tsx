import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
export function DailyRewards({ onClose }: { onClose: () => void }) {
  const status = useQuery(api.game.getDailyRewardStatus);
  const claim = useMutation(api.game.claimDailyReward);
  const [claiming, setClaiming] = useState(false);
  const [reward, setReward] = useState<{ xpGained: number; leveledUp: boolean } | null>(null);
  const canClaim = !status || (Date.now() - status.lastClaimed) / (1000 * 60 * 60) >= 24;
  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await claim();
      setReward(res);
      toast.success("تم استلام الجائزة اليومية!");
    } catch (e: any) {
      toast.error(e.message || "فشل استلام الجائزة");
    } finally {
      setClaiming(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl" dir="rtl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-md bg-aman-navy border-2 border-white/20 rounded-[3rem] p-10 shadow-[0_0_50px_rgba(15,118,110,0.3)] text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-aman-teal/20 blur-3xl rounded-full -mr-16 -mt-16" />
        <button onClick={onClose} className="absolute top-6 left-6 text-white/40 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <AnimatePresence mode="wait">
          {!reward ? (
            <motion.div key="ready" className="space-y-8 relative z-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white">الكنز اليومي</h2>
                <p className="text-white/60">عد يومياً للحصول على هدايا وأسرار جديدة.</p>
              </div>
              <motion.div
                animate={canClaim ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, -5, 5, 0],
                } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-32 h-32 mx-auto rounded-[2rem] flex items-center justify-center shadow-2xl transition-colors
                  ${canClaim ? 'bg-aman-teal' : 'bg-slate-700 opacity-50'}
                `}
              >
                <Gift className="w-16 h-16 text-white" />
              </motion.div>
              {status && (
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <div
                      key={day}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all
                        ${day <= status.streak ? 'bg-aman-amber border-white/20 text-aman-navy' : 'border-white/10 text-white/20'}
                      `}
                    >
                      <span className="text-xs font-black">{day}</span>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={handleClaim}
                disabled={!canClaim || claiming}
                className="w-full h-16 rounded-[1.5rem] bg-aman-teal hover:bg-aman-teal/90 text-xl font-bold shadow-xl disabled:bg-slate-800"
              >
                {claiming ? <Loader2 className="animate-spin" /> : (canClaim ? "افتح الصندوق" : "عد لاحقاً")}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="reward"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-8 relative z-10"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-white">+{reward.xpGained} XP</h3>
                <p className="text-aman-teal font-bold">زادت خبرتك السرية!</p>
                {reward.leveledUp && (
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-aman-amber text-aman-navy rounded-full font-black text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    ارتفع مستواك!
                  </motion.div>
                )}
              </div>
              <Button onClick={onClose} className="w-full h-14 rounded-2xl bg-white text-aman-navy font-bold">
                رائع!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}