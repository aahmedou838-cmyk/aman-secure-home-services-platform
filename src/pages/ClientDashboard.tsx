import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GpsRadar } from "@/components/GpsRadar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, CheckCircle2, Wallet, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
export default function ClientDashboard() {
  const activeJobs = useQuery(api.jobs.listActiveJobs) ?? [];
  const wallet = useQuery(api.wallets.getWallet);
  const createJob = useMutation(api.jobs.createJob);
  const approveQuote = useMutation(api.jobs.approveQuote);
  const [loading, setLoading] = useState(false);
  const handleRequestService = async () => {
    setLoading(true);
    try {
      await createJob({
        serviceType: "سباكة - كشف تسربات",
        inspectionFee: 50,
      });
      toast.success("تم طلب المعاينة بنجاح");
    } catch (error) {
      toast.error("فشل في طلب الخدمة");
    } finally {
      setLoading(false);
    }
  };
  const handleApproveQuote = async (jobId: any) => {
    try {
      await approveQuote({ jobId });
      toast.success("تمت الموافقة على عرض السعر");
    } catch (error) {
      toast.error("حدث خطأ أثناء الموافقة");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">مرحباً بك</h1>
            <p className="text-muted-foreground">تتبع طلباتك الحالية واطلب خدمات جديدة</p>
          </div>
          <Button onClick={handleRequestService} disabled={loading} className="rounded-2xl h-12 px-6 gap-2 bg-aman-teal hover:bg-aman-teal/90">
            <Plus className="w-5 h-5" />
            طلب خدمة جديدة
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Jobs List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-aman-teal" />
              الطلبات النشطة
            </h2>
            {activeJobs.length === 0 ? (
              <Card className="border-dashed py-20 text-center rounded-[2rem]">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">لا توجد طلبات نشطة حالياً. اطلب خدمتك الأولى الآن!</p>
                </CardContent>
              </Card>
            ) : (
              activeJobs.map((job) => (
                <Card key={job._id} className="overflow-hidden border-r-4 border-r-aman-teal rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <span className="text-[10px] font-bold text-aman-teal bg-aman-teal/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            رقم الطلب: {job._id.slice(-6)}
                          </span>
                          <h3 className="text-xl font-bold mt-1">{job.serviceType}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(job.createdAt).toLocaleDateString("ar-SA")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-aman-teal font-bold px-3 py-1 bg-aman-teal/5 rounded-full border border-aman-teal/10">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{job.status === "pending_inspection" ? "بانتظار قبول الفني" : job.status}</span>
                          </div>
                        </div>
                        {job.status === "quote_pending" && job.quoteAmount && (
                          <div className="p-5 bg-aman-navy/5 rounded-2xl border border-aman-navy/10 space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">عرض السعر النهائي المقترح:</p>
                              <p className="text-3xl font-bold text-aman-navy">{job.quoteAmount} <span className="text-sm font-normal">ر.س</span></p>
                            </div>
                            <Button 
                              onClick={() => handleApproveQuote(job._id)} 
                              className="w-full rounded-xl bg-aman-teal hover:bg-aman-teal/90"
                            >
                              الموافقة وبدء العمل
                            </Button>
                          </div>
                        )}
                      </div>
                      {job.status === "en_route" && (
                        <div className="flex-shrink-0 w-full md:w-64">
                          <GpsRadar status="الفني في الطريق" isArrived={false} distance={240} />
                        </div>
                      )}
                      {job.status === "arrived" && (
                        <div className="flex-shrink-0 w-full md:w-64">
                          <GpsRadar status="وصل الفني" isArrived={true} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-aman-navy text-white rounded-[2rem] overflow-hidden border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="w-5 h-5 text-aman-teal" />
                  رصيد المحفظة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">{wallet?.balance.toFixed(2) ?? "0.00"} <span className="text-lg font-normal opacity-70">ر.س</span></div>
                <Button className="w-full bg-white text-aman-navy hover:bg-white/90 rounded-xl font-bold">شحن الرصيد</Button>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-none shadow-sm bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg font-bold">مركز الأمان</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3 items-start">
                  <Shield className="w-5 h-5 text-aman-teal flex-shrink-0" />
                  <p>الفنيين لدينا معتمدون وخاضعون للتحقق الجنائي.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-aman-teal flex-shrink-0" />
                  <p>تأمين شامل ضد الأخطاء المهنية بحد أقصى 5000 ر.س.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}