import React from "react";
import { Link } from "react-router-dom";
import { Shield, Zap, Activity, ArrowLeft, CheckCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
export function HomePage() {
  const openRequests = useQuery(api.jobs.listOpenRequests) ?? [];
  const requestCount = openRequests.length > 0 ? openRequests.length + 12 : 12;
  return (
    <div className="space-y-24 pb-20 overflow-hidden text-rtl" dir="rtl">
      {/* Hero Section */}
      <section className="relative pt-12 text-center space-y-8 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-6 py-2 bg-aman-navy text-white rounded-full font-bold text-xs shadow-xl mx-auto"
        >
          <Activity className="w-4 h-4 text-aman-teal animate-pulse" />
          <span>مباشر: {requestCount} طلب نشط الآن في نواكشوط</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-8xl font-black leading-[1.1] tracking-tight text-right md:text-center"
        >
          سوق الخدمات <br /> <span className="text-aman-teal">الأكثر أماناً</span>
        </motion.h1>
        <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-right md:text-center">
          أول منصة متكاملة في موريتانيا للخدمات الحرة، النقل، وسوق المنتجات المنزلية بضمان مالي وتتبع مباشر.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
          <Button asChild size="lg" className="h-16 px-10 text-xl rounded-2xl bg-aman-teal shadow-2xl shadow-aman-teal/30 order-1 sm:order-2">
            <Link to="/client-dashboard">أطلب خدمة الآن</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-10 text-xl rounded-2xl border-2 order-2 sm:order-1">
            <Link to="/worker-dashboard">انضم كفني معتمد</Link>
          </Button>
        </div>
      </section>
      {/* Live Marketplace Feed Preview */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-muted/30 rounded-[3rem] p-8 border border-dashed border-aman-teal/20 relative">
          <div className="absolute -top-4 right-8 bg-aman-teal text-white px-4 py-1 rounded-full text-[10px] font-bold">نشاط السوق حالياً</div>
          <div className="space-y-4">
            {openRequests.length > 0 ? (
              openRequests.slice(0, 3).map((req, i) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-card p-4 rounded-2xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-aman-teal/10 flex items-center justify-center"><Zap className="w-4 h-4 text-aman-teal" /></div>
                    <span className="font-bold text-sm">مطلوب {req.serviceType}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] opacity-40">نواكشوط</span>
                    <Link to="/worker-dashboard" className="p-2 hover:bg-aman-teal/10 rounded-full transition-colors">
                      <ArrowLeft className="w-4 h-4 text-aman-teal" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center py-4 text-sm opacity-40">جاري تحديث الطلبات المباشرة من نواكشوط...</p>
            )}
          </div>
        </div>
      </section>
      {/* Specialty Categories Preview */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-4">تصفح حسب الفئة</h2>
          <div className="h-1.5 w-20 bg-aman-teal mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {['الكهرباء', 'السباكة', 'نقل بضائع', 'توصيل', 'سائق', 'أثاث منزل'].map((cat) => (
            <Link key={cat} to="/client-dashboard">
              <motion.div
                whileHover={{ y: -5 }}
                className="p-8 rounded-[2rem] bg-card border hover:border-aman-teal transition-all text-center group cursor-pointer shadow-sm hover:shadow-xl h-full"
              >
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-aman-teal/10 transition-colors">
                  <CheckCircle className="w-8 h-8 text-muted-foreground group-hover:text-aman-teal" />
                </div>
                <span className="font-black text-aman-navy">{cat}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
      {/* Trust Grid */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "تغطية كاملة", desc: "نغطي كافة أحياء نواكشوط بأسطول من الفنيين المعتمدين والمفحوصين أمنياً.", icon: Users, color: "bg-aman-navy" },
          { title: "شفافية الأسعار", desc: "تخلص من المزايدات العشوائية. عروض أسعار دقيقة وموثقة عبر المنصة حصراً.", icon: Zap, color: "bg-aman-teal" },
          { title: "أمانك أولاً", desc: "زر SOS وتتبع مباشر طوال فترة العمل لضمان سلامتك وسلامة ممتلكاتك.", icon: Shield, color: "bg-aman-amber" }
        ].map((feat, i) => (
          <motion.div key={i} className="p-10 rounded-[2.5rem] border bg-card hover:shadow-2xl transition-all text-right">
            <div className={`w-16 h-16 ${feat.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl ms-auto`}>
              <feat.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}