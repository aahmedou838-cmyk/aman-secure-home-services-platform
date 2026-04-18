import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Shield, Info } from "lucide-react";
import { ITEMS_REGISTRY } from "@/lib/gameConstants";
import { Badge } from "@/components/ui/badge";
export function Inventory({ onClose }: { onClose: () => void }) {
  const inventory = useQuery(api.game.getPlayerInventory) ?? [];
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const selectedItem = selectedItemKey ? ITEMS_REGISTRY[selectedItemKey] : null;
  const rarityColors = {
    common: "bg-slate-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-amber-500",
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-900/90 border-2 border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[600px]"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-aman-navy">
          <div className="flex items-center gap-3 text-white">
            <Package className="w-6 h-6 text-aman-teal" />
            <h2 className="text-2xl font-black">الحقيبة السرية</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Item Grid */}
          <div className="w-2/3 p-6 overflow-y-auto grid grid-cols-3 gap-4">
            {inventory.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 opacity-40 text-white">
                <Shield className="w-12 h-12 mb-4" />
                <p>الحقيبة فارغة حالياً</p>
              </div>
            ) : (
              inventory.map((item, idx) => {
                const def = ITEMS_REGISTRY[item.itemKey];
                return (
                  <motion.button
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedIdx(item.itemKey)}
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all
                      ${selectedItemKey === item.itemKey ? 'border-aman-teal bg-aman-teal/20 scale-105' : 'border-white/10 bg-white/5 hover:border-white/30'}
                    `}
                  >
                    <span className="text-3xl">{def?.icon || "📦"}</span>
                    <span className="text-[10px] text-white/60 font-bold">{item.quantity}x</span>
                  </motion.button>
                );
              })
            )}
          </div>
          {/* Details Panel */}
          <div className="w-1/3 bg-black/40 p-6 border-l border-white/10 text-right">
            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-xl">
                    {selectedItem.icon}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-black text-white">{selectedItem.name}</h3>
                    <Badge className={`${rarityColors[selectedItem.rarity]} text-white mt-1`}>
                      {selectedItem.rarity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed italic">
                    "{selectedItem.description}"
                  </p>
                  <div className="pt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[10px] text-aman-teal font-bold justify-end">
                      <span>عنصر فريد</span>
                      <Info className="w-3 h-3" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-white text-center">
                  <Package className="w-12 h-12 mb-2" />
                  <p className="text-xs">اختر عنصراً لعرض التفاصيل</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
  function setSelectedIdx(key: string) {
    setSelectedItemKey(key);
  }
}