import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { NPC } from "@/lib/gameConstants";
import { DialogueSystem } from "./DialogueSystem";
export function InteractionUI({ npc }: { npc: NPC }) {
  const [showDialogue, setShowDialogue] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        setShowDialogue(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80px] pointer-events-none z-40">
        <AnimatePresence>
          {!showDialogue && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="pointer-events-auto bg-aman-teal text-white px-4 py-2 rounded-full font-bold shadow-2xl flex items-center gap-2 border-2 border-white/20 active:scale-95 transition-transform"
              onClick={() => setShowDialogue(true)}
            >
              <MessageSquare className="w-4 h-4" />
              <span>تحدث (E)</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {showDialogue && <DialogueSystem npc={npc} onOpenChange={setShowDialogue} />}
    </>
  );
}