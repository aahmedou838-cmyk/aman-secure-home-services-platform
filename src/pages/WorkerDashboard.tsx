import React, { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, MapPin, Send, ShieldAlert, ToggleRight, Star, Plus, Trash2, BadgeCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { JobHistory } from "@/components/JobHistory";
import { ProviderRegistration } from "@/components/ProviderRegistration";
import { ListingModal } from "@/components/ListingModal";
import { Badge } from "@/components/ui/badge";
const HIERARCHY = {
  freelance: { label: "خدمات حرة" },
  transport: { label: "نقل وتوصيل" },
  marketplace: { label: "السوق" },
};
export default function WorkerDashboard() {
  const user = useQuery(api.profiles.currentUser);
  const triggerSOS = useMutation(api.sos.triggerSOS);
  const myListings = useQuery(api.listings.getMyListings) ?? [];
  const notifications = useQuery(api.notifications.getUnreadNotifications) ?? [];
  const availableJobs = useQuery(api.jobs.listAvailableJobs, {
    providerSpecialties: user?.specialties ?? []
  }) ?? [];
  const myJobs = useQuery(api.jobs.listWorkerJobs) ?? [];
  const historyJobsRaw = useQuery(api.jobs.listHistoryJobs, { role: "worker" });
  const transactionsRaw = useQuery(api.wallets.getTransactions);
  const acceptJob = useMutation(api.jobs.acceptJob);
  const updateStatus = useMutation(api.jobs.updateJobStatus);
  const completeJob = useMutation(api.jobs.completeJob);
  const submitQuote = useMutation(api.jobs.submitQuote);
  const updateLocation = useMutation(api.jobs.updateWorkerLocation);
  const updateListing = useMutation(api.listings.updateListing);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [showRegModal, setShowRegModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const currentJob = myJobs[0];
  useEffect(() => {
    if (!currentJob || currentJob.status !== "en_route" || !locationSharing) return;
    const interval = setInterval(() => {
      const newLat = (currentJob.workerLocation?.lat ?? 18.0735) + (Math.random() - 0.5) * 0.001;
      const newLng = (currentJob.workerLocation?.lng ?? -15.9582) + (Math.random() - 0.5) * 0.001;
      updateLocation({ jobId: currentJob._id, lat: newLat, lng: newLng }).catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentJob, locationSharing, updateLocation]);
  const analytics = useMemo(() => {
    const history = historyJobsRaw ?? [];
    const txs = transactionsRaw ?? [];
    const totalEarned = history.reduce((acc, job) => acc + (job.quoteAmount ?? 0), 0);
    const totalCommission = txs.filter(t => t.type === "commission").reduce((acc, t) => acc + t.amount, 0);
    return { totalEarned, totalCommission };
  }, [historyJobsRaw, transactionsRaw]);
  const handleAction = async (id: string, promise: Promise<any>) => {
    setSubmitting(id);
    try {
      await promise;
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ ما");
    } finally {
      setSubmitting(null);
    }
  };
  if (user && user.role !== "provider") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-8 text-rtl" dir="rtl">
        <div className="w-24 h-24 bg-aman-teal/10 rounded-3xl flex items-center justify-center mx-auto text-aman-teal">
          <BadgeCheck className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold">انضم لشبكة فنيي أمان</h1>
        <Button size="lg" onClick={() => setShowRegModal(true)} className="rounded-2xl h-16 px-10 text-xl font-bold bg-aman-teal">سجل كفني الآن</Button>
        <ProviderRegistration isOpen={showRegModal} onOpenChange={setShowRegModal} />
      </div>
    );
  }
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${sosTriggered ? 'pointer-events-none' : ''}`} dir="rtl">
      <div className="py-8 md:py-12 space-y-8 relative">
        <AnimatePresence>
          {sosTriggered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-red-600/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6 text-center pointer-events-auto">
              <ShieldAlert className="w-32 h-32 mb-8 animate-sos-pulse" />
              <h1 className="text-5xl font-bold mb-4">تم تفعيل SOS</h1>
              <Button variant="outline" className="bg-white text-red-600 rounded-2xl px-12 h-16" onClick={() => setSosTriggered(false)}>إلغاء</Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-right">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center justify-end gap-3">
               لوحة تحكم الفني <Star className="w-6 h-6 text-aman-amber fill-aman-amber" />
            </h1>
            <p className="text-muted-foreground">{user?.name} - تخصصاتك: {user?.specialties?.join('، ')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => setShowListingModal(true)} className="rounded-2xl h-14 px-6 gap-2 bg-aman-teal shadow-lg shadow-aman-teal/20">
              <Plus className="w-5 h-5" />
              إضافة عرض جديد
            </Button>
            <Button variant="outline" onClick={() => setLocationSharing(!locationSharing)} className="rounded-2xl h-14 px-4 gap-2">
              <ToggleRight className={`w-6 h-6 ${!locationSharing ? 'rotate-180' : ''}`} />
              <span className="font-bold">GPS {locationSharing ? 'نشط' : 'متوقف'}</span>
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-2xl h-14 w-full md:w-[700px] flex overflow-x-auto no-scrollbar">
            <TabsTrigger value="available" className="rounded-xl h-12 flex-1 font-bold relative">
              المهام المتاحة
              {notifications.some(n => n.type === "new_request") && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-aman-red rounded-full border-2 border-background" />
              )}
            </TabsTrigger>
            <TabsTrigger value="listings" className="rounded-xl h-12 flex-1 font-bold">عروضي ({myListings.length})</TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl h-12 flex-1 font-bold">المهمة الحالية</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl h-12 flex-1 font-bold">السجل</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl h-12 flex-1 font-bold">الإحصائيات</TabsTrigger>
          </TabsList>
          <TabsContent value="available" className="space-y-4">
            {availableJobs.length === 0 ? (
              <p className="text-center py-20 opacity-40">لا توجد مهام متاحة لتخصصاتك حالياً</p>
            ) : (
              availableJobs.map((job) => (
                <Card key={job._id} className="rounded-[2rem] border-aman-teal/10 overflow-hidden hover:shadow-lg transition-all p-6 text-right">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-aman-teal text-white">معاينة: {job.inspectionFee} أ.م</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleTimeString("ar-MR")}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{job.serviceType}</h3>
                  <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-6">
                    <span>نواكشوط (تفرغ زينة)</span> <MapPin className="w-4 h-4 text-aman-teal" />
                  </div>
                  <Button 
                    disabled={submitting === job._id}
                    onClick={() => void handleAction(job._id, acceptJob({ jobId: job._id }))} 
                    className="w-full rounded-xl bg-aman-teal h-12 font-bold"
                  >
                    {submitting === job._id ? <Loader2 className="animate-spin" /> : "قبول المهمة"}
                  </Button>
                </Card>
              ))
            )}
          </TabsContent>
          <TabsContent value="listings" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map(listing => (
              <Card key={listing._id} className="rounded-[2rem] p-6 space-y-4 text-right border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">{HIERARCHY[listing.category as keyof typeof HIERARCHY]?.label}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => void updateListing({ id: listing._id, active: false })} className="text-aman-red"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <h3 className="text-lg font-black">{listing.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{listing.description}</p>
                <div className="flex justify-between items-center pt-4 border-t">
                  <Badge className="bg-green-100 text-green-700">نشط</Badge>
                  <span className="text-xl font-black text-aman-navy">{listing.price} أ.م</span>
                </div>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="active">
            {currentJob ? (
               <Card className="rounded-[2.5rem] p-8 text-right space-y-6">
                  <h2 className="text-2xl font-bold">{currentJob.serviceType} - {currentJob.status}</h2>
                  <div className="grid grid-cols-2 gap-4">
                     <Button 
                      disabled={currentJob.status !== "en_route" || !!submitting} 
                      onClick={() => void handleAction('status', updateStatus({ jobId: currentJob._id, status: "arrived" }))} 
                      className="h-12 rounded-xl"
                     >
                       {submitting === 'status' ? <Loader2 className="animate-spin" /> : "تأكيد الوصول"}
                     </Button>
                     <Button 
                      disabled={currentJob.status !== "arrived" || !!submitting} 
                      onClick={() => void handleAction('status', updateStatus({ jobId: currentJob._id, status: "inspection_complete" }))} 
                      className="h-12 rounded-xl"
                     >
                       {submitting === 'status' ? <Loader2 className="animate-spin" /> : "إنهاء المعاينة"}
                     </Button>
                  </div>
                  {(currentJob.status === "inspection_complete" || currentJob.status === "quote_pending") && (
                    <div className="p-4 bg-muted rounded-2xl flex gap-2">
                      <input type="number" value={quoteAmount} onChange={e => setQuoteAmount(e.target.value)} placeholder="المبلغ أ.م" className="flex-1 rounded-xl px-4 h-12 bg-background border-none text-right" />
                      <Button 
                        disabled={!!submitting || !quoteAmount}
                        onClick={() => void handleAction('quote', submitQuote({ jobId: currentJob._id, amount: Number(quoteAmount) }).then(() => setQuoteAmount("")))} 
                        className="bg-aman-teal h-12 w-12 rounded-xl"
                      >
                        {submitting === 'quote' ? <Loader2 className="animate-spin" /> : <Send className="rotate-180" />}
                      </Button>
                    </div>
                  )}
                  {currentJob.status === "approved" && (
                    <Button 
                      disabled={!!submitting}
                      onClick={() => void handleAction('status', completeJob({ jobId: currentJob._id }))} 
                      className="w-full h-14 bg-green-600 rounded-2xl font-bold text-white"
                    >
                      {submitting === 'status' ? <Loader2 className="animate-spin" /> : "إنهاء المهمة"}
                    </Button>
                  )}
                  <Button variant="destructive" className="w-full h-16 rounded-2xl font-bold" onClick={() => setSosTriggered(true)}>SOS</Button>
               </Card>
            ) : <p className="text-center py-20 opacity-40">لا توجد مهمة نشطة</p>}
          </TabsContent>
          <TabsContent value="history">
            <JobHistory jobs={historyJobsRaw ?? []} />
          </TabsContent>
          <TabsContent value="analytics" className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="rounded-3xl p-8 bg-aman-teal/5 text-center">
                <p className="text-sm font-bold opacity-60 mb-2">إجمالي الأرباح</p>
                <p className="text-4xl font-bold text-aman-teal">{analytics.totalEarned} أ.م</p>
             </Card>
             <Card className="rounded-3xl p-8 bg-aman-navy/5 text-center">
                <p className="text-sm font-bold opacity-60 mb-2">العمولات المدفوعة</p>
                <p className="text-4xl font-bold text-aman-navy">{analytics.totalCommission} أ.م</p>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
      <ListingModal isOpen={showListingModal} onOpenChange={setShowListingModal} />
      <ProviderRegistration isOpen={showRegModal} onOpenChange={setShowRegModal} />
    </div>
  );
}