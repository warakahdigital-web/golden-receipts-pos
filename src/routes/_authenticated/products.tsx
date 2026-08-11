import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/use-auth";
import {
  createProduct,
  deleteProduct,
  listProducts,
  money,
  updateProductStock,
} from "@/lib/erp-data";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({
    meta: [
      { title: "المنتجات والمخزون — سحاب ERP" },
      {
        name: "description",
        content:
          "إدارة المنتجات والمخزون في سحاب ERP: الأسعار، التكلفة، الكميات المتوفرة والتصنيفات.",
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

const emptyForm = { name: "", sku: "", category: "إلكترونيات", price: "", cost: "", stock: "" };

function ProductsPage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const filtered = useMemo(
    () =>
      products.filter(
        (p) => p.name.includes(query) || p.sku.toLowerCase().includes(query.toLowerCase()),
      ),
    [products, query],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  const addProduct = useMutation({
    mutationFn: () =>
      createProduct({
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim() || "عام",
        price: Number(form.price) || 0,
        cost: Number(form.cost) || 0,
        stock: Number(form.stock) || 0,
      }),
    onSuccess: () => {
      setForm(emptyForm);
      setError(null);
      invalidate();
    },
    onError: () => setError("تعذر إضافة المنتج. تأكد من أن رمز SKU غير مكرر."),
  });

  const changeStock = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => updateProductStock(id, stock),
    onSuccess: invalidate,
  });

  const removeProduct = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: invalidate,
  });

  const totalValue = products.reduce((s, p) => s + Number(p.price) * p.stock, 0);

  return (
    <AppShell breadcrumb="المنتجات والمخزون">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground">
          قيمة المخزون: {money(totalValue)} ر.س
        </span>
        <div className="text-right">
          <p className="text-xs font-bold text-gold">المخزون</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">المنتجات والمخزون</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? "أضف المنتجات وحدّث الكميات والأسعار."
              : "عرض المنتجات والكميات المتوفرة للبيع."}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <section className="surface-card mt-6 p-5">
          <h2 className="text-right font-display text-lg font-extrabold">إضافة منتج جديد</h2>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6"
            onSubmit={(e) => {
              e.preventDefault();
              addProduct.mutate();
            }}
          >
            {(
              [
                { key: "name", label: "اسم المنتج", type: "text" },
                { key: "sku", label: "رمز SKU", type: "text" },
                { key: "category", label: "التصنيف", type: "text" },
                { key: "price", label: "سعر البيع", type: "number" },
                { key: "cost", label: "التكلفة", type: "number" },
                { key: "stock", label: "الكمية", type: "number" },
              ] as const
            ).map((f) => (
              <div key={f.key}>
                <label htmlFor={f.key} className="mb-1.5 block text-xs font-bold">
                  {f.label}
                </label>
                <input
                  id={f.key}
                  type={f.type}
                  required={f.key === "name" || f.key === "sku"}
                  step="any"
                  min={f.type === "number" ? 0 : undefined}
                  value={form[f.key]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
                />
              </div>
            ))}
            <div className="sm:col-span-2 xl:col-span-6">
              {error ? (
                <p className="mb-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={addProduct.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-navy-foreground transition-colors hover:bg-navy-soft disabled:opacity-70"
              >
                {addProduct.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                إضافة المنتج
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="surface-card mt-6 p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم المنتج أو رمز SKU..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pr-10 pl-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Package className="size-6" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-sm font-bold">لا توجد منتجات</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] text-muted-foreground">
                  <th className="pb-3 font-bold">المنتج</th>
                  <th className="pb-3 font-bold">التصنيف</th>
                  <th className="pb-3 font-bold">سعر البيع</th>
                  <th className="pb-3 font-bold">التكلفة</th>
                  <th className="pb-3 font-bold">الكمية</th>
                  {isAdmin ? <th className="pb-3 font-bold">إجراءات</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3">
                      <span className="block font-bold">{p.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{p.sku}</span>
                    </td>
                    <td className="py-3 text-muted-foreground">{p.category}</td>
                    <td className="py-3 font-bold">{money(Number(p.price))} ر.س</td>
                    <td className="py-3 text-muted-foreground">{money(Number(p.cost))} ر.س</td>
                    <td className="py-3">
                      {isAdmin ? (
                        <input
                          type="number"
                          min={0}
                          defaultValue={p.stock}
                          onBlur={(e) => {
                            const stock = Number(e.target.value);
                            if (stock !== p.stock) changeStock.mutate({ id: p.id, stock });
                          }}
                          className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-gold"
                        />
                      ) : (
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                            p.stock > 0
                              ? "bg-success-soft text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                      )}
                    </td>
                    {isAdmin ? (
                      <td className="py-3">
                        <button
                          onClick={() => removeProduct.mutate(p.id)}
                          aria-label="حذف المنتج"
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
