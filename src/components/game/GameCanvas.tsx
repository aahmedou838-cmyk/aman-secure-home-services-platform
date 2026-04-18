import React, { useRef, useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Joystick } from "./Joystick";
import { HUD } from "./HUD";
import { WORLD_DATA, NPC } from "@/lib/gameConstants";
import { InteractionUI } from "./InteractionUI";
export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = useQuery(api.players.getMe);
  const rawOthers = useQuery(api.players.getActivePlayers, { zoneId: "starter_zone" });
  const others = useMemo(() => rawOthers ?? [], [rawOthers]);
  const updatePos = useMutation(api.players.updatePosition);
  const [pos, setPos] = useState({ x: 500, y: 500 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [nearestNPC, setNearestNPC] = useState<NPC | null>(null);
  useEffect(() => {
    if (player) setPos(player.position);
  }, [player]);
  useEffect(() => {
    let frameId: number;
    const move = () => {
      setPos(prev => ({
        x: Math.max(0, Math.min(2000, prev.x + velocity.x * 5)),
        y: Math.max(0, Math.min(2000, prev.y + velocity.y * 5))
      }));
      frameId = requestAnimationFrame(move);
    };
    frameId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frameId);
  }, [velocity]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.abs(velocity.x) > 0 || Math.abs(velocity.y) > 0) {
        updatePos({ x: pos.x, y: pos.y, zoneId: "starter_zone" }).catch(console.error);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [pos, velocity, updatePos]);
  // Interaction detection
  useEffect(() => {
    const npcs = WORLD_DATA.starter_zone.npcs;
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
  }, [pos]);
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
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);
      // Grid
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = camX % gridSize; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = camY % gridSize; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      // Draw NPCs
      WORLD_DATA.starter_zone.npcs.forEach(npc => {
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(npc.position.x + camX, npc.position.y + camY, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Cairo";
        ctx.textAlign = "center";
        ctx.fillText(npc.name, npc.position.x + camX, npc.position.y + camY - 30);
      });
      // Others
      others.forEach(other => {
        if (other.userId === player?.userId) return;
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.arc(other.position.x + camX, other.position.y + camY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "10px Cairo";
        ctx.textAlign = "center";
        ctx.fillText(other.nickname, other.position.x + camX, other.position.y + camY - 20);
      });
      // Local Player
      ctx.fillStyle = "#0f766e";
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.stroke();
      renderFrame = requestAnimationFrame(draw);
    };
    renderFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(renderFrame);
  }, [pos, others, player]);
  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <HUD />
      <Joystick onMove={(v) => setVelocity(v)} />
      {nearestNPC && <InteractionUI npc={nearestNPC} />}
    </div>
  );
}