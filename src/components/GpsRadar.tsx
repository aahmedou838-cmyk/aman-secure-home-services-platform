import React from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
interface GpsRadarProps {
  status: string;
  isArrived: boolean;
}
export function GpsRadar({ status, isArrived }: GpsRadarProps) {
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
      {/* Worker Dot */}
      <motion.div
        className="relative z-10 w-12 h-12 flex items-center justify-center"
        animate={isArrived ? { x: 0, y: 0 } : { x: [20, -10, 5], y: [-30, 10, -5] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      >
        <div className="relative">
          <div className="w-4 h-4 bg-aman-teal rounded-full shadow-[0_0_15px_rgba(15,118,110,0.8)]" />
          <motion.div
            className="absolute inset-0 bg-aman-teal rounded-full"
            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
      {/* Status Label Overlay */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <span className="bg-aman-navy text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">
          {status}
        </span>
      </div>
    </div>
  );
}