import React from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import { Trophy, Star, Shield, Search, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export function LeaderboardUI({ onClose }: { onClose: () => void }) {
  const leaderboard = useQuery(api.game.getLeaderboard) ?? [];
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1: return <Trophy className="w-6 h-6 text-gray-400" />;
      case 2: return <Trophy className="w-6 h-6 text-amber-600" />;
      default: return <span className="font-bold text-muted-foreground">{index + 1}</span>;
    }
  };
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-slate-900/90 border-2 border-aman-teal/20 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="bg-aman-navy p-6 flex items-center justify-between text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-aman-teal" />
            <h2 className="text-2xl font-black">سجل الباحثين (المتصدرين)</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground w-16">المركز</TableHead>
                <TableHead className="text-right text-muted-foreground">المستكشف</TableHead>
                <TableHead className="text-center text-muted-foreground">المستوى</TableHead>
                <TableHead className="text-left text-muted-foreground">الخبرة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((p, idx) => (
                <TableRow key={p._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="text-center">{getRankIcon(idx)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-aman-teal/20 flex items-center justify-center text-aman-teal">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{p.nickname}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="bg-aman-amber/20 text-aman-amber px-2 py-0.5 rounded font-black text-xs">
                      {p.level}
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <Star className="w-3 h-3 text-aman-teal" />
                      {p.xp} XP
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {leaderboard.length === 0 && (
            <div className="py-20 text-center text-muted-foreground space-y-4">
              <Search className="w-12 h-12 mx-auto opacity-20" />
              <p>لا يوجد باحثون في السجل حالياً</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-aman-teal/5 text-center text-[10px] text-white/40 border-t border-white/5">
          يتم تحديث الترتيب بناءً على المستوى وإجمالي الخبرة المحصلة.
        </div>
      </motion.div>
    </div>
  );
}