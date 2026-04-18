import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { GpsRadar } from "@/components/GpsRadar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Clock, Shield, AlertCircle, MapPin, Zap, Droplet, Paintbrush, Home, UserRound, Truck, Settings2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { WalletTopUp } from "@/components/WalletTopUp";
import { JobHistory } from "@/components/JobHistory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const CATEGORY_GROUPS = [
  { label: "خدمات منزلية (حرة)", value: "freelance", icon: Zap },
  { label: "نقل وتوصيل", value: "transport", icon: Truck },
  { label: "السوق (شراء/بيع)", value: "marketplace", icon: Search },
];
const SUBS = {
  freelance: [{ label: 'الكهرباء', value: 'الكهرباء', icon: Zap }, { label: 'السباكة', value: 'السباكة', icon: Droplet }, { label: 'الصباغة', value: 'الصباغة', icon: Paintbrush }, { label: 'تنظيف', value: 'تنظيف', icon: Home }],
  transport: [{ label: 'سائق خاص', value: 'سائق خاص', icon: Truck }, { label: 'توصيل', value: 'توصيل', icon: MapPin }],
  marketplace: [{ label: 'أثاث', value: 'أثاث', icon: Home }, { label: 'إلكترونيات', value: 'إلكترونيات', icon: Settings2 }],
};
export default function ClientDashboard() {
  const activeJobs = useQuery(api.jobs.listActiveJobs) ?? [];
  const historyJobs = useQuery(api.jobs.listHistoryJobs, { role: "client" }) ?? [];
  const openRequests = useQuery(api.jobs.listOpenRequests) ?? [];
  const wallet = useQuery(api.wallets.getWallet);
  const user = useQuery(api.profiles.currentUser);
  const createJob = useMutation(api.jobs.createJob);
  const approveQuote = useMutation(api.jobs.approveQuote);
  const [loading, setLoading] = useState(false);
  const [mainCat, setMainCat] = useState<string>("");
  const [subCat, setSubCat] = useState<string>("");
  const handleRequestService = async () => {
    if (!subCat || !mainCat) return toast.error("يرجى اختيار الفئة والتخصص");
    if (!wallet || wallet.balance < 200) return toast.error("رصيدك لا يكفي للمعاينة (200 أ.م)");
    setLoading(true);
    try {
      await createJob({
        serviceType: subCat,
        category: mainCat as any,
        specialtiesRequired: [subCat],
        inspectionFee: 200,
        publicFeed: true,
      });
      toast.success("تم إرسال طلبك المفتوح لمجتمع أمان");
      setSubCat("");
    } catch (e: any) {
      toast.error(e.message || "فشل الطلب");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10 text-rtl" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-aman-navy">خدمات أمان المفتوحة</h1>
          <p className="text-muted-foreground">اطلب أي خدمة أو تصفح العروض المتاحة في السوق</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2 w-full">
            <Select value={mainCat} onValueChange={val => { setMainCat(val); setSubCat(""); }}>
              <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl bg-muted border-none font-bold">
                <SelectValue placeholder="نوع الخدمة" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {CATEGORY_GROUPS.map(g => (
                  <SelectItem key={g.value} value={g.value} className="font-bold">{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-full">
            <Select value={subCat} onValueChange={setSubCat} disabled={!mainCat}>
              <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl bg-muted border-none font-bold">
                <SelectValue placeholder="التخصص" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {mainCat && (SUBS[mainCat as keyof typeof SUBS] || []).map(s => (
                  <SelectItem key={s.value} value={s.value} className="font-bold">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRequestService} disabled={loading || !subCat} className="h-12 px-8 rounded-xl bg-aman-teal">
            {loading ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5 ml-2" />}
            إرسال طلب
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full md:w-[450px]">
              <TabsTrigger value="active" className="rounded-xl h-12 flex-1 font-bold">طلباتي</TabsTrigger>
              <TabsTrigger value="market" className="rounded-xl h-12 flex-1 font-bold">سوق الخدمات</TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl h-12 flex-1 font-bold">السجل</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-6">
              {activeJobs.map(job => (
                <Card key={job._id} className="rounded-[2rem] border-none shadow-sm p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="bg-aman-navy mb-2">{job.status}</Badge>
                      <h3 className="text-2xl font-black">{job.serviceType}</h3>
                    </div>
                    {job.quoteAmount && job.status === "quote_pending" && (
                      <Button onClick={() => approveQuote({ jobId: job._id })} className="bg-aman-teal">موافقة على {job.quoteAmount} أ.م</Button>
                    )}
                  </div>
                  {["en_route", "arrived"].includes(job.status) && (
                    <div className="w-full max-w-[200px] mx-auto"><GpsRadar status={job.status} isArrived={job.status === "arrived"} lat={job.workerLocation?.lat} lng={job.workerLocation?.lng} /></div>
                  )}
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="market" className="space-y-4">
              <h3 className="font-bold text-muted-foreground px-2">آخر الطلبات المفتوحة في نواكشوط:</h3>
              {openRequests.map(req => (
                <Card key={req._id} className="rounded-2xl p-4 border-none shadow-sm flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-aman-teal/10 flex items-center justify-center text-aman-teal"><Clock className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold">{req.serviceType}</p>
                      <p className="text-[10px] opacity-60">منذ {new Date(req.createdAt).toLocaleTimeString("ar-MR")}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-aman-teal text-aman-teal">مفتوح للمزايدة</Badge>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="history"><JobHistory jobs={historyJobs} /></TabsContent>
          </Tabs>
        </div>
        <div className="space-y-6">
          <Card className="bg-aman-navy text-white rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-lg flex items-center gap-2 font-bold"><Wallet className="w-5 h-5 text-aman-teal" /> محفظتك</h3>
            <div className="text-5xl font-black">{wallet?.balance?.toFixed(0) ?? "0"} <span className="text-xl opacity-60">أ.م</span></div>
            <WalletTopUp />
          </Card>
        </div>
      </div>
    </div>
  );
}