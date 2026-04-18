import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, CreditCard, Bell, Globe, UserCheck, ChevronLeft } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
export default function ProfilePage() {
  const user = useQuery(api.auth.loggedInUser);
  const wallet = useQuery(api.wallets.getWallet);
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
        <SignOutButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <Card className="md:col-span-1 rounded-[2rem] border-none bg-aman-teal text-white shadow-xl">
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
              <UserCheck className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name || user?.email?.split('@')[0]}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mt-2">
                <Shield className="w-3 h-3" />
                هوية موثقة (أمان)
              </div>
            </div>
            <div className="pt-4 w-full">
              <Separator className="bg-white/10 mb-4" />
              <div className="flex justify-between text-sm px-4">
                <span>رصيد المحفظة:</span>
                <span className="font-bold">{wallet?.balance?.toFixed(2) || "0.00"} ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-aman-teal" />
                إعدادات الأمان والطوارئ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold">مشاركة الموقع التلقائية</p>
                  <p className="text-xs text-muted-foreground">تفعيل GPS بمجرد قبول مهمة عمل.</p>
                </div>
                <Switch checked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold">رمز أمان الطوارئ (PIN)</p>
                  <p className="text-xs text-muted-foreground">رمز سري لإلغاء تنبيهات SOS الخاطئة.</p>
                </div>
                <button className="text-aman-teal text-sm font-bold flex items-center gap-1">
                  تعديل <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-aman-teal" />
                التفضيلات
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold">إشعارات الرسائل</p>
                  <p className="text-xs text-muted-foreground">استلام تنبيهات عند وجود عرض سعر جديد.</p>
                </div>
                <Switch checked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold">لغة التطبيق</p>
                  <p className="text-xs text-muted-foreground">اللغة الحالية: العربية</p>
                </div>
                <button className="text-muted-foreground text-sm font-bold flex items-center gap-1">
                  تغيير <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}