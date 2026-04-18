import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, User, Briefcase, Wallet, Shield, Loader2, BadgeCheck } from "lucide-react";
import { Authenticated, useQuery, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
function NavContent() {
  const { pathname } = useLocation();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const wallet = useQuery(api.wallets.getWallet);
  const user = useQuery(api.profiles.currentUser);
  const navItems = [
    { label: "الرئيسية", path: "/", icon: Home },
    { label: "العميل", path: "/client-dashboard", icon: User },
    { label: "الفني", path: "/worker-dashboard", icon: Briefcase },
    { label: "الملف", path: "/profile", icon: Shield },
  ];
  return (
    <>
      <header className="sticky top-0 z-[60] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-aman-teal rounded-xl flex items-center justify-center text-white shadow-lg shadow-aman-teal/20">
                <Shield className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-black text-aman-teal transition-all hover:tracking-wider">أمان</span>
                <span className="text-xs block text-muted-foreground -mt-1 font-bold animate-pulse">موريتانيا</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-aman-navy text-white rounded-2xl shadow-md border border-white/10">
                  <Wallet className="w-4 h-4 text-aman-teal" />
                  <span className="text-sm font-black whitespace-nowrap">
                    {wallet === undefined ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      `${wallet?.balance?.toFixed(0) ?? "0"} أ.م`
                    )}
                  </span>
                </div>
                {user?.role === "provider" && (
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-aman-teal/20 to-aman-amber/10 rounded-full border border-aman-teal/20 text-aman-teal shadow-inner">
                    <BadgeCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">فني معتمد</span>
                  </div>
                )}
                <Link to="/profile" className="hidden sm:flex w-10 h-10 items-center justify-center bg-muted hover:bg-muted/80 rounded-xl transition-all">
                  <User className="w-5 h-5 text-muted-foreground" />
                </Link>
                <SignOutButton />
              </>
            ) : (
              <div className="flex items-center gap-2">
                 {/* Empty or login prompt handled by Page content but layout stays consistent */}
              </div>
            )}
            <ThemeToggle className="static" />
          </div>
        </div>
      </header>
      <main className="flex-1 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      {/* Responsive Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background/90 backdrop-blur-xl border-t px-6 py-4 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
                  isActive ? "text-aman-teal font-black" : "text-muted-foreground opacity-60"
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-aman-teal/10' : ''}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans" dir="rtl">
      <NavContent />
    </div>
  );
}