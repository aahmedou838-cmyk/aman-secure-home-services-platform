import React, { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, MapPin, Send, ShieldAlert, ToggleRight, Briefcase, Wallet, TrendingUp, PieChart, ShieldCheck, BadgeCheck, Star, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { JobHistory } from "@/components/JobHistory";
import { ProviderRegistration } from "@/components/ProviderRegistration";
import { Badge } from "@/components/ui/badge";
export default function WorkerDashboard() {
  const user = useQuery(api.profiles.currentUser);
  const wallet = useQuery(api.wallets.getWallet);
  const triggerSOS = useMutation(api.sos.triggerSOS);
  const availableJobs = useQuery(api.jobs.listAvailableJobs, {
    providerSpecialties: user?.specialties ?? []
  }) ?? [];
  const myJobs = useQuery(api.jobs.listWorkerJobs) ?? [];
  const historyJobsRaw = useQuery(api.jobs.listHistoryJobs, { role: "worker" });
  const historyJobs = useMemo(() => historyJobsRaw ?? [], [historyJobsRaw]);
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
  const [showRegModal, setShowRegModal] = useState(false);
  const currentJob = myJobs[0];
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
  }, [currentJob, locationSharing, updateLocation]);
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
  // Handle users who are either "client" or newly registered (no role assigned yet)
  if (user && user.role !== "provider") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-8 text-rtl">
        <div className="w-24 h-24 bg-aman-teal/10 rounded-3xl flex items-center justify-center mx-auto text-aman-teal">
          <BadgeCheck className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">انضم لشبكة فنيي أمان</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            هل أنت فني محترف؟ انضم لأكبر منصة خدمات منزلية آمنة في موريتانيا وابدأ استقبال الطلبات في منطقتك.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setShowRegModal(true)}
          className="rounded-2xl h-16 px-10 text-xl font-bold bg-aman-teal hover:bg-aman-teal/90 shadow-xl shadow-aman-teal/20"
        >
          سجل كفني الآن
        </Button>
        <ProviderRegistration isOpen={showRegModal} onOpenChange={setShowRegModal} />
      </div>
    );
  }
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${sosTriggered ? 'pointer-events-none' : ''}`}>
      <div className="py-8 md:py-12 space-y-8 relative">
        <AnimatePresence>
          {sosTriggered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[100] bg-red-600/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6 text-center pointer-events-auto"
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-rtl">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              لوحة تحكم الفني
              <Star className="w-6 h-6 text-aman-amber fill-aman-amber" />
            </h1>
            <p className="text-muted-foreground">أهلاً بك {user?.name} - تخصصاتك: {user?.specialties?.join('، ')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-4 bg-aman-navy text-white p-3 px-6 rounded-2xl shadow-lg">
              <Wallet className="w-5 h-5 text-aman-teal" />
              <div>
                <p className="text-[10px] opacity-70 uppercase font-bold text-rtl">رصيد الأرباح</p>
                <p className="text-lg font-bold">{wallet?.balance?.toFixed(0) ?? "0"} أ.م</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocationSharing(!locationSharing)}
              className={`rounded-2xl h-14 px-4 gap-2 border-2 ${locationSharing ? 'border-green-500/20 text-green-600' : 'border-red-500/20 text-red-600'}`}
            >
              <ToggleRight className={`w-6 h-6 transition-transform ${!locationSharing ? 'rotate-180' : ''}`} />
              <span className="font-bold">GPS {locationSharing ? 'نشط' : 'متوقف'}</span>
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full md:w-[600px] flex overflow-x-auto">
            <TabsTrigger value="available" className="rounded-xl h-12 flex-1 font-bold">مهام متاحة ({availableJobs.length})</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl h-12 flex-1 font-bold">المهمة الحالية</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl h-12 flex-1 font-bold">السجل</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl h-12 flex-1 font-bold">الإحصائيات</TabsTrigger>
          </TabsList>
          <TabsContent value="available" className="space-y-4">
            {availableJobs.length === 0 ? (
              <Card className="rounded-[2.5rem] border-dashed py-20 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد طلبات جديدة تناسب تخصصاتك حالياً</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableJobs.map((job) => (
                  <Card key={job._id} className="rounded-[2rem] border-aman-teal/10 overflow-hidden hover:shadow-lg transition-all">
                    <CardHeader className="bg-aman-teal/5 pb-4">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-aman-teal text-white">معاينة: {job.inspectionFee} أ.م</Badge>
                        {user?.specialties?.includes(job.serviceType) && (
                          <Badge variant="outline" className="border-aman-teal text-aman-teal animate-pulse">
                            يطابق مهاراتك
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-bold">{new Date(job.createdAt).toLocaleTimeString("ar-MR")}</span>
                      </div>
                      <CardTitle className="text-xl font-bold mt-2 text-rtl">{job.serviceType}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground text-rtl">
                        <MapPin className="w-4 h-4 text-aman-teal" />
                        <span>نواكشوط (تفرغ زينة)</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.providerSpecialtiesRequired.map(s => (
                           <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                      <Button onClick={() => acceptJob({ jobId: job._id })} className="w-full rounded-xl bg-aman-teal h-11 font-bold">قبول المهمة</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="active">
            {currentJob ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="rounded-[2.5rem] border-aman-teal/20 shadow-lg overflow-hidden">
                   <div className="bg-aman-teal/10 p-4 border-b border-aman-teal/20 flex items-center justify-between">
                     <span className="font-bold text-aman-teal">الحالة: {currentJob.status}</span>
                     <BadgeCheck className="w-5 h-5 text-aman-teal" />
                   </div>
                   <CardContent className="p-8 space-y-6 text-rtl">
                     <div className="space-y-2">
                       <h2 className="text-2xl font-bold">{currentJob.serviceType}</h2>
                       <p className="text-muted-foreground">رقم الطلب: {currentJob._id.slice(-6)}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       <Button
                         disabled={currentJob.status !== "en_route"}
                         onClick={() => updateStatus({ jobId: currentJob._id, status: "arrived" })}
                         className="rounded-xl h-12"
                       >
                         تأكيد الوصول
                       </Button>
                       <Button
                         disabled={currentJob.status !== "arrived"}
                         onClick={() => updateStatus({ jobId: currentJob._id, status: "inspection_complete" })}
                         className="rounded-xl h-12"
                       >
                         إنهاء المعاينة
                       </Button>
                     </div>
                     {(currentJob.status === "inspection_complete" || currentJob.status === "quote_pending") && (
                       <div className="p-4 bg-muted rounded-2xl space-y-3">
                         <p className="text-sm font-bold">تقديم عرض سعر نهائي:</p>
                         <div className="flex gap-2">
                            <input
                              type="number"
                              value={quoteAmount}
                              onChange={(e) => setQuoteAmount(e.target.value)}
                              placeholder="المبلغ بالأوقية"
                              className="flex-1 rounded-xl px-4 bg-background border-none h-12 font-bold"
                            />
                            <Button
                              onClick={() => {
                                submitQuote({ jobId: currentJob._id, amount: Number(quoteAmount) });
                                setQuoteAmount("");
                              }}
                              className="bg-aman-teal h-12 w-12 rounded-xl"
                            >
                              <Send className="w-5 h-5 rotate-180" />
                            </Button>
                         </div>
                       </div>
                     )}
                     {currentJob.status === "in_progress" && (
                        <Button
                          onClick={() => completeJob({ jobId: currentJob._id })}
                          className="w-full h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-bold"
                        >
                          إنهاء العمل وصرف المستحقات
                        </Button>
                     )}
                   </CardContent>
                 </Card>
                 <Card className="border-4 border-aman-red/20 bg-aman-red/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6">
                    <ShieldAlert className="w-16 h-16 text-aman-red animate-sos-pulse" />
                    <div>
                      <h2 className="text-3xl font-bold text-aman-red">زر الاستغاثة SOS</h2>
                      <p className="text-muted-foreground mt-2">اضغط هنا فقط في حالة الخطر الشديد.</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full h-20 rounded-2xl font-bold text-2xl shadow-xl shadow-aman-red/20 active:scale-95 transition-transform"
                      onClick={async () => {
                        if (confirm("تأكيد إرسال نداء استغاثة؟")) {
                          setSosTriggered(true);
                          await triggerSOS({
                            jobId: currentJob?._id,
                            lat: currentJob?.workerLocation?.lat ?? 18.0735,
                            lng: currentJob?.workerLocation?.lng ?? -15.9582
                          });
                        }
                      }}
                    >
                      تفعيل نداء الاستغاثة
                    </Button>
                 </Card>
               </div>
            ) : (
              <Card className="rounded-[2.5rem] border-dashed py-20 text-center">
                <p className="text-muted-foreground">لا توجد مهمة نشطة حالياً. اقبل مهمة من قائمة المهام المتاحة.</p>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="history">
            <JobHistory jobs={historyJobs} />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-3xl p-8 bg-aman-teal/5 border-aman-teal/20 text-center">
                  <TrendingUp className="w-10 h-10 text-aman-teal mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-bold">إجمالي الأرباح</p>
                  <p className="text-4xl font-bold text-aman-teal">{analytics.totalEarned.toFixed(0)} أ.م</p>
                </Card>
                <Card className="rounded-3xl p-8 bg-aman-navy/5 border-aman-navy/20 text-center">
                  <PieChart className="w-10 h-10 text-aman-navy mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-bold">العمولات المستقطعة</p>
                  <p className="text-4xl font-bold text-aman-navy">{analytics.totalCommission.toFixed(0)} أ.م</p>
                </Card>
                <Card className="rounded-3xl p-8 bg-aman-amber/5 border-aman-amber/20 text-center">
                  <ShieldCheck className="w-10 h-10 text-aman-amber mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-bold">مساهمات التأمين</p>
                  <p className="text-4xl font-bold text-aman-amber">{analytics.totalInsurance.toFixed(0)} أ.م</p>
                </Card>
                <Card className="rounded-3xl p-8 bg-gradient-to-br from-aman-teal to-aman-navy text-white text-center md:col-span-3">
                  <Trophy className="w-12 h-12 text-aman-amber mx-auto mb-4" />
                  <p className="text-lg opacity-80 font-bold">نقاط الثقة والاحترافية</p>
                  <p className="text-5xl font-black">4.8 / 5.0</p>
                </Card>
             </div>
             <Card className="rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 text-rtl">تخصصاتك المعتمدة</h3>
                <div className="flex flex-wrap gap-3">
                  {user?.specialties?.map(s => (
                    <Badge key={s} className="px-6 py-3 rounded-xl text-lg bg-aman-teal/10 text-aman-teal hover:bg-aman-teal/20 transition-colors">
                      {s}
                    </Badge>
                  ))}
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}