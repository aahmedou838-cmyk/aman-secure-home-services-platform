import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Loader2, Landmark } from "lucide-react";
import { toast } from "sonner";
export function WalletTopUp() {
  const topUp = useMutation(api.wallets.topUp);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const presets = [200, 500, 2000, 5000]; // Scaled for MRU
  const handleTopUp = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    setLoading(true);
    // Simulate local bank verification delay
    setTimeout(async () => {
      try {
        await topUp({ amount: val });
        toast.success(`تم شحن ${val} أ.م بنجاح`);
        setIsOpen(false);
        setAmount("");
      } catch (error) {
        toast.error("فشل شحن الرصيد. حاول مرة أخرى.");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-white text-aman-navy hover:bg-white/90 rounded-xl font-bold">
          شحن الرصيد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-aman-navy flex items-center gap-2">
            <Landmark className="w-6 h-6 text-aman-teal" />
            شحن رصيد المحفظة
          </DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {presets.map((p) => (
              <Button
                key={p}
                variant="outline"
                className={`rounded-xl h-12 font-bold ${amount === p.toString() ? 'border-aman-teal bg-aman-teal/5 text-aman-teal' : ''}`}
                onClick={() => setAmount(p.toString())}
              >
                {p} أ.م
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground pe-1">مبلغ مخصص</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl h-14 ps-12 text-lg font-bold bg-muted/50 border-none focus-visible:ring-aman-teal text-rtl"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">أ.م</span>
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-2xl flex items-center gap-4 text-xs text-muted-foreground">
            <CreditCard className="w-8 h-8 opacity-40" />
            <p>سيتم تحويلك إلى بوابة الدفع الموريتانية الآمنة لإتمام العملية.</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={loading || !amount}
            onClick={handleTopUp}
            className="w-full rounded-2xl h-14 text-lg font-bold bg-aman-teal hover:bg-aman-teal/90"
          >
            {loading ? (
              <>
                <Loader2 className="me-2 h-5 w-5 animate-spin" />
                جاري التحقق البنكي...
              </>
            ) : (
              "تأكيد الشحن"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}