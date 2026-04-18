import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ChevronLeft, MapPin, CheckCircle2 } from "lucide-react";
const HIERARCHY = {
  freelance: { label: "خدمات حرة", subs: ["الكهرباء", "السباكة", "الصباغة", "تنظيف المنازل", "العمل في المنازل"] },
  transport: { label: "نقل وتوصيل", subs: ["سائق", "توصيل بضائع"] },
  marketplace: { label: "السوق", subs: ["أغراض منزلية", "سيارات مستعملة", "منتجات زراعية"] },
};
export function ListingModal({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<keyof typeof HIERARCHY | "">("");
  const [subcategory, setSubcategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const createListing = useMutation(api.listings.createListing);
  const handleSubmit = async () => {
    if (!title || !price || !category || !subcategory) return toast.error("يرجى إكمال جميع الحقول");
    const priceVal = Number(price);
    if (priceVal < 50) return toast.error("أقل سعر مسموح به هو 50 أ.م");
    setLoading(true);
    try {
      await createListing({
        category: category as any,
        subcategory,
        title,
        description,
        price: priceVal,
        location: { lat: 18.0735, lng: -15.9582 }, // Defaulting to Nouakchott center
      });
      setSuccess(true);
    } catch (e: any) {
      toast.error(e.message || "فشل النشر");
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setStep(1); 
    setCategory(""); 
    setSubcategory(""); 
    setTitle(""); 
    setDescription(""); 
    setPrice("");
    setSuccess(false);
  };
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none" dir="rtl">
        <div className="bg-aman-navy p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-aman-teal" />
              {success ? "تم النشر بنجاح" : "إضافة عرض جديد للمنصة"}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="p-8 space-y-6">
          {success ? (
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">عرضك مباشر الآن!</h3>
                <p className="text-muted-foreground text-sm">سيتمكن مستخدمو أمان في نواكشوط من رؤية عرضك والتواصل معك فوراً.</p>
              </div>
              <Button onClick={handleClose} className="w-full h-12 rounded-xl bg-aman-teal font-bold">
                الرجوع للوحة التحكم
              </Button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                  <p className="font-bold text-muted-foreground text-right">1. اختر الفئة الرئيسية:</p>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(HIERARCHY).map(([key, val]) => (
                      <Button
                        key={key}
                        variant={category === key ? "default" : "outline"}
                        className={`h-16 rounded-2xl text-lg font-bold flex justify-center items-center ${category === key ? 'bg-aman-teal' : ''}`}
                        onClick={() => setCategory(key as any)}
                      >
                        {val.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {step === 2 && category && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                  <p className="font-bold text-muted-foreground text-right">2. اختر التخصص:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {HIERARCHY[category].subs.map(s => (
                      <Button
                        key={s}
                        variant={subcategory === s ? "default" : "outline"}
                        className={`rounded-xl h-12 ${subcategory === s ? 'bg-aman-teal' : ''}`}
                        onClick={() => setSubcategory(s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 text-right">
                  <p className="font-bold text-muted-foreground">3. تفاصيل العرض:</p>
                  <Input placeholder="عنوان جذاب (مثلاً: سباك محترف بخبرة 10 سنوات)" value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl text-right" />
                  <Textarea placeholder="وصف الخدمة أو المنتج..." value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl text-right min-h-[100px]" />
                  <div className="relative">
                    <Input type="number" placeholder="السعر التقريبي" value={price} onChange={e => setPrice(e.target.value)} className="h-12 rounded-xl ps-12 text-right" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-40">أ.م</span>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl flex items-center justify-end gap-2 text-[10px] text-right">
                    <span>سيتم تحديد موقعك الحالي (نواكشوط) تلقائياً لزيادة دقة البحث.</span>
                    <MapPin className="w-4 h-4 text-aman-teal shrink-0" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {!success && (
          <DialogFooter className="p-8 bg-muted/30 flex flex-row gap-4 items-center">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="flex-1 rounded-xl h-12 font-bold">
                السابق
              </Button>
            )}
            <Button
              onClick={step < 3 ? () => setStep(s => s + 1) : handleSubmit}
              disabled={loading || (step === 1 && !category) || (step === 2 && !subcategory)}
              className="flex-1 rounded-xl h-12 bg-aman-teal hover:bg-aman-teal/90 font-bold"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {step === 3 ? "نشر العرض" : "التالي"}
                  {step < 3 ? <ChevronLeft className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </span>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}