import React, { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, MapPin, Send, ShieldAlert, ToggleRight, Briefcase, Wallet, TrendingUp, History, PieChart, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { JobHistory } from "@/components/JobHistory";
export default function WorkerDashboard() {
  const triggerSOS = useMutation(api.sos.triggerSOS);
  const availableJobs = useQuery(api.jobs.listAvailableJobs) ?? [];
  const myJobs = useQuery(api.jobs.listWorkerJobs) ?? [];
  const historyJobsRaw = useQuery(api.jobs.listHistoryJobs, { role: "worker" });
  const historyJobs = useMemo(() => historyJobsRaw ?? [], [historyJobsRaw]);
  const wallet = useQuery(api.wallets.getWallet);
  const transactionsRaw = useQuery(api.wallets.getTransactions);
  const transactions = useMemo(() => transactionsRaw ?? [], [transactionsRaw]);
  const acceptJob = useMutation(api.jobs.acceptJob);
  const updateStatus = useMutation(api.jobs.updateJobStatus);
  const completeJob = useMutation(api.jobs.completeJob);
  const submitQuote = useMutation(api.jobs.submitQuote);
  const updateLocation = useMutation(api.jobs.updateWorkerLocation);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const currentJob = myJobs[0];
  // GPS Nouakchott Heartbeat Simulation (Smart Refresh Rate: 10s)
  useEffect(() => {
    if (!currentJob || currentJob.status !== "en_route" || !locationSharing) return;
    const interval = setInterval(() => {
      const newLat = (currentJob.workerLocation?.lat ?? 18.0735) + (Math.random() - 0.5) * 0.001;
      const newLng = (currentJob.workerLocation?.lng ?? -15.9582) + (Math.random() - 0.5) * 0.001;
      updateLocation({
        jobId: currentJob._id,
        lat: newLat,
        lng: newLng,
      }).catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentJob?._id, currentJob?.status, currentJob?.workerLocation, locationSharing, updateLocation]);
  const analytics = useMemo(() => {
    const totalEarned = historyJobs.reduce((acc, job) => acc + (job.quoteAmount ?? 0), 0);
    const totalCommission = transactions
      .filter(t => t.type === "commission" && t.description.includes("15%"))
      .reduce((acc, t) => acc + t.amount, 0);
    const totalInsurance = transactions
      .filter(t => t.type === "commission" && t.description.includes("2%"))
      .reduce((acc, t) => acc + t.amount, 0);
    return { totalEarned, totalCommission, totalInsurance };
  }, [historyJobs, transactions]);
  const handleSOS = async () => {
    if (confirm("هل أنت متأكد من تفعيل نداء الاستغاثة؟ سيتم إخطار مركز العمليات بنواكشوط فوراً.")) {
      setSosTriggered(true);
      try {
        await triggerSOS({
          jobId: currentJob?._id,
          lat: currentJob?.workerLocation?.lat ?? 18.0735,
          lng: currentJob?.workerLocation?.lng ?? -15.9582
        });
        toast.error("تم إرسال نداء الاستغاثة بنجاح. ابق في مكان آمن.");
      } catch (e) {
        toast.error("فشل إرسال الاستغاثة. يرجى الاتصال بالطوارئ.");
      }
    }
  };
  const handleAccept = async (jobId: any) => {
    try {
      await acceptJob({ jobId });
      toast.success("تم قبول المهمة. توجه لموقع العميل الآن.");
      setActiveTab("active");
    } catch (e) {
      toast.error("فشل قبول المهمة");
    }
  };
  const handleStatusUpdate = async (jobId: any, status: any) => {
    try {
      await updateStatus({ jobId, status });
      toast.success(`تم تحديث الحالة`);
    } catch (e) {
      toast.error("فشل تحديث الحالة");
    }
  };
  const handleFinish = async (jobId: any) => {
    try {
      await completeJob({ jobId });
      toast.success("تم إنهاء العمل وصرف المستحقات لمحفظتك.");
      setActiveTab("history");
    } catch (e: any) {
      toast.error(e.message || "فشل إنهاء العمل");
    }
  };
  const handleSubmitQuote = async () => {
    if (!quoteAmount || isNaN(Number(quoteAmount))) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    try {
      await submitQuote({ jobId: currentJob._id, amount: Number(quoteAmount) });
      toast.success("تم إرسال عرض السعر للعميل");
      setQuoteAmount("");
    } catch (e) {
      toast.error("فشل إرسال عرض السعر");
    }
  };
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${sosTriggered ? 'pointer-events-none overflow-hidden' : ''}`}>
      <div className="py-8 md:py-12 space-y-8 relative">
        <AnimatePresence>
          {sosTriggered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[100] bg-red-600/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6 text-center pointer-events-auto"
            >
              <ShieldAlert className="w-32 h-32 mb-8 animate-sos-pulse" />
              <h1 className="text-5xl font-bold mb-4">تم تفعيل SOS</h1>
              <p className="text-2xl opacity-90 mb-12">فريق الطوارئ في طريقه إليك الآن. لا تغلق هذه الصفحة.</p>
              <Button
                variant="outline"
                className="bg-white text-red-600 hover:bg-white/90 border-none px-12 h-16 text-xl rounded-2xl font-bold"
                onClick={() => setSosTriggered(false)}
              >
                إلغاء الاستغاثة (تم حل المشكلة)
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {currentJob?.penaltyTier && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5" />
            <p className="font-bold">تنبيه: تم تطبيق مخالفة من المستوى {currentJob.penaltyTier} على حسابك.</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-rtl">
            <h1 className="text-3xl font-bold">لوحة تحكم الفني</h1>
            <p className="text-muted-foreground">أهلاً بك - أمان موريتانيا.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-4 bg-aman-navy text-white p-3 px-6 rounded-2xl shadow-lg">
              <Wallet className="w-5 h-5 text-aman-teal" />
              <div>
                <p className="text-[10px] opacity-70 uppercase font-bold">رصيد الأرباح</p>
                <p className="text-lg font-bold">{wallet?.balance?.toFixed(0) ?? "0"} أ.م</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border shadow-sm">
              <div className="pe-2 text-rtl">
                 <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">مشاركة الموقع (GPS)</p>
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
                <ToggleRight className={`w-8 h-8 transition-transform duration-300 ${!locationSharing ? 'rotate-180 opacity-50' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full md:w-[600px] flex overflow-x-auto">
            <TabsTrigger value="available" className="rounded-xl h-12 flex-1 text-sm md:text-base font-bold">مهام متاحة</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl h-12 flex-1 text-sm md:text-base font-bold">المهمة الحالية</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl h-12 flex-1 text-sm md:text-base font-bold">السجل</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl h-12 flex-1 text-sm md:text-base font-bold">الإحصائيات</TabsTrigger>
          </TabsList>
          <TabsContent value="available" className="space-y-4">
            {availableJobs.length === 0 ? (
              <Card className="rounded-[2.5rem] border-dashed py-20 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد طلبات معاينة جديدة حالياً</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableJobs.map((job) => (
                  <Card key={job._id} className="rounded-[2rem] border-aman-teal/10 overflow-hidden hover:shadow-lg transition-all">
                    <CardHeader className="bg-aman-teal/5 pb-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-aman-teal text-white px-2 py-1 rounded">معاينة فورية</span>
                        <span className="text-xs text-muted-foreground font-bold">{new Date(job.createdAt).toLocaleTimeString("ar-MR")}</span>
                      </div>
                      <CardTitle className="text-xl font-bold mt-2">{job.serviceType}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground text-rtl">
                        <MapPin className="w-4 h-4 text-aman-teal" />
                        <span>تفرغ زينة (على بعد 1.2 كم)</span>
                      </div>
                      <Button onClick={() => handleAccept(job._id)} className="w-full rounded-xl bg-aman-teal h-11 font-bold">قبول المهمة</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="active">
            {currentJob ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-aman-teal/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-rtl">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-aman-teal" />
                        <span>تفاصيل المهمة</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 text-rtl">
                    <div className="p-6 bg-muted rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-aman-teal" /><span className="font-bold">موقع العميل: نواكشوط</span></div>
                      <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-aman-teal" /><span>{currentJob.serviceType}</span></div>
                      {currentJob.workerLocation && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <ShieldCheck className="w-4 h-4" />
                          <span>تحديث GPS: {new Date(currentJob.workerLocation.lastUpdated).toLocaleTimeString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button disabled={currentJob.status !== "en_route"} onClick={() => handleStatusUpdate(currentJob._id, "arrived")} className="rounded-xl">تأكيد الوصول</Button>
                      <Button disabled={currentJob.status !== "arrived"} onClick={() => handleStatusUpdate(currentJob._id, "inspection_complete")} className="rounded-xl">إنهاء المعاينة</Button>
                    </div>
                    {currentJob.status === "in_progress" && (
                      <Button onClick={() => handleFinish(currentJob._id)} className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-bold">إنهاء العمل وصرف المستحقات</Button>
                    )}
                    {(currentJob.status === "inspection_complete" || currentJob.status === "quote_pending") && (
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex gap-2">
                          <input type="number" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} placeholder="المبلغ (أ.م)" className="flex-1 bg-secondary rounded-xl px-4 h-12" />
                          <Button onClick={handleSubmitQuote} className="rounded-xl bg-aman-teal w-12 h-12"><Send className="w-5 h-5 rotate-180" /></Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-4 border-aman-red/20 bg-aman-red/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6">
                  <ShieldAlert className="w-12 h-12 text-aman-red animate-sos-pulse" />
                  <h2 className="text-2xl font-bold text-aman-red">SOS</h2>
                  <Button variant="destructive" size="lg" className="w-full h-16 rounded-2xl font-bold" onClick={handleSOS}>تفعيل الاستغاثة الآن</Button>
                </Card>
              </div>
            ) : (
              <Card className="rounded-[2.5rem] border-dashed py-20 text-center">
                <p className="text-muted-foreground">لا توجد مهمة نشطة حالياً.</p>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="history">
            <JobHistory jobs={historyJobs} />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-3xl p-6 bg-aman-teal/5 border-aman-teal/20 text-center">
                  <TrendingUp className="w-8 h-8 text-aman-teal mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-bold">إجمالي الأرباح</p>
                  <p className="text-3xl font-bold text-aman-teal">{analytics.totalEarned.toFixed(0)} أ.م</p>
                </Card>
                <Card className="rounded-3xl p-6 bg-aman-navy/5 border-aman-navy/20 text-center">
                  <PieChart className="w-8 h-8 text-aman-navy mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-bold">عمولات المنصة المدفوعة</p>
                  <p className="text-3xl font-bold text-aman-navy">{analytics.totalCommission.toFixed(0)} أ.م</p>
                </Card>
                <Card className="rounded-3xl p-6 bg-aman-amber/5 border-aman-amber/20 text-center">
                  <ShieldAlert className="w-8 h-8 text-aman-amber mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-bold">صندوق التأمين الشخصي</p>
                  <p className="text-3xl font-bold text-aman-amber">{analytics.totalInsurance.toFixed(0)} أ.م</p>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}