import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Box, Lock, Sparkles } from "lucide-react";
import { NPC, WORLD_DATA } from "@/lib/gameConstants";
import { DialogueSystem } from "./DialogueSystem";
import { PuzzleUI } from "./PuzzleUI";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
interface InteractionUIProps {
  npc: NPC | null;
  onReadWhisper: (whisper: Doc<"whispering_stones">) => void;
}
export function InteractionUI({ npc, onReadWhisper }: InteractionUIProps) {
  const [showDialogue, setShowDialogue] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const player = useQuery(api.players.getMe);
  const currentRegionId = player?.zoneId || "starter_zone";
  const regionData = WORLD_DATA[currentRegionId as keyof typeof WORLD_DATA];
  // Memoize whispers to ensure stable reference for proximity detection
  const rawWhispers = useQuery(api.game.getWhispers, { zoneId: currentRegionId });
  const whispers = useMemo(() => rawWhispers ?? [], [rawWhispers]);
  const [nearestObj, setNearestObj] = useState<{ id: string, type: string, label: string } | null>(null);
  const [nearestWhisper, setNearestWhisper] = useState<Doc<"whispering_stones"> | null>(null);
  useEffect(() => {
    if (!player) return;
    // Check objects
    let closestObj = null;
    let minObjDist = 80;
    if (regionData?.interactables) {
      regionData.interactables.forEach(obj => {
        const dist = Math.sqrt(Math.pow(obj.position.x - player.position.x, 2) + Math.pow(obj.position.y - player.position.y, 2));
        if (dist < minObjDist) {
          minObjDist = dist;
          closestObj = obj;
        }
      });
    }
    setNearestObj(closestObj);
    // Check whispers
    let closestWhisper = null;
    let minWhisperDist = 60;
    whispers.forEach(w => {
      const dist = Math.sqrt(Math.pow(w.position.x - player.position.x, 2) + Math.pow(w.position.y - player.position.y, 2));
      if (dist < minWhisperDist) {
        minWhisperDist = dist;
        closestWhisper = w;
      }
    });
    setNearestWhisper(closestWhisper);
  }, [player, whispers, regionData]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        if (npc) setShowDialogue(true);
        else if (nearestWhisper) onReadWhisper(nearestWhisper);
        else if (nearestObj?.type === 'puzzle') setShowPuzzle(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [npc, nearestObj, nearestWhisper, onReadWhisper]);
  const activeInteraction = npc || nearestObj || nearestWhisper;
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
                else if (nearestWhisper) onReadWhisper(nearestWhisper);
                else if (nearestObj?.type === 'puzzle') setShowPuzzle(true);
              }}
            >
              {npc ? (
                <MessageSquare className="w-4 h-4" />
              ) : nearestWhisper ? (
                <Sparkles className="w-4 h-4" />
              ) : nearestObj?.type === 'puzzle' ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Box className="w-4 h-4" />
              )}
              <span>
                {npc ? "تحدث" : nearestWhisper ? "اقرأ الهمسة" : "تفاعل"} (E)
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {showDialogue && npc && <DialogueSystem npc={npc} onOpenChange={setShowDialogue} />}
      {showPuzzle && nearestObj && <PuzzleUI puzzleId={nearestObj.id} onClose={() => setShowPuzzle(false)} />}
    </>
  );
}