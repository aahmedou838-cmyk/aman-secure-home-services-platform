import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { Shield, Gamepad2, Sparkles, Map, Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignInForm } from "@/components/SignInForm";
import { GameCanvas } from "@/components/game/GameCanvas";
function GamePortal() {
  const navigate = useNavigate();
  const player = useQuery(api.players.getMe);
  useEffect(() => {
    // If authenticated but no player profile, go to character selection
    if (player === null) {
      navigate("/character-select");
    }
  }, [player, navigate]);
  if (player === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aman-navy">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-aman-teal" />
        </motion.div>
      </div>
    );
  }
  if (player === null) return null; // Redirecting...
  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-slate-900">
      <GameCanvas />
    </div>
  );
}
export function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="w-8 h-8 text-aman-teal animate-pulse" />
      </div>
    );
  }
  if (isAuthenticated) {
    return <GamePortal />;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 text-right"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-aman-teal/10 text-aman-teal rounded-full font-bold text-sm">
              <Gamepad2 className="w-4 h-4" />
              <span>مغامرة جديدة بانتظارك</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-aman-navy leading-tight">
              مدينة الأسرار <br />
              <span className="text-aman-teal">Madinat Al-Asrar</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              استكشف نواكشوط الموازية، حل الألغاز الغامضة، وانضم إلى مجتمع المستكشفين في أول تجربة لعب جماعي حقيقية في موريتانيا.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <Button 
                size="lg" 
                onClick={() => void signIn("anonymous")}
                className="h-16 px-10 rounded-2xl bg-aman-teal text-xl font-black shadow-xl shadow-aman-teal/20 hover:scale-105 transition-transform"
              >
                لعب الآن كضيف
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-16 px-10 rounded-2xl border-2 text-xl font-bold"
              >
                تعرف على المزيد
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-3xl bg-card border shadow-sm">
                <Map className="w-8 h-8 text-aman-teal mb-4" />
                <h3 className="font-bold mb-2">عالم مفتوح</h3>
                <p className="text-xs text-muted-foreground">تصفح مناطق نواكشوط بتفاصيل فنية رائعة.</p>
              </div>
              <div className="p-6 rounded-3xl bg-card border shadow-sm">
                <Users className="w-8 h-8 text-aman-navy mb-4" />
                <h3 className="font-bold mb-2">تفاعل حي</h3>
                <p className="text-xs text-muted-foreground">قابل لاعبين آخرين وشاركهم في حل المهمات.</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-8 rounded-[2.5rem] shadow-2xl border-4 border-aman-teal/20"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-aman-teal rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-aman-teal/30">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-aman-navy">ابدأ رحلتك السرية</h2>
              <p className="text-sm text-muted-foreground mt-2">قم بإنشاء حسابك للدخول إلى المدينة بشكل دائم</p>
            </div>
            <SignInForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}