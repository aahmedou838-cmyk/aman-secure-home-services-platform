import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Sparkles, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
const AVATARS = [
  { id: 0, name: "المستكشف", color: "bg-aman-teal" },
  { id: 1, name: "الحكيم", color: "bg-aman-navy" },
  { id: 2, name: "المراقب", color: "bg-aman-amber" },
  { id: 3, name: "الظل", color: "bg-slate-800" },
];
export default function CharacterSelectPage() {
  const navigate = useNavigate();
  const initPlayer = useMutation(api.players.initializePlayer);
  const [nickname, setNickname] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const handleStart = async () => {
    if (!nickname.trim()) return toast.error("يرجى إدخال لقب سري");
    setSubmitting(true);
    try {
      await initPlayer({
        nickname: nickname.trim(),
        avatarIndex: selectedIdx,
      });
      toast.success("أهلاً بك في مدينة الأسرار");
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || "فشل إنشاء الشخصية");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-24" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-aman-teal/10 rounded-3xl flex items-center justify-center text-aman-teal mx-auto"
          >
            <Sparkles className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-aman-navy">اختر هويتك السرية</h1>
          <p className="text-muted-foreground text-lg">بمجرد دخولك المدينة، سيُعرف فقط لقبك السري.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {AVATARS.map((avatar, idx) => (
            <motion.button
              key={avatar.id}
              whileHover={{ y: -10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedIdx(idx)}
              className={`relative p-8 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-4 ${
                selectedIdx === idx 
                  ? 'border-aman-teal bg-aman-teal/5 shadow-2xl' 
                  : 'border-transparent bg-muted/30 opacity-60'
              }`}
            >
              <div className={`w-20 h-20 ${avatar.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                <User className="w-10 h-10" />
              </div>
              <span className="font-bold">{avatar.name}</span>
              {selectedIdx === idx && (
                <motion.div 
                  layoutId="selection"
                  className="absolute -top-3 -right-3 bg-aman-teal text-white p-1 rounded-full"
                >
                  <ShieldCheck className="w-6 h-6" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        <div className="bg-card p-8 rounded-[2.5rem] border shadow-sm space-y-6 max-w-md mx-auto">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground pe-2">لقبك السري في المدينة</label>
            <Input 
              placeholder="مثلاً: صقر الصحراء" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="h-14 rounded-2xl text-lg font-bold text-right focus-visible:ring-aman-teal"
            />
          </div>
          <Button 
            onClick={handleStart}
            disabled={submitting || !nickname.trim()}
            className="w-full h-14 rounded-2xl text-xl font-bold bg-aman-teal shadow-xl shadow-aman-teal/20"
          >
            {submitting ? "جاري التحميل..." : "دخول مدينة الأسرار"}
          </Button>
        </div>
      </div>
    </div>
  );
}