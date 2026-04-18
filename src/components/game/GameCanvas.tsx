import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
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
  const [transitioning] = useState(false);
  // Sync initial player position
  useEffect(() => {
    if (player) {
      setPos(player.position);
    }
  }, [player]);
  // Movement loop
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
  // Position updates to backend (throttled)
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.abs(velocity.x) > 0 || Math.abs(velocity.y) > 0) {
        updatePos({ x: pos.x, y: pos.y, zoneId: currentRegionId }).catch(console.error);
      }
    }, 200); // 5Hz update rate is enough for sync
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
  // Stable Canvas Resize Handler
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
  // Render Loop
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
      // Clear/Background
      ctx.fillStyle = currentRegionId === "starter_zone" ? "#0f172a" : "#1e3a8a";
      ctx.fillRect(0, 0, width, height);
      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      const gridSize = 100;
      const startX = camX % gridSize;
      const startY = camY % gridSize;
      for (let x = startX; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = startY; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      // Draw NPCs
      regionData?.npcs.forEach(npc => {
        const nx = npc.position.x + camX;
        const ny = npc.position.y + camY;
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(nx, ny, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Cairo";
        ctx.textAlign = "center";
        ctx.fillText(npc.name, nx, ny - 35);
      });
      // Others
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
      // Local Player (Always Center)
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
  }, [pos, others, player?.userId, currentRegionId, regionData]);
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const { width, height } = canvas;
    const camX = width / 2 - pos.x;
    const camY = height / 2 - pos.y;
    others.forEach(other => {
      if (other.userId === player?.userId) return;
      const sx = other.position.x + camX;
      const sy = other.position.y + camY;
      const dist = Math.sqrt(Math.pow(sx - clickX, 2) + Math.pow(sy - clickY, 2));
      if (dist < 30) {
        setSelectedPlayerId(other._id);
      }
    });
  };
  return (
    <div className="w-full h-full relative touch-none select-none">
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />
      <HUD />
      <Joystick onMove={setVelocity} />
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