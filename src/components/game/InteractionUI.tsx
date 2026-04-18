import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Box, Lock } from "lucide-react";
import { NPC, WORLD_DATA } from "@/lib/gameConstants";
import { DialogueSystem } from "./DialogueSystem";
import { PuzzleUI } from "./PuzzleUI";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
export function InteractionUI({ npc }: { npc: NPC | null }) {
  const [showDialogue, setShowDialogue] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const player = useQuery(api.players.getMe);
  const regionData = WORLD_DATA[player?.zoneId as keyof typeof WORLD_DATA];
  const [nearestObj, setNearestObj] = useState<{ id: string, type: string, label: string } | null>(null);
  useEffect(() => {
    if (!player || !regionData?.interactables) return;
    let closest = null;
    let minDist = 80;
    regionData.interactables.forEach(obj => {
      const dist = Math.sqrt(Math.pow(obj.position.x - player.position.x, 2) + Math.pow(obj.position.y - player.position.y, 2));
      if (dist < minDist) {
        minDist = dist;
        closest = obj;
      }
    });
    setNearestObj(closest);
  }, [player?.position, regionData]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        if (npc) setShowDialogue(true);
        else if (nearestObj?.type === 'puzzle') setShowPuzzle(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [npc, nearestObj]);
  const activeInteraction = npc || nearestObj;
  return (
    <>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80px] pointer-events-none z-40">
        <AnimatePresence>
          {activeInteraction && !showDialogue && !showPuzzle && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="pointer-events-auto bg-aman-teal text-white px-4 py-2 rounded-full font-bold shadow-2xl flex items-center gap-2 border-2 border-white/20 active:scale-95 transition-transform"
              onClick={() => {
                if (npc) setShowDialogue(true);
                else if (nearestObj?.type === 'puzzle') setShowPuzzle(true);
              }}
            >
              {npc ? <MessageSquare className="w-4 h-4" /> : nearestObj?.type === 'puzzle' ? <Lock className="w-4 h-4" /> : <Box className="w-4 h-4" />}
              <span>{npc ? "تحدث" : "تفاعل"} (E)</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {showDialogue && npc && <DialogueSystem npc={npc} onOpenChange={setShowDialogue} />}
      {showPuzzle && nearestObj && <PuzzleUI puzzleId={nearestObj.id} onClose={() => setShowPuzzle(false)} />}
    </>
  );
}