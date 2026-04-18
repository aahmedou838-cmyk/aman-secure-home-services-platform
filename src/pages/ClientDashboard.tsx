import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GpsRadar } from "@/components/GpsRadar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Clock, CheckCircle2, Wallet, Shield, AlertCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { WalletTopUp } from "@/components/WalletTopUp";
import { JobHistory } from "@/components/JobHistory";
export default function ClientDashboard() {
  const activeJobs = useQuery(api.jobs.listActiveJobs) ?? [];
  const historyJobs = useQuery(api.jobs.listHistoryJobs, { role: "client" }) ?? [];
  const wallet = useQuery(api.wallets.getWallet);
  const createJob = useMutation(api.jobs.createJob);
  const approveQuote = useMutation(api.jobs.approveQuote);
  const ensureWallet = useMutation(api.wallets.ensureWallet);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (wallet === null) {
      ensureWallet();
    }
  }, [wallet, ensureWallet]);
  const handleRequestService = async () => {
    if (!wallet || wallet.balance < 50) {
      toast.error("رصيدك لا يكفي لرسوم المعاينة (50 ر.س)");
      return;
    }
    setLoading(true);
    try {
      await createJob({
        serviceType: "سباكة - كشف تسربات",
        inspectionFee: 50,
      });
      toast.success("تم طلب المعاينة بنجاح");
    } catch (error: any) {
      toast.error(error.message || "فشل في طلب الخدمة");
    } finally {
      setLoading(false);
    }
  };
  const handleApproveQuote = async (jobId: any, amount: number) => {
    if (!wallet || wallet.balance < amount) {
      toast.error("رصيدك لا يكفي للموافقة على عرض السعر");
      return;
    }
    try {
      await approveQuote({ jobId });
      toast.success("تمت الموافقة على عرض السعر وبدأ العمل");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الموافقة");
    }
  };
  // Distance helper (Mocked baseline)
  const calculateDistance = (workerLocation?: { lat: number, lng: number }) => {
    if (!workerLocation) return 500;
    // Simple Euclidean distance simulation for web MVP
    const clientLoc = { lat: 24.7136, lng: 46.6753 };
    const dLat = Math.abs(clientLoc.lat - workerLocation.lat);
    const dLng = Math.abs(clientLoc.lng - workerLocation.lng);
    return Math.round((dLat + dLng) * 111139); // Approx meters
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">مرحباً بك</h1>
            <p className="text-muted-foreground">تحكم بطلباتك وأموالك في أمان</p>
          </div>
          <Button onClick={handleRequestService} disabled={loading} className="rounded-2xl h-12 px-6 gap-2 bg-aman-teal hover:bg-aman-teal/90">
            <Plus className="w-5 h-5" />
            طلب خدمة جديدة
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full md:w-[350px]">
                <TabsTrigger value="active" className="rounded-xl h-12 flex-1 font-bold">الطلبات النشطة</TabsTrigger>
                <TabsTrigger value="history" className="rounded-xl h-12 flex-1 font-bold">سجل الخدمات</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-6">
                {activeJobs.length === 0 ? (
                  <Card className="border-dashed py-20 text-center rounded-[2rem]">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد طلبات نشطة حالياً.</p>
                  </Card>
                ) : (
                  activeJobs.map((job) => (
                    <Card key={job._id} className="overflow-hidden border-r-4 border-r-aman-teal rounded-[2rem] shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div>
                              <span className="text-[10px] font-bold text-aman-teal bg-aman-teal/10 px-2 py-0.5 rounded uppercase">رقم {job._id.slice(-6)}</span>
                              <h3 className="text-xl font-bold mt-1">{job.serviceType}</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(job.createdAt).toLocaleDateString("ar-SA")}</span>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-aman-teal animate-pulse" />
                                <span className="font-bold text-aman-teal uppercase tracking-widest text-[10px]">{job.status}</span>
                              </div>
                            </div>
                            {job.status === "quote_pending" && job.quoteAmount && (
                              <div className="p-5 bg-aman-navy/5 rounded-2xl border border-aman-navy/10 space-y-3">
                                <p className="text-3xl font-bold text-aman-navy">{job.quoteAmount} ر.س</p>
                                <Button onClick={() => handleApproveQuote(job._id, job.quoteAmount!)} className="w-full rounded-xl bg-aman-teal">الموافقة وبدء العمل</Button>
                              </div>
                            )}
                            {job.workerLocation && (
                              <div className="flex items-center gap-2 text-xs text-aman-teal bg-aman-teal/5 p-3 rounded-xl border border-aman-teal/10">
                                <MapPin className="w-4 h-4" />
                                <span>موقع الفني محدث الآن: حي النخيل</span>
                              </div>
                            )}
                          </div>
                          {["en_route", "arrived"].includes(job.status) && (
                            <div className="flex-shrink-0 w-full md:w-64">
                              <GpsRadar 
                                status={job.status === "en_route" ? "الفني في الطريق" : "وصل الفني"} 
                                isArrived={job.status === "arrived"} 
                                distance={calculateDistance(job.workerLocation)}
                                lat={job.workerLocation?.lat}
                                lng={job.workerLocation?.lng}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
              <TabsContent value="history">
                <JobHistory jobs={historyJobs} />
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-6">
            <Card className="bg-aman-navy text-white rounded-[2rem] overflow-hidden border-none shadow-xl">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Wallet className="w-5 h-5" />رصيد المحفظة</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">{wallet?.balance?.toFixed(2) ?? "0.00"} ر.س</div>
                <WalletTopUp />
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-none shadow-sm bg-muted/30">
              <CardHeader><CardTitle className="text-lg font-bold">مركز الأمان</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3 items-start"><Shield className="w-5 h-5 text-aman-teal" /><p>الفنيين لدينا معتمدون وخاضعون للتحقق الجنائي.</p></div>
                <div className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-aman-teal" /><p>تأمين شامل ضد الأخطاء المهنية بحد أقصى 5000 ر.س.</p></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}