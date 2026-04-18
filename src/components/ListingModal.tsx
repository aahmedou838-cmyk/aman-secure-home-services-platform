import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ChevronRight, ChevronLeft, MapPin } from "lucide-react";
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
  const createListing = useMutation(api.listings.createListing);
  const handleSubmit = async () => {
    if (!title || !price || !category || !subcategory) return toast.error("يرجى إكمال جميع الحقول");
    setLoading(true);
    try {
      await createListing({
        category: category as any,
        subcategory,
        title,
        description,
        price: Number(price),
        location: { lat: 18.0735, lng: -15.9582 },
      });
      toast.success("تم نشر عرضك بنجاح في السوق");
      onOpenChange(false);
      reset();
    } catch (e: any) {
      toast.error(e.message || "فشل النشر");
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setStep(1); setCategory(""); setSubcategory(""); setTitle(""); setDescription(""); setPrice("");
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none" dir="rtl">
        <div className="bg-aman-navy p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-aman-teal" />
              إضافة عرض جديد للمنصة
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <p className="font-bold text-muted-foreground">1. اختر الفئة الرئيسية:</p>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(HIERARCHY).map(([key, val]) => (
                  <Button
                    key={key}
                    variant={category === key ? "default" : "outline"}
                    className={`h-16 rounded-2xl text-lg font-bold ${category === key ? 'bg-aman-teal' : ''}`}
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
              <p className="font-bold text-muted-foreground">2. اختر التخصص:</p>
              <div className="grid grid-cols-2 gap-2">
                {HIERARCHY[category].subs.map(s => (
                  <Button
                    key={s}
                    variant={subcategory === s ? "default" : "outline"}
                    className={`rounded-xl ${subcategory === s ? 'bg-aman-teal' : ''}`}
                    onClick={() => setSubcategory(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <p className="font-bold text-muted-foreground">3. تفاصيل العرض:</p>
              <Input placeholder="عنوان جذاب (مثلاً: سباك محترف بخبرة 10 سنوات)" value={title} onChange={e => setTitle(e.target.value)} className="h-12 rounded-xl" />
              <Textarea placeholder="وصف الخدمة أو المنتج..." value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl" />
              <div className="relative">
                <Input type="number" placeholder="السعر التقريبي" value={price} onChange={e => setPrice(e.target.value)} className="h-12 rounded-xl ps-12" />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-40">أ.م</span>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl flex items-center gap-2 text-[10px]">
                <MapPin className="w-4 h-4 text-aman-teal" />
                سيتم تحديد موقعك الحالي (نواكشوط) تلقائياً لزيادة دقة البحث.
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="p-8 bg-muted/30 flex-row gap-4">
          {step > 1 && <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="flex-1 rounded-xl h-12">السابق</Button>}
          <Button
            onClick={step < 3 ? () => setStep(s => s + 1) : handleSubmit}
            disabled={loading || (step === 1 && !category) || (step === 2 && !subcategory)}
            className="flex-1 rounded-xl h-12 bg-aman-teal hover:bg-aman-teal/90"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="flex items-center gap-2">
                {step === 3 ? "نشر العرض" : "التالي"}
                {step < 3 ? <ChevronLeft className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}