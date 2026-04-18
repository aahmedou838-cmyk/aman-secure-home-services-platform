import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Bell, UserCheck, ChevronLeft, ShieldAlert, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function ProfilePage() {
  const user = useQuery(api.auth.loggedInUser);
  const wallet = useQuery(api.wallets.getWallet);
  const sosAlerts = useQuery(api.sos.getActiveAlerts) ?? [];
  const resolveSOS = useMutation(api.sos.resolveSOS);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
      toast.success("تم تحديث حالة التوثيق بنجاح");
    }, 2000);
  };
  const handleResolveAlert = async (id: any) => {
    try {
      await resolveSOS({ alertId: id });
      toast.success("تم إغلاق البلاغ بنجاح");
    } catch (e) {
      toast.error("فشل إغلاق البلاغ");
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>
        <SignOutButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-none bg-aman-teal text-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16" />
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                <UserCheck className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.name || user?.email?.split('@')[0]}</h2>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${isVerified ? 'bg-white/20' : 'bg-destructive/20'} rounded-full text-xs font-bold mt-2`}>
                  <Shield className="w-3 h-3" />
                  {isVerified ? "هوية موثقة (أمان)" : "بانتظار التوثيق"}
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
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-aman-amber/5 border-aman-amber/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-aman-amber">
                <AlertTriangle className="w-4 h-4" />
                نظام المخالفات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs">المستوى الحالي:</span>
                <span className="text-xs font-bold bg-aman-amber/20 px-2 py-0.5 rounded">آمن (1/5)</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                أي مخالفة قادمة ستؤدي لخصم 50 ر.س فورياً من المحفظة وتجميد الحساب مؤقتاً.
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Settings & Operation Center */}
        <div className="md:col-span-2 space-y-6">
          {/* Operation Center (Demo Access) */}
          <Card className="rounded-[2rem] border-4 border-aman-red/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-aman-red/5">
              <CardTitle className="text-lg flex items-center gap-2 text-aman-red">
                <ShieldAlert className="w-5 h-5" />
                مركز العمليات (SOS)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {sosAlerts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
                  لا توجد استغاثات نشطة حالياً. جميع الفنيين والعملاء في أمان.
                </div>
              ) : (
                <div className="space-y-4">
                  {sosAlerts.map(alert => (
                    <div key={alert._id} className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-red-700 text-sm">نداء استغاثة نشط</p>
                        <p className="text-[10px] text-red-600">التوقيت: {new Date(alert.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <Button size="sm" onClick={() => handleResolveAlert(alert._id)} className="bg-red-600 hover:bg-red-700 rounded-xl">إغلاق وتأمين</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-aman-teal" />
                إعدادات الأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold">التوثيق البيومتري</p>
                  <p className="text-xs text-muted-foreground">استخدام FaceID عند فتح المحفظة.</p>
                </div>
                <Switch checked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold">حالة الحساب</p>
                  <p className="text-xs text-muted-foreground">تحديث بيانات الهوية الشخصية.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleVerify} disabled={verifying} className="text-aman-teal font-bold gap-2">
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "تحديث"}
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-aman-teal" />
                الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold">تنبيهات الموقع</p>
                  <p className="text-xs text-muted-foreground">استلام إشعار عند دخول الفني لنطاق 50 متر.</p>
                </div>
                <Switch checked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}