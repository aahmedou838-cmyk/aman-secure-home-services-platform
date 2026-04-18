import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Joystick } from "./Joystick";
import { HUD } from "./HUD";
import { WORLD_DATA, NPC } from "@/lib/gameConstants";
import { InteractionUI } from "./InteractionUI";
import { SocialCard } from "./SocialCard";
import { WhisperUI } from "./WhisperUI";
import { Id, Doc } from "@convex/_generated/dataModel";
export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = useQuery(api.players.getMe);
  const currentRegionId = player?.zoneId || "starter_zone";
  const regionData = WORLD_DATA[currentRegionId as keyof typeof WORLD_DATA];
  const rawOthers = useQuery(api.players.getActivePlayers, { zoneId: currentRegionId });
  const whispers = useQuery(api.game.getWhispers, { zoneId: currentRegionId }) ?? [];
  const others = useMemo(() => rawOthers ?? [], [rawOthers]);
  const updatePos = useMutation(api.players.updatePosition);
  const [pos, setPos] = useState({ x: 500, y: 500 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [nearestNPC, setNearestNPC] = useState<NPC | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<Id<"players"> | null>(null);
  const [selectedWhisper, setSelectedWhisper] = useState<Doc<"whispering_stones"> | null>(null);
  const [regionTransitioning, setRegionTransitioning] = useState(false);
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2
    }));
  }, []);
  useEffect(() => {
    if (player) {
      if (player.zoneId !== currentRegionId) {
        setRegionTransitioning(true);
        setTimeout(() => {
          setPos(player.position);
          setRegionTransitioning(false);
        }, 500);
      } else {
        setPos(player.position);
      }
    }
  }, [player, currentRegionId]);
  useEffect(() => {
    let frameId: number;
    const move = () => {
      if (velocity.x !== 0 || velocity.y !== 0) {
        setPos(prev => ({
          x: Math.max(0, Math.min(2000, prev.x + velocity.x * 6)),
          y: Math.max(0, Math.min(2000, prev.y + velocity.y * 6))
        }));
      }
      frameId = requestAnimationFrame(move);
    };
    frameId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frameId);
  }, [velocity]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.abs(velocity.x) > 0 || Math.abs(velocity.y) > 0) {
        updatePos({ x: pos.x, y: pos.y, zoneId: currentRegionId }).catch(console.error);
      }
    }, 200);
    return () => clearInterval(timer);
  }, [pos, velocity, updatePos, currentRegionId]);
  useEffect(() => {
    if (!regionData) return;
    const npcs = regionData.npcs;
    let closest: NPC | null = null;
    let minDist = 80;
    npcs.forEach(npc => {
      const dist = Math.sqrt(Math.pow(npc.position.x - pos.x, 2) + Math.pow(npc.position.y - pos.y, 2));
      if (dist < minDist) {
        minDist = dist;
        closest = npc;
      }
    });
    setNearestNPC(closest);
  }, [pos, regionData]);
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 80;
  }, []);
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let renderFrame: number;
    const draw = () => {
      const { width, height } = canvas;
      const camX = width / 2 - pos.x;
      const camY = height / 2 - pos.y;
      ctx.fillStyle = currentRegionId === "starter_zone" ? "#0f172a" : currentRegionId === "library_region" ? "#2e1065" : "#1e3a8a";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      particles.forEach(p => {
        const px = (p.x + camX * p.speed) % 2000;
        const py = (p.y + camY * p.speed) % 2000;
        ctx.beginPath();
        ctx.arc(px < 0 ? px + 2000 : px, py < 0 ? py + 2000 : py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = camX % gridSize; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = camY % gridSize; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      // Whispering Stones (Runes)
      whispers.forEach(stone => {
        const sx = stone.position.x + camX;
        const sy = stone.position.y + camY;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#06b6d4";
        ctx.fillStyle = "rgba(6, 182, 212, 0.6)";
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      regionData?.npcs.forEach(npc => {
        const nx = npc.position.x + camX;
        const ny = npc.position.y + camY;
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(nx, ny, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = npc.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Cairo";
        ctx.textAlign = "center";
        ctx.fillText(npc.name, nx, ny - 35);
      });
      regionData?.interactables.forEach(obj => {
        const ox = obj.position.x + camX;
        const oy = obj.position.y + camY;
        ctx.fillStyle = obj.type === 'puzzle' ? "#06b6d4" : "#f59e0b";
        ctx.fillRect(ox - 15, oy - 15, 30, 30);
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Cairo";
        ctx.fillText(obj.label, ox, oy - 25);
      });
      others.forEach(other => {
        if (other.userId === player?.userId) return;
        const ox = other.position.x + camX;
        const oy = other.position.y + camY;
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.arc(ox, oy, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "10px Cairo";
        ctx.textAlign = "center";
        ctx.fillText(other.nickname, ox, oy - 25);
      });
      ctx.fillStyle = "#0f766e";
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      ctx.stroke();
      renderFrame = requestAnimationFrame(draw);
    };
    renderFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(renderFrame);
  }, [pos, others, whispers, player?.userId, currentRegionId, regionData, particles]);
  return (
    <div className="w-full h-full relative touch-none select-none">
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-pointer"
      />
      <HUD />
      <Joystick onMove={setVelocity} />
      <InteractionUI 
        npc={nearestNPC} 
        onReadWhisper={(whisper) => setSelectedWhisper(whisper)}
      />
      {selectedPlayerId && (
        <SocialCard
          playerId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
        />
      )}
      {selectedWhisper && (
        <WhisperUI 
          readOnly 
          whisper={selectedWhisper} 
          onClose={() => setSelectedWhisper(null)} 
        />
      )}
      <AnimatePresence>
        {regionTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[200] flex items-center justify-center"
          >
            <div className="w-16 h-16 border-4 border-aman-teal border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}