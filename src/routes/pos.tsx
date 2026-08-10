import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Banknote,
  CreditCard,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Package,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "نقطة البيع — سحاب ERP" },
      {
        name: "description",
        content:
          "شاشة نقطة البيع في سحاب ERP: أنشئ فاتورة جديدة، أضف المنتجات، واختر طريقة الدفع بسرعة.",
      },
      { property: "og:title", content: "نقطة البيع — سحاب ERP" },
      {
        property: "og:description",
        content: "أنشئ فاتورة جديدة وأدر عمليات البيع من مكان واحد.",
      },
    ],
  }),
  component: PosPage,
});

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: "إلكترونيات" | "إكسسوارات";
};

const products: Product[] = [
  { id: "p1", name: "سماعات لاسلكية", sku: "SKU-1001", price: 349, stock: 24, category: "إلكترونيات" },
  { id: "p2", name: "شاحن سريع 65 واط", sku: "SKU-1002", price: 129, stock: 58, category: "إلكترونيات" },
  { id: "p3", name: "لوحة مفاتيح ميكانيكية", sku: "SKU-1003", price: 459, stock: 12, category: "إلكترونيات" },
  { id: "p4", name: "ماوس لاسلكي", sku: "SKU-1004", price: 89, stock: 76, category: "إكسسوارات" },
  { id: "p5", name: "حافظة جوال جلدية", sku: "SKU-1005", price: 65, stock: 140, category: "إكسسوارات" },
  { id: "p6", name: "كيبل USB-C مضفر", sku: "SKU-1006", price: 39, stock: 210, category: "إكسسوارات" },
  { id: "p7", name: "ساعة ذكية", sku: "SKU-1007", price: 799, stock: 9, category: "إلكترونيات" },
  { id: "p8", name: "حامل لابتوب معدني", sku: "SKU-1008", price: 149, stock: 33, category: "إكسسوارات" },
];

const tabs = ["الكل", "إلكترونيات", "إكسسوارات"] as const;
const payments = [
  { id: "cash", label: "نقدي", icon: Banknote },
  { id: "card", label: "شبكة", icon: CreditCard },
  { id: "credit", label: "آجل", icon: Clock },
] as const;

const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PosPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("الكل");
  const [payment, setPayment] = useState<string>("cash");
  const [cart, setCart] = useState<Record<string, number>>({});

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (tab === "الكل" || p.category === tab) &&
          (p.name.includes(query) || p.sku.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, tab],
  );

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
    .filter((l) => l.product);

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const dec = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      if ((next[id] ?? 0) <= 1) delete next[id];
      else next[id] = next[id] - 1;
      return next;
    });
  const remove = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });

  return (
    <AppShell breadcrumb="نقطة البيع">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground">
            <span className="rounded-md bg-gold-soft px-1.5 py-0.5 text-gold-foreground">2</span>
            الفواتير المعلقة
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2 text-xs font-bold text-success">
            <span className="size-2 rounded-full bg-success" />
            الجلسة مفتوحة
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gold">المبيعات اليومية</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">نقطة البيع</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أنشئ فاتورة جديدة وأدر عمليات البيع من مكان واحد.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[400px_1fr]">
        {/* Cart */}
        <section className="surface-card order-2 flex flex-col p-5 xl:order-1">
          <div className="flex items-start justify-between">
            <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
              {lines.length} أصناف
            </span>
            <div className="text-right">
              <h2 className="font-display text-lg font-extrabold">السلة الحالية</h2>
              <p className="text-[11px] text-muted-foreground">فاتورة مبيعات جديدة</p>
            </div>
          </div>

          <div className="mt-5 flex-1">
            {lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <ShoppingBag className="size-6" strokeWidth={1.75} />
                </span>
                <p className="mt-4 text-sm font-bold">السلة فارغة</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  أضف المنتجات للبدء بإنشاء الفاتورة
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lines.map(({ product, qty }) => (
                  <li key={product.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => remove(product.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="حذف"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-bold">{product.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {money(product.price)} ر.س
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm font-bold">{money(product.price * qty)} ر.س</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => add(product.id)}
                          className="flex size-7 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent"
                          aria-label="زيادة"
                        >
                          <Plus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{qty}</span>
                        <button
                          onClick={() => dec(product.id)}
                          className="flex size-7 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent"
                          aria-label="إنقاص"
                        >
                          <Minus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <button className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-right transition-colors hover:bg-accent">
              <span className="flex size-9 items-center justify-center rounded-lg bg-gold-soft text-sm font-bold text-gold-foreground">
                ع
              </span>
              <span className="flex-1">
                <span className="block text-[11px] text-muted-foreground">العميل</span>
                <span className="block text-sm font-bold">عميل نقدي</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dd className="text-muted-foreground">{money(subtotal)} ر.س</dd>
                <dt className="text-muted-foreground">المجموع الفرعي</dt>
              </div>
              <div className="flex justify-between">
                <dd className="text-muted-foreground">0</dd>
                <dt className="text-muted-foreground">الخصم</dt>
              </div>
              <div className="flex justify-between">
                <dd className="text-muted-foreground">{money(vat)} ر.س</dd>
                <dt className="text-muted-foreground">ضريبة القيمة المضافة (15%)</dt>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <p className="font-display text-2xl font-extrabold">{money(total)} ر.س</p>
              <p className="text-sm font-bold">الإجمالي</p>
            </div>

            <p className="mt-5 text-right text-xs text-muted-foreground">طريقة الدفع</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {payments.map((p) => {
                const active = payment === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs font-bold transition-colors ${
                      active
                        ? "border-navy bg-navy text-navy-foreground"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <p.icon className="size-4" />
                    {p.label}
                  </button>
                );
              })}
            </div>

            <button
              disabled={lines.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-sm font-bold text-gold-foreground transition-opacity disabled:bg-muted disabled:text-muted-foreground"
            >
              <CheckCircle2 className="size-4" />
              إتمام البيع {money(total)} ر.س
            </button>
          </div>
        </section>

        {/* Products */}
        <section className="surface-card order-1 p-5 xl:order-2">
          <div className="flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent">
              <SlidersHorizontal className="size-4" />
              تصفية
              <ChevronDown className="size-3.5" />
            </button>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم المنتج أو رمز SKU..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-row-reverse justify-end gap-6 border-b border-border">
            {tabs.map((t) => {
              const active = tab === t;
              const count = t === "الكل" ? products.length : products.filter((p) => p.category === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm transition-colors ${
                    active
                      ? "border-gold font-bold text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                  <span className="text-[11px] text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-start justify-between">
            <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-success" />
              متوفر في المخزون
            </span>
            <div className="text-right">
              <h2 className="font-display text-lg font-extrabold">المنتجات</h2>
              <p className="text-[11px] text-muted-foreground">
                {filtered.length} منتجات متاحة للبيع
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Search className="size-6" strokeWidth={1.75} />
              </span>
              <p className="mt-4 text-sm font-bold">لم نجد منتجات مطابقة</p>
              <p className="mt-1 text-xs text-muted-foreground">
                جرّب البحث باسم آخر أو غيّر التصنيف
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => add(p.id)}
                  className="rounded-2xl border border-border p-4 text-right transition-all hover:border-gold hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-lg bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success">
                      {p.stock} قطعة
                    </span>
                    <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Package className="size-5" strokeWidth={1.75} />
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-bold">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.sku}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-navy text-navy-foreground">
                      <Plus className="size-4" />
                    </span>
                    <p className="font-display text-lg font-extrabold">
                      {money(p.price)}{" "}
                      <span className="text-xs font-bold text-muted-foreground">ر.س</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
