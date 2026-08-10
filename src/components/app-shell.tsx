import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutGrid,
  ShoppingCart,
  FileText,
  Package,
  Wallet,
  Users,
  BarChart3,
  Building2,
  ShieldCheck,
  Settings,
  Bell,
  ChevronDown,
  HelpCircle,
  AlignRight,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ROLE_LABEL } from "@/hooks/use-auth";

const mainNav = [
  { to: "/", label: "لوحة التحكم", icon: LayoutGrid },
  { to: "/pos", label: "نقطة البيع", icon: ShoppingCart },
  { to: "/invoices", label: "المبيعات والفواتير", icon: FileText, badge: "12" },
  { to: "/products", label: "المنتجات والمخزون", icon: Package },
  { to: "/expenses", label: "المصروفات", icon: Wallet },
  { to: "/customers", label: "العملاء والموردون", icon: Users },
  { to: "/reports", label: "التقارير المالية", icon: BarChart3 },
] as const;

const cashierNav = [
  { to: "/pos", label: "نقطة البيع", icon: ShoppingCart },
  { to: "/products", label: "المنتجات والمخزون", icon: Package },
] as const;

const systemNav = [
  { to: "/settings/company", label: "إعدادات المنشأة", icon: Building2 },
  { to: "/settings/users", label: "المستخدمون والصلاحيات", icon: ShieldCheck },
  { to: "/settings/general", label: "الإعدادات العامة", icon: Settings },
] as const;


function NavList({
  items,
  pathname,
}: {
  items: readonly { to: string; label: string; icon: typeof LayoutGrid; badge?: string }[];
  pathname: string;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={active ? "sidebar-item sidebar-item-active" : "sidebar-item"}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-md bg-gold px-1.5 py-0.5 text-[11px] font-bold text-gold-foreground">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  breadcrumb,
  children,
}: {
  breadcrumb: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-[272px] flex-col bg-navy-deep px-4 py-5 lg:flex">
        <div className="flex items-center gap-3 px-1">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gold text-gold-foreground">
            <AlignRight className="size-5" />
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-extrabold text-navy-foreground">
              سحاب <span className="text-gold">ERP</span>
            </p>
            <p className="text-[11px] text-navy-foreground/60">
              حلول سحابية متكاملة لإدارة أعمالك
            </p>
          </div>
        </div>

        <button className="mt-6 flex w-full items-center gap-3 rounded-xl bg-navy px-3 py-3 text-right transition-colors hover:bg-navy-soft">
          <span className="flex size-9 items-center justify-center rounded-lg bg-info-soft text-sm font-bold text-navy">
            أ
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-navy-foreground">
              مؤسسة أفق الأعمال
            </span>
            <span className="block text-[11px] text-navy-foreground/60">الفرع الرئيسي</span>
          </span>
          <ChevronDown className="size-4 text-navy-foreground/60" />
        </button>

        <div className="mt-6 flex-1 overflow-y-auto">
          <p className="mb-2 px-3 text-[11px] font-bold tracking-wide text-gold">
            القائمة الرئيسية
          </p>
          <NavList items={mainNav} pathname={pathname} />

          <p className="mt-6 mb-2 px-3 text-[11px] font-bold tracking-wide text-gold">
            إدارة النظام
          </p>
          <NavList items={systemNav} pathname={pathname} />
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-navy px-3 py-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-navy-soft text-navy-foreground">
              <HelpCircle className="size-4" />
            </span>
            <span className="flex-1 text-right">
              <span className="block text-sm font-bold text-navy-foreground">
                هل تحتاج إلى مساعدة؟
              </span>
              <span className="block text-[11px] text-navy-foreground/60">
                تواصل مع فريق الدعم
              </span>
            </span>
            <ChevronDown className="size-4 text-navy-foreground/60" />
          </div>
          <p className="text-center text-[11px] text-navy-foreground/40">
            سحاب ERP · الإصدار 1.0.0
          </p>
        </div>
      </aside>

      <div className="lg:mr-[272px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/90 px-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-accent">
              <Bell className="size-[18px]" />
            </button>
            <div className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-accent">
              <span className="flex size-10 items-center justify-center rounded-xl bg-navy text-sm font-bold text-navy-foreground">
                م
              </span>
              <span className="text-right">
                <span className="block text-sm font-bold">محمد العتيبي</span>
                <span className="block text-[11px] text-muted-foreground">مدير النظام</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold">{breadcrumb}</span>
            <span className="text-muted-foreground">/</span>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              الرئيسية
            </Link>
          </div>
        </header>

        <main className="px-5 py-7 lg:px-8">{children}</main>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-5 text-xs text-muted-foreground lg:px-8">
          <p>© 2024 سحاب ERP. جميع الحقوق محفوظة.</p>
          <p className="flex gap-5">
            <span>مركز المساعدة</span>
            <span>سياسة الخصوصية</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
