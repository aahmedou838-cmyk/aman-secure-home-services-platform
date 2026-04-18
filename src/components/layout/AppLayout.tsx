import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, User, Briefcase, Wallet, Shield, Loader2 } from "lucide-react";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
function NavContent() {
  const { pathname } = useLocation();
  const wallet = useQuery(api.wallets.getWallet);
  const navItems = [
    { label: "الرئيسية", path: "/", icon: Home },
    { label: "داشبورد العميل", path: "/client-dashboard", icon: User },
    { label: "داشبورد العامل", path: "/worker-dashboard", icon: Briefcase },
    { label: "الملف الشخصي", path: "/profile", icon: Shield },
  ];
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-aman-teal rounded-lg flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-aman-teal">أمان موريتانيا</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Authenticated>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-aman-teal/10 rounded-full border border-aman-teal/20">
                <Wallet className="w-4 h-4 text-aman-teal" />
                <span className="text-sm font-semibold text-aman-teal">
                  {wallet === undefined ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    `${wallet?.balance?.toFixed(0) ?? "0"} أ.م`
                  )}
                </span>
              </div>
              <Link to="/profile" className="hidden md:flex p-2 hover:bg-muted rounded-full transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <SignOutButton />
            </Authenticated>
            <ThemeToggle className="static" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <Outlet />
          </div>
        </div>
      </main>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t px-4 py-3 pb-safe">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-aman-teal font-bold" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
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