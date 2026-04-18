import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, Phone, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
const SPECIALTIES = [
  'الكهرباء',
  'السباكة',
  'الصباغة',
  'تنظيف المنازل',
  'العمل في المنازل',
  'سائق',
  'الخدمات العامة'
];
export function ProviderRegistration({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const becomeProvider = useMutation(api.users.becomeProvider);
  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };
  const handleComplete = async () => {
    if (!phone) return toast.error("يرجى إدخال رقم الهاتف");
    if (selectedSpecialties.length === 0) return toast.error("يرجى اختيار تخصص واحد على الأقل");
    setLoading(true);
    try {
      await becomeProvider({ phone, specialties: selectedSpecialties });
      toast.success("تم التسجيل كمزود خدمة - ابدأ قبول المهام");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "فشل التسجيل");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none" dir="rtl">
        <div className="bg-aman-teal p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" />
              انضم كفني معتمد
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-2">
              أكمل بياناتك المهنية لتبدأ استقبال طلبات الصيانة في أحياء نواكشوط.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-aman-teal' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-aman-teal' : 'bg-muted'}`} />
          </div>
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف (نواكشوط)
              </label>
              <Input 
                placeholder="22 33 44 55"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 rounded-xl text-lg font-bold bg-muted/50 border-none focus-visible:ring-aman-teal"
              />
              <p className="text-xs text-muted-foreground">سنستخدم هذا الرقم للتواصل معك بخصوص المهام الطارئة.</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <label className="text-sm font-bold text-muted-foreground">اختر تخصصاتك المهنية:</label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALTIES.map(s => {
                  const active = selectedSpecialties.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSpecialty(s)}
                      className={`p-3 text-sm font-bold rounded-xl border-2 transition-all text-right flex items-center justify-between ${
                        active 
                          ? 'border-aman-teal bg-aman-teal/5 text-aman-teal' 
                          : 'border-muted bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      {s}
                      {active && <CheckCircle className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="p-8 bg-muted/30 flex-row gap-4">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl h-12 flex-1">
              السابق
            </Button>
          )}
          <Button 
            onClick={step === 1 ? () => setStep(2) : handleComplete}
            disabled={loading}
            className="rounded-xl h-12 flex-1 bg-aman-teal hover:bg-aman-teal/90"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="flex items-center gap-2">
                {step === 1 ? "التالي" : "تأكيد التسجيل"}
                {step === 1 ? <ChevronLeft className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}