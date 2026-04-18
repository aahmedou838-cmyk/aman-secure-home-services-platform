import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { X, Lock, Unlock, Delete, ArrowRight } from "lucide-react";
import { Puzzle, PUZZLES_REGISTRY } from "@/lib/gameConstants";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
interface PuzzleUIProps {
  puzzleId: string;
  onClose: () => void;
}
export function PuzzleUI({ puzzleId, onClose }: PuzzleUIProps) {
  const [attempt, setAttempt] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const submitPuzzle = useMutation(api.game.submitPuzzle);
  const puzzle = PUZZLES_REGISTRY[puzzleId];
  if (!puzzle) return null;
  const handleInput = (num: string) => {
    if (attempt.length < 4) setAttempt(prev => prev + num);
  };
  const handleDelete = () => {
    setAttempt(prev => prev.slice(0, -1));
  };
  const handleCheck = async () => {
    if (attempt.length < 4) return;
    try {
      const result = await submitPuzzle({ puzzleId, attempt });
      if (result.success) {
        setIsSuccess(true);
        toast.success("تم حل اللغز بنجاح!");
        setTimeout(onClose, 2000);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setAttempt("");
        toast.error("الكود غير صحيح، حاول مجدداً.");
      }
    } catch (e: any) {
      toast.error(e.message || "فشل التحقق من اللغز");
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          x: shake ? [-10, 10, -10, 10, 0] : 0
        }}
        className="w-full max-w-md bg-slate-900 border-2 border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 bg-aman-navy text-center space-y-2">
          <div className="flex justify-between items-center mb-4">
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <Lock className={`w-8 h-8 ${isSuccess ? 'text-green-500' : 'text-aman-teal'} mx-auto`} />
            <div className="w-6" />
          </div>
          <h2 className="text-2xl font-black text-white">{puzzle.title}</h2>
          <p className="text-white/60 text-sm">{puzzle.description}</p>
        </div>
        <div className="p-8 space-y-8">
          <div className="flex justify-center gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all
                  ${attempt[i] ? 'border-aman-teal bg-aman-teal/10 text-white' : 'border-white/10 text-white/20'}
                  ${isSuccess ? 'border-green-500 bg-green-500/10 text-green-500' : ''}
                `}
              >
                {attempt[i] || "•"}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num, idx) => (
              <motion.button
                key={num}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleInput(num)}
                disabled={isSuccess}
                className={`h-16 rounded-2xl bg-white/5 border border-white/10 text-xl font-bold hover:bg-white/10 transition-colors
                  ${idx === 9 ? 'col-start-2' : ''}
                `}
              >
                {num}
              </motion.button>
            ))}
            <button 
              onClick={handleDelete}
              className="h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
          <Button
            onClick={handleCheck}
            disabled={attempt.length < 4 || isSuccess}
            className={`w-full h-16 rounded-2xl text-xl font-black shadow-xl transition-all
              ${isSuccess ? 'bg-green-600' : 'bg-aman-teal hover:bg-aman-teal/90'}
            `}
          >
            {isSuccess ? <Unlock className="w-8 h-8" /> : "تحقق من الكود"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}