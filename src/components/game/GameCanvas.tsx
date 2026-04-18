import React, { useRef, useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Joystick } from "./Joystick";
import { HUD } from "./HUD";
import { WORLD_DATA, NPC } from "@/lib/gameConstants";
import { InteractionUI } from "./InteractionUI";
import { SocialCard } from "./SocialCard";
import { Id } from "@convex/_generated/dataModel";
export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = useQuery(api.players.getMe);
  const currentRegionId = player?.zoneId || "starter_zone";
  const regionData = WORLD_DATA[currentRegionId as keyof typeof WORLD_DATA];
  const rawOthers = useQuery(api.players.getActivePlayers, { zoneId: currentRegionId });
  const others = useMemo(() => rawOthers ?? [], [rawOthers]);
  const updatePos = useMutation(api.players.updatePosition);
  const [pos, setPos] = useState({ x: 500, y: 500 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [nearestNPC, setNearestNPC] = useState<NPC | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<Id<"players"> | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    if (player) setPos(player.position);
  }, [player]);
  useEffect(() => {
    let frameId: number;
    const move = () => {
      setPos(prev => ({
        x: Math.max(0, Math.min(2000, prev.x + velocity.x * 6)),
        y: Math.max(0, Math.min(2000, prev.y + velocity.y * 6))
      }));
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
    }, 100);
    return () => clearInterval(timer);
  }, [pos, velocity, updatePos, currentRegionId]);
  // Interaction detection
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
  // Click detection for players
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const width = canvas.width;
    const height = canvas.height;
    const camX = width / 2 - pos.x;
    const camY = height / 2 - pos.y;
    others.forEach(other => {
      if (other.userId === player?.userId) return;
      const screenX = other.position.x + camX;
      const screenY = other.position.y + camY;
      const dist = Math.sqrt(Math.pow(screenX - clickX, 2) + Math.pow(screenY - clickY, 2));
      if (dist < 30) {
        setSelectedPlayerId(other._id);
      }
    });
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let renderFrame: number;
    const draw = () => {
      const width = canvas.width = window.innerWidth;
      const height = canvas.height = window.innerHeight - 80;
      const camX = width / 2 - pos.x;
      const camY = height / 2 - pos.y;
      // Region-specific background
      ctx.fillStyle = currentRegionId === "starter_zone" ? "#0f172a" : "#1e3a8a";
      ctx.fillRect(0, 0, width, height);
      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = camX % gridSize; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = camY % gridSize; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      // Draw NPCs
      regionData?.npcs.forEach(npc => {
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(npc.position.x + camX, npc.position.y + camY, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Cairo";
        ctx.textAlign = "center";
        ctx.fillText(npc.name, npc.position.x + camX, npc.position.y + camY - 35);
      });
      // Others
      others.forEach(other => {
        if (other.userId === player?.userId) return;
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.arc(other.position.x + camX, other.position.y + camY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "10px Cairo";
        ctx.textAlign = "center";
        ctx.fillText(other.nickname, other.position.x + camX, other.position.y + camY - 25);
      });
      // Local Player
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
  }, [pos, others, player, currentRegionId, regionData]);
  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full cursor-pointer" 
        onClick={handleCanvasClick}
      />
      <HUD />
      <Joystick onMove={(v) => setVelocity(v)} />
      {nearestNPC && <InteractionUI npc={nearestNPC} />}
      {selectedPlayerId && (
        <SocialCard 
          playerId={selectedPlayerId} 
          onClose={() => setSelectedPlayerId(null)} 
        />
      )}
      {transitioning && (
        <div className="fixed inset-0 bg-black z-[200] animate-in fade-in duration-500" />
      )}
    </div>
  );
}