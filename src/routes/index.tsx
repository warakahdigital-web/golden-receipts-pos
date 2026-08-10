import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShoppingCart,
  FileText,
  Package,
  BarChart3,
  Users,
  Plus,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — سحاب ERP" },
      {
        name: "description",
        content:
          "لوحة تحكم سحاب ERP: متابعة مبيعات اليوم، الفواتير، قيمة المخزون وصافي الأرباح في مكان واحد.",
      },
      { property: "og:title", content: "لوحة التحكم — سحاب ERP" },
      {
        property: "og:description",
        content: "نظرة سريعة على أداء منشأتك: المبيعات، الفواتير، المخزون والأرباح.",
      },
    ],
  }),
  component: Dashboard,
});

const stats = [
  {
    label: "مبيعات اليوم",
    value: "12,840.00",
    unit: "ر.س",
    delta: "+12.5%",
    icon: ShoppingCart,
    tone: "bg-gold-soft text-gold-foreground",
  },
  {
    label: "إجمالي الفواتير",
    value: "248",
    unit: "فاتورة",
    delta: "+8.2%",
    icon: FileText,
    tone: "bg-info-soft text-info",
  },
  {
    label: "قيمة المخزون",
    value: "86,420.00",
    unit: "ر.س",
    delta: "+4.6%",
    icon: Package,
    tone: "bg-success-soft text-success",
  },
  {
    label: "صافي الأرباح",
    value: "8,960.00",
    unit: "ر.س",
    delta: "+16.8%",
    icon: BarChart3,
    tone: "bg-info-soft text-info",
  },
];

const quick = [
  { title: "إنشاء فاتورة", desc: "فاتورة مبيعات جديدة", icon: FileText, tone: "bg-gold-soft text-gold-foreground", to: "/pos" },
  { title: "إضافة منتج", desc: "إضافة منتج للمخزون", icon: Package, tone: "bg-info-soft text-info", to: "/products" },
  { title: "إضافة عميل", desc: "تسجيل عميل جديد", icon: Users, tone: "bg-success-soft text-success", to: "/customers" },
];

const activities = [
  { title: "فاتورة مبيعات جديدة", desc: "فاتورة رقم #INV-1048", meta: "+ 1,250.00 ر.س", time: "منذ 8 دقائق", dot: "bg-gold", metaClass: "text-success" },
  { title: "إضافة منتج للمخزون", desc: "سماعات لاسلكية - 24 قطعة", meta: "المخزون", time: "منذ 24 دقيقة", dot: "bg-info", metaClass: "text-success" },
  { title: "تسجيل مصروف", desc: "مستلزمات مكتبية", meta: "- 340.00 ر.س", time: "منذ ساعة", dot: "bg-destructive", metaClass: "text-destructive" },
  { title: "عميل جديد", desc: "مؤسسة أفق الأعمال", meta: "عميل", time: "منذ ساعتين", dot: "bg-success", metaClass: "text-success" },
];

const chart = [4200, 6100, 5400, 7300, 6800, 9200, 10400];
const days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

function SalesChart() {
  const max = 15000;
  const w = 700;
  const h = 190;
  const pts = chart.map((v, i) => [(i / (chart.length - 1)) * w, h - (v / max) * h] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <div className="mt-6" dir="ltr">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[190px] w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.33, 0.66, 1].map((r) => (
          <line key={r} x1="0" y1={h * r} x2={w} y2={h * r} stroke="var(--border)" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#goldFill)" />
        <path d={line} fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div className="mt-2 flex flex-row-reverse justify-between text-[11px] text-muted-foreground">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <AppShell breadcrumb="لوحة التحكم">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gold">الثلاثاء، ١٢ مارس ٢٠٢٤</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">صباح الخير، محمد</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إليك نظرة سريعة على أداء منشأتك اليوم.
          </p>
        </div>
        <Link
          to="/pos"
          className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-navy-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-navy-soft"
        >
          <Plus className="size-4" />
          إنشاء فاتورة جديدة
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card p-5">
            <div className="flex items-start justify-between">
              <span className={`flex size-11 items-center justify-center rounded-xl ${s.tone}`}>
                <s.icon className="size-5" strokeWidth={1.75} />
              </span>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-extrabold">
                  {s.value} <span className="text-sm font-bold text-muted-foreground">{s.unit}</span>
                </p>
              </div>
            </div>
            <p className="mt-4 text-left text-[11px] text-muted-foreground">
              <span className="font-bold text-success">{s.delta}</span> منذ الشهر الماضي
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_400px]">
        <section className="surface-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground">
              آخر 7 أيام
              <ChevronDown className="size-3.5" />
            </button>
            <div className="text-right">
              <h2 className="font-display text-lg font-extrabold">نظرة عامة على المبيعات</h2>
              <p className="text-xs text-muted-foreground">
                مقارنة أداء المبيعات خلال آخر 7 أيام
              </p>
            </div>
          </div>
          <SalesChart />
        </section>

        <section className="surface-card p-6">
          <h2 className="font-display text-lg font-extrabold">وصول سريع</h2>
          <p className="text-xs text-muted-foreground">اختصارات للمهام الأكثر استخداماً</p>
          <div className="mt-5 space-y-3">
            {quick.map((q) => (
              <Link
                key={q.title}
                to={q.to}
                className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
              >
                <span className={`flex size-10 items-center justify-center rounded-xl ${q.tone}`}>
                  <q.icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="flex-1 text-right">
                  <span className="block text-sm font-bold">{q.title}</span>
                  <span className="block text-[11px] text-muted-foreground">{q.desc}</span>
                </span>
                <ArrowLeft className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="surface-card mt-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <button className="inline-flex items-center gap-1 text-xs font-bold text-gold">
            عرض الكل
            <ArrowLeft className="size-3.5" />
          </button>
          <div className="text-right">
            <h2 className="font-display text-lg font-extrabold">آخر النشاطات</h2>
            <p className="text-xs text-muted-foreground">متابعة آخر العمليات في منشأتك</p>
          </div>
        </div>

        <ul className="mt-5 divide-y divide-border">
          {activities.map((a) => (
            <li key={a.title} className="flex items-center gap-4 py-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted">
                <span className={`size-2 rounded-full ${a.dot}`} />
              </span>
              <span className="flex-1 text-right">
                <span className="block text-sm font-bold">{a.title}</span>
                <span className="block text-[11px] text-muted-foreground">{a.desc}</span>
              </span>
              <span className="text-left">
                <span className={`block text-sm font-bold ${a.metaClass}`}>{a.meta}</span>
                <span className="block text-[11px] text-muted-foreground">{a.time}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
