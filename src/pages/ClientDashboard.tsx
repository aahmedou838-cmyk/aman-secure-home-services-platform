import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GpsRadar } from "@/components/GpsRadar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
export default function ClientDashboard() {
  const activeJobs = useQuery(api.jobs.listActiveJobs) ?? [];
  const createJob = useMutation(api.jobs.createJob);
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
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مرحباً بك</h1>
          <p className="text-muted-foreground">تتبع طلباتك الحالية واطلب خدمات جديدة</p>
        </div>
        <Button onClick={handleRequestService} disabled={loading} className="rounded-2xl h-12 px-6 gap-2">
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
            <Card className="border-dashed py-20 text-center">
              <CardContent>
                <p className="text-muted-foreground">لا توجد طلبات نشطة حالياً</p>
              </CardContent>
            </Card>
          ) : (
            activeJobs.map((job) => (
              <Card key={job._id} className="overflow-hidden border-r-4 border-r-aman-teal">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-bold text-aman-teal uppercase tracking-wider">
                          رقم الطلب: {job._id.slice(-6)}
                        </span>
                        <h3 className="text-xl font-bold">{job.serviceType}</h3>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString("ar-SA")}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-aman-teal font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{job.status}</span>
                        </div>
                      </div>
                      {job.quoteAmount && (
                        <div className="p-4 bg-aman-teal/5 rounded-2xl border border-aman-teal/10">
                          <p className="text-sm text-muted-foreground">عرض السعر النهائي:</p>
                          <p className="text-2xl font-bold text-aman-teal">{job.quoteAmount} ر.س</p>
                          <Button size="sm" className="mt-3 w-full rounded-xl">الموافقة والدفع</Button>
                        </div>
                      )}
                    </div>
                    {job.status === "en_route" && (
                      <div className="flex-shrink-0 w-full md:w-64">
                         <GpsRadar status="الفني في الطريق" isArrived={false} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        {/* Quick Stats / Sidebar */}
        <div className="space-y-6">
          <Card className="bg-aman-navy text-white rounded-[2rem] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                محفظتك الرقمية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold">0.00 <span className="text-lg font-normal opacity-70">ر.س</span></div>
              <Button className="w-full bg-white text-aman-navy hover:bg-white/90 rounded-xl">شحن الرصيد</Button>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-lg">لماذا تختار أمان؟</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-aman-teal flex-shrink-0" />
                <p>جميع الفنيين يخضعون لفحص أمني دقيق.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-aman-teal flex-shrink-0" />
                <p>ضمان لمدة 30 يوم على جودة العمل.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}