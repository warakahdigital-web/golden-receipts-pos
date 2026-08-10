import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "المنتجات والمخزون — سحاب ERP" },
      {
        name: "description",
        content:
          "وحدة المنتجات والمخزون في سحاب ERP — قيد التطوير وستكون متاحة في المرحلة القادمة.",
      },
      { property: "og:title", content: "المنتجات والمخزون — سحاب ERP" },
      {
        property: "og:description",
        content: "إدارة المنتجات والمخزون داخل سحاب ERP.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <AppShell breadcrumb="المنتجات والمخزون">
      <section className="surface-card flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-info-soft text-info">
          <BarChart3 className="size-7" strokeWidth={1.75} />
        </span>
        <h1 className="mt-5 font-display text-xl font-extrabold">المنتجات والمخزون</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          هذه الوحدة قيد التطوير وستكون متاحة في المرحلة القادمة من سحاب ERP.
        </p>
      </section>
    </AppShell>
  );
}
