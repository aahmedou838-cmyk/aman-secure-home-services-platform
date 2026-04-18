import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
interface GpsRadarProps {
  status: string;
  isArrived: boolean;
  distance?: number;
  lat?: number;
  lng?: number;
}
export function GpsRadar({ status, isArrived, distance = 500, lat, lng }: GpsRadarProps) {
  // Logic to simulate positioning on the radar based on real coordinate drift
  // Center is the client location
  const offsetX = lng ? (lng - 46.6753) * 100000 : 0;
  const offsetY = lat ? (lat - 24.7136) * 100000 : 0;
  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto overflow-hidden bg-aman-navy/5 rounded-full border-2 border-aman-navy/10 flex items-center justify-center">
      {/* Background Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute border border-aman-teal/20 rounded-full"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: "100%", height: "100%", opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: "linear",
            }}
          />
        ))}
      </div>
      {/* Radar Sweep Line */}
      <motion.div
        className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-aman-teal/40 to-transparent z-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <AnimatePresence mode="wait">
        {isArrived ? (
          <motion.div
            key="arrived"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 bg-aman-teal rounded-full flex items-center justify-center text-white shadow-xl shadow-aman-teal/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-sm font-bold text-aman-teal">وصل الفني</span>
          </motion.div>
        ) : (
          <motion.div
            key="moving"
            className="relative z-10 w-12 h-12 flex items-center justify-center"
            animate={{
              x: Math.min(Math.max(offsetX, -100), 100),
              y: Math.min(Math.max(offsetY, -100), 100),
              scale: distance < 100 ? 1.5 : 1
            }}
            transition={{ type: "spring", stiffness: 50, damping: 10 }}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-aman-teal rounded-full shadow-[0_0_15px_rgba(15,118,110,0.8)]" />
              <motion.div
                className="absolute inset-0 bg-aman-teal rounded-full"
                animate={{ 
                  scale: distance < 100 ? [1, 4] : [1, 2.5], 
                  opacity: distance < 100 ? [0.8, 0] : [0.5, 0] 
                }}
                transition={{ duration: distance < 100 ? 0.8 : 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Status Label Overlay */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        {!isArrived && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-bold">المسافة: {distance} متر</span>
            <span className="bg-aman-navy text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">
              {status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}