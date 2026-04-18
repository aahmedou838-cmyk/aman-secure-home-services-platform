import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { NPC } from "@/lib/gameConstants";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
interface DialogueSystemProps {
  npc: NPC;
  onOpenChange: (open: boolean) => void;
}
export function DialogueSystem({ npc, onOpenChange }: DialogueSystemProps) {
  const [step, setStep] = useState(0);
  const acceptQuest = useMutation(api.game.acceptQuest);
  const player = useQuery(api.players.getMe);
  const activeQuests = useQuery(api.game.listActiveQuests) ?? [];
  const isQuestActive = activeQuests.some(q => q.questId === npc.questId);
  const isLastStep = step === npc.dialogue.length - 1;
  const handleNext = async () => {
    if (isLastStep) {
      if (npc.questId && !isQuestActive) {
        try {
          await acceptQuest({ questId: npc.questId });
          toast.success("تم قبول المهمة!");
        } catch (e) {
          toast.error("فشل قبول المهمة");
        }
      }
      onOpenChange(false);
    } else {
      setStep(s => s + 1);
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-6 bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-2xl bg-aman-navy/95 border-2 border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
        dir="rtl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-aman-teal/10 blur-3xl rounded-full -mr-16 -mt-16" />
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-aman-teal">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">{npc.name}</h3>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-lg text-white/90 leading-relaxed min-h-[80px]"
            >
              {npc.dialogue[step]}
            </motion.p>
          </AnimatePresence>
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-1">
              {npc.dialogue.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-aman-teal' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
            <Button
              onClick={handleNext}
              className="bg-aman-teal hover:bg-aman-teal/90 rounded-2xl px-8 h-12 font-bold group"
            >
              {isLastStep ? (npc.questId && !isQuestActive ? "قبول المهمة" : "إنهاء") : "التالي"}
              <ChevronLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}