import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { GpsRadar } from "@/components/GpsRadar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Clock, CheckCircle2, Wallet, Shield, AlertCircle, MapPin, Zap, Droplet, Paintbrush, Home, UserRound, Truck, Settings2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { WalletTopUp } from "@/components/WalletTopUp";
import { JobHistory } from "@/components/JobHistory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const CATEGORIES = [
  { label: 'الكهرباء', value: 'الكهرباء', icon: Zap },
  { label: 'السباكة', value: 'السباكة', icon: Droplet },
  { label: 'الصباغة', value: 'الصباغة', icon: Paintbrush },
  { label: 'تنظيف المنازل', value: 'تنظيف المنازل', icon: Home },
  { label: 'العمل في المنازل', value: 'العمل في المنازل', icon: UserRound },
  { label: 'سائق', value: 'سائق', icon: Truck },
  { label: 'الخدمات العامة', value: 'الخدمات العامة', icon: Settings2 },
];
export default function ClientDashboard() {
  const activeJobs = useQuery(api.jobs.listActiveJobs) ?? [];
  const historyJobs = useQuery(api.jobs.listHistoryJobs, { role: "client" }) ?? [];
  const wallet = useQuery(api.wallets.getWallet);
  const user = useQuery(api.profiles.currentUser);
  const createJob = useMutation(api.jobs.createJob);
  const approveQuote = useMutation(api.jobs.approveQuote);
  const ensureWallet = useMutation(api.wallets.ensureWallet);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  useEffect(() => {
    if (user && wallet === null) {
      ensureWallet();
    }
  }, [user, wallet, ensureWallet]);
  const handleRequestService = async () => {
    if (!selectedCategory) {
      toast.error("يرجى اختيار نوع الخدمة أولاً");
      return;
    }
    if (!wallet || wallet.balance < 200) {
      toast.error("رصيدك لا يكفي لرسوم المعاينة (200 أ.م)");
      return;
    }
    setLoading(true);
    const id = toast.loading("جاري فحص حالة الأمان وإرسال الطلب...");
    try {
      await createJob({
        serviceType: selectedCategory,
        specialtiesRequired: [selectedCategory],
        inspectionFee: 200,
      });
      toast.success(`تم إرسال طلب ${selectedCategory} لخبراء نواكشوط المعتمدين`, { 
        id,
        description: "سيتم إخبارك فور قبول المهمة من أحد الفنيين"
      });
      setSelectedCategory("");
    } catch (error: any) {
      toast.error(error.message || "فشل في طلب الخدمة", { id });
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
  const calculateDistance = (workerLocation?: { lat: number, lng: number }) => {
    if (!workerLocation) return 500;
    const clientLoc = { lat: 18.0735, lng: -15.9582 };
    const dLat = Math.abs(clientLoc.lat - workerLocation.lat);
    const dLng = Math.abs(clientLoc.lng - workerLocation.lng);
    return Math.round((dLat + dLng) * 111139);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-rtl">
            <h1 className="text-3xl font-bold">خدمات منزلية آمنة</h1>
            <p className="text-muted-foreground">اطلب خبيراً موثوقاً لمعاينة منزلك في دقائق</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
               <SelectTrigger className="w-full sm:w-[240px] h-12 rounded-xl bg-muted border-none font-bold text-rtl">
                 <SelectValue placeholder="اختر نوع الخدمة" />
               </SelectTrigger>
               <SelectContent className="rounded-xl border-none shadow-xl text-rtl" dir="rtl">
                 {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="font-bold py-3">
                      <div className="flex items-center gap-3">
                        <cat.icon className="w-4 h-4 text-aman-teal" />
                        {cat.label}
                      </div>
                    </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <Button
                onClick={handleRequestService}
                disabled={loading || !selectedCategory || (wallet?.balance ?? 0) < 200}
                className="w-full sm:w-auto rounded-xl h-12 px-8 gap-2 bg-aman-teal hover:bg-aman-teal/90 active:scale-95 transition-transform shadow-lg shadow-aman-teal/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                طلب الخدمة (200 أ.م)
             </Button>
          </div>
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
                  <Card className="border-dashed py-24 text-center rounded-[2.5rem] bg-muted/20">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-bold">ابدأ بطلب أول خدمة لمنزلك اليوم</p>
                  </Card>
                ) : (
                  activeJobs.map((job) => (
                    <Card key={job._id} className="overflow-hidden border-none rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                          <div className="flex-1 space-y-6 text-rtl">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold text-aman-teal bg-aman-teal/10 px-2 py-1 rounded uppercase">طلب رقم {job._id.slice(-6)}</span>
                                <h3 className="text-2xl font-bold mt-2">{job.serviceType}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-aman-teal animate-pulse" />
                                <span className="text-sm font-bold text-aman-teal">{job.status}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{new Date(job.createdAt).toLocaleDateString("ar-MR")}</span></div>
                              <div className="flex items-center gap-2"><Shield className="w-4 h-4" /><span>خدمة مؤمنة</span></div>
                            </div>
                            {job.status === "quote_pending" && job.quoteAmount && (
                              <div className="p-6 bg-aman-navy/5 rounded-2xl border-2 border-aman-navy/10 space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-muted-foreground">عرض السعر النهائي:</span>
                                  <span className="text-3xl font-bold text-aman-navy">{job.quoteAmount} أ.م</span>
                                </div>
                                <Button onClick={() => handleApproveQuote(job._id, job.quoteAmount!)} className="w-full h-12 rounded-xl bg-aman-teal shadow-lg shadow-aman-teal/20">
                                  الموافقة والدفع من المحفظة
                                </Button>
                              </div>
                            )}
                            {job.workerLocation && (
                              <div className="flex items-center gap-3 text-xs text-aman-teal bg-aman-teal/5 p-4 rounded-xl border border-aman-teal/10">
                                <MapPin className="w-5 h-5" />
                                <span className="font-bold">الفني يقترب منك الآن في أحياء نواكشوط</span>
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
            <Card className="bg-aman-navy text-white rounded-[2.5rem] overflow-hidden border-none shadow-xl">
              <CardHeader className="pb-0"><CardTitle className="text-lg flex items-center gap-2 text-rtl"><Wallet className="w-5 h-5 text-aman-teal" />رصيدك الحالي</CardTitle></CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="text-5xl font-bold text-rtl">{wallet?.balance?.toFixed(0) ?? "0"} <span className="text-xl opacity-60">أ.م</span></div>
                <WalletTopUp />
              </CardContent>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-muted/30">
              <CardHeader><CardTitle className="text-lg font-bold text-rtl">نظام حماية أمان</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground text-rtl">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-aman-teal/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-aman-teal" />
                  </div>
                  <p className="pt-1">تأمين شامل على جميع الخدمات ضد التلفيات بحد أقصى 20,000 أ.م.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-aman-teal/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-aman-teal" />
                  </div>
                  <p className="pt-1">فنيون معتمدون ومفحوصون أمنياً لضمان سلامة منزلك.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}