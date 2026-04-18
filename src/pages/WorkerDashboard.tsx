import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, MapPin, Send, ShieldAlert, ToggleRight, CheckCircle, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
export default function WorkerDashboard() {
  const triggerSOS = useMutation(api.sos.triggerSOS);
  const availableJobs = useQuery(api.jobs.listAvailableJobs) ?? [];
  const myJobs = useQuery(api.jobs.listWorkerJobs) ?? [];
  const acceptJob = useMutation(api.jobs.acceptJob);
  const updateStatus = useMutation(api.jobs.updateJobStatus);
  const submitQuote = useMutation(api.jobs.submitQuote);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const currentJob = myJobs[0]; // Logic assumes one active job at a time for MVP
  const handleSOS = async () => {
    if (confirm("هل أنت متأكد من تفعيل نداء الاستغاثة؟ سيتم إخطار مركز العمليات فوراً.")) {
      setSosTriggered(true);
      try {
        await triggerSOS({ 
          jobId: currentJob?._id,
          lat: 24.7136, 
          lng: 46.6753 
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
  const handleStatusUpdate = async (jobId: any, status: "arrived" | "inspection_complete" | "in_progress" | "completed") => {
    try {
      await updateStatus({ jobId, status });
      toast.success(`تم تحديث الحالة إلى: ${status}`);
    } catch (e) {
      toast.error("فشل تحديث الحالة");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-8 relative">
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
                className="bg-white text-red-600 hover:bg-white/90 border-none px-12 h-16 text-xl rounded-2xl font-bold"
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
            <div className="flex-1 md:flex-initial px-2">
               <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-tighter">مشاركة الموقع (GPS)</p>
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${locationSharing ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm font-bold">{locationSharing ? 'نشط (10s)' : 'متوقف'}</span>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full md:w-[400px]">
            <TabsTrigger value="available" className="rounded-xl h-12 flex-1 text-base font-bold">مهام متاحة</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl h-12 flex-1 text-base font-bold">مهمتي الحالية</TabsTrigger>
          </TabsList>
          <TabsContent value="available" className="space-y-4">
            {availableJobs.length === 0 ? (
              <Card className="rounded-[2.5rem] border-dashed py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Briefcase className="w-12 h-12 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">لا توجد طلبات معاينة جديدة في منطقتك حالياً</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableJobs.map((job) => (
                  <Card key={job._id} className="rounded-[2rem] border-aman-teal/10 overflow-hidden hover:shadow-lg transition-all">
                    <CardHeader className="bg-aman-teal/5 pb-4">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-aman-teal text-white px-2 py-1 rounded">معاينة فورية</span>
                        <span className="text-xs text-muted-foreground font-bold">{new Date(job.createdAt).toLocaleTimeString("ar-SA")}</span>
                      </div>
                      <CardTitle className="text-xl font-bold mt-2">{job.serviceType}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 text-aman-teal" />
                        <span>حي النخيل (على بعد 2.4 كم)</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-xl">
                        <span className="text-xs">رسوم المعاينة:</span>
                        <span className="font-bold text-aman-teal">{job.inspectionFee} ر.س</span>
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
                {/* Active Job Controls */}
                <Card className="rounded-[2.5rem] border-aman-teal/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-aman-teal" />
                        <span>تفاصيل المهمة</span>
                      </div>
                      <span className="text-[10px] font-bold bg-aman-teal/10 text-aman-teal px-3 py-1 rounded-full uppercase tracking-tighter">
                        {currentJob.status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-6 bg-muted rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-aman-teal" />
                        <span className="font-bold">حي النخيل، الرياض</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-aman-teal" />
                        <span>{currentJob.serviceType}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        disabled={currentJob.status !== "en_route"}
                        onClick={() => handleStatusUpdate(currentJob._id, "arrived")}
                        variant={currentJob.status === "en_route" ? "default" : "outline"}
                        className="rounded-xl h-12"
                      >
                        تأكيد الوصول
                      </Button>
                      <Button 
                        disabled={currentJob.status !== "arrived"}
                        onClick={() => handleStatusUpdate(currentJob._id, "inspection_complete")}
                        variant={currentJob.status === "arrived" ? "default" : "outline"}
                        className="rounded-xl h-12"
                      >
                        إنهاء المعاينة
                      </Button>
                    </div>
                    {(currentJob.status === "inspection_complete" || currentJob.status === "quote_pending") && (
                      <div className="space-y-3 pt-4 border-t">
                        <p className="text-sm font-bold text-muted-foreground">تقديم عرض السعر النهائي:</p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={quoteAmount}
                            onChange={(e) => setQuoteAmount(e.target.value)}
                            placeholder="المبلغ (ر.س)"
                            className="flex-1 bg-secondary border-none rounded-xl px-4 focus:ring-2 ring-aman-teal h-12"
                          />
                          <Button onClick={handleSubmitQuote} className="rounded-xl bg-aman-teal w-12 h-12 flex items-center justify-center p-0">
                            <Send className="w-5 h-5" />
                          </Button>
                        </div>
                        {currentJob.status === "quote_pending" && (
                          <p className="text-[10px] text-aman-amber font-bold animate-pulse text-center">بانتظار موافقة العميل على {currentJob.quoteAmount} ر.س</p>
                        )}
                      </div>
                    )}
                    {currentJob.status === "approved" && (
                      <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-bold">وافق العميل! ابدأ العمل الآن.</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* SOS Safety Card */}
                <Card className="border-4 border-aman-red/20 bg-aman-red/5 rounded-[2.5rem] overflow-hidden shadow-lg">
                  <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-aman-red rounded-full flex items-center justify-center text-white shadow-2xl shadow-aman-red/40 animate-sos-pulse">
                      <ShieldAlert className="w-12 h-12" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-aman-red mb-2">نداء استغاثة (SOS)</h2>
                      <p className="text-muted-foreground text-sm">استخدم هذا الزر فقط في حالات الخطر الشديد أو التهديد الأمني. سيتم إرسال موقعك فوراً للشرطة ومركز العمليات.</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg hover:bg-aman-red/90"
                      onClick={handleSOS}
                    >
                      تفعيل الاستغاثة الآن
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="rounded-[2.5rem] border-dashed py-20 text-center">
                <p className="text-muted-foreground">لا توجد مهمة نشطة حالياً. اذهب لتبويب "مهام متاحة" للبدء.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}