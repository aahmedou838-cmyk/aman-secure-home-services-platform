import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, MapPin, Send, ShieldAlert, ToggleRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
export default function WorkerDashboard() {
  const triggerSOS = useMutation(api.sos.triggerSOS);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const handleSOS = async () => {
    if (confirm("هل أنت متأكد من تفعيل نداء الاستغاثة؟ سيتم إخطار مركز العمليات فوراً.")) {
      setSosTriggered(true);
      try {
        await triggerSOS({ lat: 24.7136, lng: 46.6753 });
        toast.error("تم إرسال نداء الاستغاثة بنجاح. ابق في مكان آمن.");
      } catch (e) {
        toast.error("فشل إرسال الاستغاثة. يرجى الاتصال بالطوارئ.");
      }
    }
  };
  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {sosTriggered && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[100] bg-red-600/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6 text-center"
          >
            <ShieldAlert className="w-32 h-32 mb-8 animate-sos-pulse" />
            <h1 className="text-5xl font-bold mb-4">تم تفعيل SOS</h1>
            <p className="text-2xl opacity-90 mb-12">فريق الطوارئ في طريقه إليك الآن. لا تغلق هذه الصفحة.</p>
            <Button 
              variant="outline" 
              className="bg-white text-red-600 hover:bg-white/90 border-none px-12 h-16 text-xl rounded-2xl"
              onClick={() => setSosTriggered(false)}
            >
              إلغاء الاستغاثة (تم حل المشكلة)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الفني</h1>
          <p className="text-muted-foreground">أهلاً بك يا أحمد. حافظ على سلامتك دائماً.</p>
        </div>
        <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border shadow-sm w-full md:w-auto">
          <div className="flex-1 md:flex-initial">
             <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-tighter">مشاركة الموقع</p>
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${locationSharing ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-bold">{locationSharing ? 'نشط' : 'متوقف'}</span>
             </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocationSharing(!locationSharing)}
            className={locationSharing ? 'text-aman-teal' : 'text-muted-foreground'}
          >
            <ToggleRight className={`w-8 h-8 ${!locationSharing && 'rotate-180'}`} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Urgent SOS Button Container */}
        <Card className="border-4 border-aman-red/20 bg-aman-red/5 rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 bg-aman-red rounded-full flex items-center justify-center text-white shadow-2xl shadow-aman-red/40 animate-sos-pulse">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-aman-red mb-2">نداء استغاثة (SOS)</h2>
              <p className="text-muted-foreground">استخدم هذا الزر فقط في حالات الخطر الشديد أو التهديد الأمني.</p>
            </div>
            <Button 
              variant="destructive" 
              size="lg" 
              className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
              onClick={handleSOS}
            >
              تفعيل الاستغاثة الآن
            </Button>
          </CardContent>
        </Card>
        {/* Active Job Card */}
        <Card className="rounded-[2.5rem] border-aman-teal/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>المهمة الحالية</span>
              <span className="text-xs bg-aman-teal/10 text-aman-teal px-3 py-1 rounded-full">قيد التنفيذ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-muted rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-aman-teal" />
                <span className="font-bold">حي النخيل، الرياض</span>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-aman-teal" />
                <span>عطل مفاجئ في شبكة المياه الرئيسية</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-bold text-muted-foreground">تقديم عرض السعر:</p>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="أدخل المبلغ (ر.س)" 
                  className="flex-1 bg-secondary border-none rounded-xl px-4 focus:ring-2 ring-aman-teal"
                />
                <Button className="rounded-xl bg-aman-teal">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-2xl h-12 border-2">تحديث حالة الوصول</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}