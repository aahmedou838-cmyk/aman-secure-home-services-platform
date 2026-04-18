import React from "react";
import { Link } from "react-router-dom";
import { Shield, MapPin, Zap, Lock, Star, Users, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
export function HomePage() {
  return (
    <div className="space-y-24 pb-20 overflow-hidden text-rtl">
      {/* Hero Section */}
      <section className="relative pt-12 text-center space-y-8 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 bg-aman-teal/10 rounded-full text-aman-teal font-bold text-sm border border-aman-teal/20"
        >
          <Star className="w-4 h-4 fill-aman-teal" />
          المنصة رقم #1 للخدمات المنزلية الموثوقة في نواكشوط
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-8xl font-black text-balance leading-[1.1]"
        >
          بيتك في <span className="text-aman-teal">أمان</span> <br />
          بلمسة زر واحدة
        </motion.h1>
        <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          اربط منزلك بأفضل الفنيين المعتمدين في موريتانيا. نظام تتبع مباشر، تسعير عادل بالأوقية، وحماية كاملة لخصوصيتك.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
          <Button asChild size="lg" className="h-16 px-10 text-xl rounded-2xl bg-aman-teal hover:bg-aman-teal/90 shadow-2xl shadow-aman-teal/30 active:scale-95 transition-all">
            <Link to="/client-dashboard">أطلب خبيراً الآن</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-10 text-xl rounded-2xl border-2 active:scale-95 transition-all">
            <Link to="/worker-dashboard">سجل كفني معتمد</Link>
          </Button>
        </div>
      </section>
      {/* Specialty Categories Preview */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {['الكهرباء', 'السباكة', 'الصباغة', 'التنظيف', 'الخدمات', 'السائقين', 'الأمن'].map((cat, i) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-3xl bg-card border hover:border-aman-teal transition-all text-center group cursor-default"
          >
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-aman-teal/10 transition-colors">
              <Zap className="w-6 h-6 text-muted-foreground group-hover:text-aman-teal" />
            </div>
            <span className="font-bold text-sm">{cat}</span>
          </motion.div>
        ))}
      </section>
      {/* Trust Grid */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "تخصصات معتمدة",
            desc: "فنيون متخصصون في الكهرباء والسباكة وأكثر من 7 مجالات مهنية أخرى خاضعة للتحقق.",
            icon: Users,
            color: "bg-aman-navy"
          },
          {
            title: "نظام التتبع الذكي",
            desc: "راقب وصول خبيرك عبر الخريطة لحظة بلحظة لضمان وصوله في الموعد المحدد.",
            icon: MapPin,
            color: "bg-aman-teal"
          },
          {
            title: "ضمان الجودة",
            desc: "ندفع للفني فقط بعد رضاك التام عن الخدمة، مع تأمين شامل على العمل.",
            icon: Shield,
            color: "bg-aman-amber"
          }
        ].map((feat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-10 rounded-[2.5rem] border bg-card hover:shadow-2xl transition-all"
          >
            <div className={`w-16 h-16 ${feat.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl`}>
              <feat.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </section>
      {/* Worker Call to Action */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-aman-navy text-white rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center gap-16">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-aman-teal/20 blur-[120px] rounded-full" />
          <div className="relative z-10 flex-1 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black">زد دخلك مع أمان</h2>
            <p className="text-xl text-white/70 leading-relaxed">
              هل تمتلك خبرة في السباكة أو الكهرباء أو أي حرفة منزلية؟ انضم لشبكة أمان في نواكشوط واحصل على طلبات يومية رابحة ومؤمنة.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <li className="flex items-center gap-3"><CheckCircle className="text-aman-teal w-6 h-6" /> <span>عمولات عادلة</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="text-aman-teal w-6 h-6" /> <span>تأمين مهني</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="text-aman-teal w-6 h-6" /> <span>دفعات فورية</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="text-aman-teal w-6 h-6" /> <span>دعم 24/7</span></li>
            </ul>
            <Button asChild className="h-16 px-12 text-xl rounded-2xl bg-aman-teal hover:bg-aman-teal/90 shadow-2xl shadow-aman-teal/30 active:scale-95 transition-all">
              <Link to="/worker-dashboard">سجل كفني الآن</Link>
            </Button>
          </div>
          <div className="relative z-10 w-full md:w-1/3 flex justify-center">
            <div className="w-64 h-64 border-[12px] border-white/5 rounded-full flex items-center justify-center animate-pulse">
               <Users className="w-32 h-32 text-aman-teal opacity-50" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}