import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, ReceiptText, Briefcase } from "lucide-react";
interface Job {
  _id: string;
  _creationTime: number;
  serviceType: string;
  status: string;
  quoteAmount?: number;
  inspectionFee: number;
}
export function JobHistory({ jobs }: { jobs: Job[] }) {
  if (!jobs || jobs.length === 0) {
    return (
      <Card className="border-dashed py-20 text-center rounded-[2rem]">
        <History className="w-12 h-12 text-muted-foreground opacity-30 mx-auto mb-4" />
        <p className="text-muted-foreground">لا توجد خدمات منتهية في السجل حالياً.</p>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job._id} className="rounded-[1.5rem] border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className="w-2 bg-aman-teal" />
              <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{job.serviceType}</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      مكتمل
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(job._creationTime).toLocaleDateString("ar-SA")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      <span>رقم الطلب: {job._id.slice(-6)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">إجمالي المدفوع</p>
                    <div className="flex items-center gap-1.5 font-bold text-xl text-aman-navy">
                      <ReceiptText className="w-4 h-4 text-aman-teal opacity-60" />
                      <span>{(job.quoteAmount ?? job.inspectionFee).toFixed(2)} ر.س</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
function History({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}