import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
interface JoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
}
export function Joystick({ onMove }: JoystickProps) {
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleDrag = (_: any, info: any) => {
    const radius = 50;
    const x = Math.min(Math.max(info.offset.x, -radius), radius);
    const y = Math.min(Math.max(info.offset.y, -radius), radius);
    // Normalize
    onMove({ x: x / radius, y: y / radius });
  };
  const handleDragEnd = () => {
    setActive(false);
    onMove({ x: 0, y: 0 });
  };
  return (
    <div className="absolute bottom-8 right-8 z-50">
      <div 
        ref={containerRef}
        className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/20 flex items-center justify-center shadow-xl"
      >
        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={() => setActive(true)}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className={`w-16 h-16 rounded-full cursor-grab active:cursor-grabbing shadow-lg transition-colors
            ${active ? 'bg-aman-teal scale-110' : 'bg-white/40'}
          `}
          style={{ x: 0, y: 0 }}
        />
      </div>
      <p className="text-center mt-2 text-[10px] font-bold text-white/50 uppercase tracking-widest">
        تحكم الحركة
      </p>
    </div>
  );
}