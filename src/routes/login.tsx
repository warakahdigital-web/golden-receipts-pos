import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlignRight, Eye, EyeOff, Lock, Mail, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchRole, homeForRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — سحاب ERP" },
      {
        name: "description",
        content: "سجّل الدخول إلى حساب منشأتك في سحاب ERP لإدارة المبيعات والمخزون والفواتير.",
      },
      { property: "og:title", content: "تسجيل الدخول — سحاب ERP" },
      {
        property: "og:description",
        content: "بوابة الدخول إلى نظام سحاب ERP السحابي لإدارة الأعمال.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const role = await fetchRole(data.user.id);
      navigate({ to: homeForRole(role), replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setLoading(false);
      if (signUpError) {
        setError("لم يتم إنشاء الحساب. تأكد من البريد الإلكتروني وكلمة مرور من 6 أحرف على الأقل.");
        return;
      }
      if (!data.session) {
        setNotice("تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول.");
        setMode("signin");
        return;
      }
      const role = await fetchRole(data.session.user.id);
      navigate({ to: homeForRole(role), replace: true });
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError || !data.user) {
      setLoading(false);
      setError("بيانات الدخول غير صحيحة، تأكد من البريد الإلكتروني وكلمة المرور.");
      return;
    }
    const role = await fetchRole(data.user.id);
    setLoading(false);
    navigate({ to: homeForRole(role), replace: true });
  };

  return (
    <div dir="rtl" className="grid min-h-screen lg:grid-cols-[1fr_480px]">
      {/* Brand side */}
      <div className="relative hidden flex-col justify-between bg-navy-deep p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
            <AlignRight className="size-5" />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold text-navy-foreground">
              سحاب <span className="text-gold">ERP</span>
            </p>
            <p className="text-xs text-navy-foreground/60">حلول سحابية متكاملة لإدارة أعمالك</p>
          </div>
        </div>

        <div className="max-w-md">
          <h2 className="font-display text-4xl leading-snug font-extrabold text-navy-foreground">
            إدارة منشأتك <span className="text-gold">من مكان واحد</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-foreground/70">
            نقطة بيع سريعة، فواتير متوافقة مع ضريبة القيمة المضافة، ومتابعة دقيقة للمخزون والتقارير
            المالية.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-navy-foreground/80">
            {["نقطة بيع فورية بواجهة عربية", "فواتير ضريبية جاهزة", "تقارير مالية لحظية"].map(
              (item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-navy text-gold">
                    <ShieldCheck className="size-4" />
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <p className="text-xs text-navy-foreground/40">© 2024 سحاب ERP. جميع الحقوق محفوظة.</p>
      </div>

      {/* Form side */}
      <div className="flex flex-col justify-center bg-background px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <AlignRight className="size-5" />
            </div>
            <p className="font-display text-xl font-extrabold">
              سحاب <span className="text-gold">ERP</span>
            </p>
          </div>

          <p className="mt-8 text-xs font-bold text-gold lg:mt-0">
            {mode === "signin" ? "مرحباً بك مجدداً" : "مستخدم جديد"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">
            {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "أدخل بيانات حسابك للوصول إلى لوحة تحكم منشأتك."
              : "أول حساب في النظام يحصل على صلاحية المدير، والحسابات التالية تكون كاشير."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-border bg-card py-3 pr-10 pl-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-card py-3 pr-10 pl-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="إظهار كلمة المرور"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <button type="button" className="text-xs font-bold text-gold">
                نسيت كلمة المرور؟
              </button>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border accent-[var(--gold)]"
                />
                تذكرني
              </label>
            </div>

            {error ? (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
                {error}
              </p>
            ) : null}

            {notice ? (
              <p className="rounded-xl bg-success-soft px-3 py-2 text-xs font-bold text-success">
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3.5 text-sm font-bold text-navy-foreground transition-colors hover:bg-navy-soft disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "الدخول إلى النظام" : "إنشاء الحساب"}
                  <ArrowLeft className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="font-bold text-gold"
            >
              {mode === "signin" ? "إنشاء حساب جديد" : "تسجيل الدخول"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
