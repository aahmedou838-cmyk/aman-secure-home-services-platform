"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { PASSWORD_MIN_LENGTH, PASSWORD_TOO_SHORT_MESSAGE } from "@shared/auth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
type FormStep = "signIn" | "signUp" | "verifyEmail" | "forgotPassword" | "resetPassword";
type FieldErrorKey = "email" | "password" | "newPassword" | "otp";
type FieldErrors = Partial<Record<FieldErrorKey, string>>;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function SignInForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<FormStep>("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  const resetForm = useCallback(() => {
    setPassword("");
    setNewPassword("");
    setOtp("");
    setSubmitting(false);
    setFieldErrors({});
  }, []);
  const clearFieldError = useCallback((field: FieldErrorKey) => {
    setFieldErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current
    );
  }, []);
  const validateCurrentStep = useCallback(() => {
    const nextErrors: FieldErrors = {};
    const normalizedEmail = email.trim();
    if (step === "signIn" || step === "signUp" || step === "forgotPassword") {
      if (!normalizedEmail) nextErrors.email = "البريد الإلكتروني مطلوب";
      else if (!EMAIL_PATTERN.test(normalizedEmail)) nextErrors.email = "أدخل بريداً صحيحاً";
    }
    if (step === "signIn" || step === "signUp") {
      if (!password) nextErrors.password = "كلمة المرور مطلوبة";
      else if (step === "signUp" && password.length < PASSWORD_MIN_LENGTH) nextErrors.password = PASSWORD_TOO_SHORT_MESSAGE;
    }
    if (step === "verifyEmail" || step === "resetPassword") {
      if (otp.length !== 6) nextErrors.otp = "أدخل الكود المكون من 6 أرقام";
    }
    if (step === "resetPassword") {
      if (!newPassword) nextErrors.newPassword = "كلمة المرور الجديدة مطلوبة";
      else if (newPassword.length < PASSWORD_MIN_LENGTH) nextErrors.newPassword = PASSWORD_TOO_SHORT_MESSAGE;
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [email, newPassword, otp, password, step]);
  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    const normalizedEmail = email.trim();
    const formData = new FormData();
    formData.set("email", normalizedEmail);
    try {
      switch (step) {
        case "signIn":
          formData.set("password", password);
          formData.set("flow", "signIn");
          await signIn("password", formData);
          break;
        case "signUp":
          formData.set("password", password);
          formData.set("flow", "signUp");
          try {
            await signIn("password", formData);
          } catch (error: any) {
            const msg = error.message;
            if (msg.includes("verify") || msg.includes("OTP")) {
              setStep("verifyEmail");
              setResendCooldown(60);
              toast.info("تم إرسال كود التحقق لبريدك");
              return;
            }
            throw error;
          }
          setStep("verifyEmail");
          setResendCooldown(60);
          break;
        case "verifyEmail":
          formData.set("code", otp);
          formData.set("flow", "email-verification");
          await signIn("password", formData);
          toast.success("تم التحقق بنجاح!");
          break;
        case "forgotPassword":
          formData.set("flow", "reset");
          await signIn("password", formData);
          setStep("resetPassword");
          setResendCooldown(60);
          break;
        case "resetPassword":
          formData.set("code", otp);
          formData.set("newPassword", newPassword);
          formData.set("flow", "reset-verification");
          await signIn("password", formData);
          toast.success("تم تغيير كلمة المرور");
          setStep("signIn");
          break;
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ ما");
    } finally {
      setSubmitting(false);
    }
  }, [step, email, password, newPassword, otp, signIn, validateCurrentStep]);
  const inputClass = "w-full px-4 py-3 text-sm bg-muted text-foreground placeholder:text-muted-foreground border border-input rounded-xl focus:ring-2 focus:ring-aman-teal outline-none transition-all";
  const buttonClass = "w-full px-6 py-3 bg-aman-teal text-white hover:bg-aman-teal/90 transition-all active:scale-95 disabled:opacity-50 font-bold rounded-xl";
  const linkClass = "text-aman-teal hover:underline text-xs font-bold cursor-pointer transition-colors";
  return (
    <div className="w-full">
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
        {(step === "signIn" || step === "signUp" || step === "forgotPassword") && (
          <div>
            <input
              className={inputClass}
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
              disabled={submitting}
              autoComplete="email"
            />
            {fieldErrors.email && <p className="mt-1 text-[10px] text-destructive">{fieldErrors.email}</p>}
          </div>
        )}
        {(step === "signIn" || step === "signUp") && (
          <div>
            <input
              className={inputClass}
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
              disabled={submitting}
            />
            {fieldErrors.password && <p className="mt-1 text-[10px] text-destructive">{fieldErrors.password}</p>}
          </div>
        )}
        {(step === "verifyEmail" || step === "resetPassword") && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-muted-foreground text-center">أدخل الكود المكون من 6 أرقام</p>
            <InputOTP maxLength={6} value={otp} onChange={(val) => { setOtp(val); clearFieldError("otp"); }} disabled={submitting}>
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
            {fieldErrors.otp && <p className="text-[10px] text-destructive">{fieldErrors.otp}</p>}
          </div>
        )}
        <button className={buttonClass} type="submit" disabled={submitting}>
          {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> 
            : step === "signIn" ? "تسجيل الدخول" : step === "signUp" ? "إنشاء حساب" : "متابعة"}
        </button>
        <div className="text-center text-xs space-y-2">
          {(step === "signIn" || step === "signUp") && (
            <button type="button" className={linkClass} onClick={() => { resetForm(); setStep(step === "signIn" ? "signUp" : "signIn"); }}>
              {step === "signIn" ? "ليس لديك حساب؟ سجل هنا" : "لديك حساب بالفعل؟ سجل دخولك"}
            </button>
          )}
          {step === "signIn" && (
            <div>
              <button type="button" className={linkClass} onClick={() => { resetForm(); setStep("forgotPassword"); }}>
                نسيت كلمة المرور؟
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}