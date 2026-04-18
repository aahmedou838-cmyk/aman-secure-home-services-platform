import React from "react";
import { Link } from "react-router-dom";
import { Shield, MapPin, Zap, Lock, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
export function HomePage() {
  return (
    <div className="space-y-24 pb-20 overflow-hidden text-rtl">
      {/* Hero Section */}
      <section className="relative pt-12 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-aman-teal/10 rounded-full text-aman-teal font-bold text-sm border border-aman-teal/20"
        >
          <Shield className="w-4 h-4" />
          أول منصة خدمات منزلية بمعايير أمنية في موريتانيا
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-balance leading-tight"
        >
          بيتك في <span className="text-aman-teal">أمان</span> تام مع خبرائنا بنواكشوط
        </motion.h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          نقدم لك خدمات الصيانة والترميم بنظام تتبع ذكي، تسعير شفاف بالأوقية، وحماية كاملة لخصوصيتك وسلامتك.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-2xl bg-aman-teal hover:bg-aman-teal/90 shadow-xl shadow-aman-teal/20">
            <Link to="/client-dashboard">أطلب خدمة الآن</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-2xl border-2">
            <Link to="/worker-dashboard">انضم كفني معتمد</Link>
          </Button>
        </div>
      </section>
      {/* Safety Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "تتبع مباشر وGPS",
            desc: "راقب وصول الفني في أحياء نواكشوط لحظة بلحظة مع نظام رادار دقيق.",
            icon: MapPin,
            color: "bg-blue-500"
          },
          {
            title: "تسعير عادل بالأوقية",
            desc: "رسوم معاينة ثابتة (200 أ.م) يتبعها عرض سعر رسمي ملزم دون مفاجآت.",
            icon: Zap,
            color: "bg-amber-500"
          },
          {
            title: "زر الطوارئ SOS",
            desc: "حماية فورية للفني والعميل عبر نظام استغاثة مرتبط بمركز عمليات نواكشوط.",
            icon: Shield,
            color: "bg-red-500"
          }
        ].map((feat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl border bg-card hover:shadow-2xl transition-all group"
          >
            <div className={`w-14 h-14 ${feat.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
              <feat.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </section>
      {/* Visual Trust Indicator */}
      <section className="bg-aman-navy text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-aman-teal/20 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-xl text-rtl">
            <h2 className="text-3xl md:text-5xl font-bold">تأمين شامل على كل خدمة</h2>
            <p className="text-white/70 text-lg leading-relaxed">
              نحن نؤمن بأن الثقة هي أساس العمل. لذلك، جميع الخدمات المقدمة عبر منصة أمان في موريتانيا مغطاة بتأمين لضمان حقك.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-aman-teal" />
                <span>تحقق جنائي كامل لجميع الفنيين الموريتانيين</span>
              </li>
              <li className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-aman-teal" />
                <span>نظام تقييم ومحاسبة صارم من 5 مستويات</span>
              </li>
            </ul>
          </div>
          <div className="flex-shrink-0">
             <div className="w-48 h-48 border-8 border-white/10 rounded-full flex items-center justify-center">
                <Shield className="w-24 h-24 text-aman-teal" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}