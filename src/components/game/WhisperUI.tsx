import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { X, MessageSquare, Send, Sparkles, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Doc } from "@convex/_generated/dataModel";
interface WhisperUIProps {
  onClose: () => void;
  readOnly?: boolean;
  whisper?: Doc<"whispering_stones">;
}
export function WhisperUI({ onClose, readOnly = false, whisper }: WhisperUIProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const player = useQuery(api.players.getMe);
  const leaveWhisper = useMutation(api.game.leaveWhisper);
  const handleSubmit = async () => {
    if (!message.trim() || !player) return;
    if (message.length > 100) return toast.error("الهمسة يجب أن تكون أقل من 100 حرف");
    setIsSubmitting(true);
    try {
      await leaveWhisper({
        message: message.trim(),
        position: player.position,
        zoneId: player.zoneId
      });
      toast.success("تم ترك همستك في هذا المكان");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "فشل ترك الهمسة");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border-2 border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-aman-teal/10 blur-3xl rounded-full -mr-16 -mt-16" />
        <div className="p-6 border-b border-white/5 bg-aman-navy flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-aman-teal/20 flex items-center justify-center text-aman-teal">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black">{readOnly ? "همسة قديمة" : "اترك همسة"}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          {readOnly && whisper ? (
            <div className="space-y-6 text-right animate-in fade-in">
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 min-h-[120px] relative">
                <Sparkles className="absolute top-4 left-4 w-4 h-4 text-aman-teal/40" />
                <p className="text-lg text-white font-bold leading-relaxed">{whisper.message}</p>
              </div>
              <div className="flex items-center justify-between text-white/40">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-black">{whisper.nickname}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">{new Date(whisper.createdAt).toLocaleDateString("ar-MR")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
              <Textarea 
                placeholder="اكتب همسة سرية ليراها المستكشفون الآخرون في هذا المكان..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={100}
                className="min-h-[120px] rounded-[2rem] bg-white/5 border-white/10 text-white text-right p-6 focus:ring-aman-teal focus:border-aman-teal"
              />
              <div className="flex justify-between items-center px-2">
                <span className={`text-[10px] font-bold ${message.length > 90 ? 'text-aman-red' : 'text-white/40'}`}>
                  {message.length} / 100
                </span>
                <p className="text-[10px] text-white/40 italic">التكلفة: 10 XP</p>
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={!message.trim() || isSubmitting || (player?.xp ?? 0) < 10}
                className="w-full h-14 rounded-2xl bg-aman-teal text-lg font-black shadow-xl"
              >
                {isSubmitting ? "جاري التثبيت..." : "تثبيت الهمسة في الأرض"}
                <Send className="mr-2 w-5 h-5 rotate-180" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}