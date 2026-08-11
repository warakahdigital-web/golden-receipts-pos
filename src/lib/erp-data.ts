import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { db } from "@/lib/indexed-db";

export type Product = Tables<"products">;
export type Sale = Tables<"sales">;

export const VAT_RATE = 0.15;

export const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const isOnline = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.onLine === "boolean" && navigator.onLine;

function createUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `offline-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export async function listProducts(): Promise<Product[]> {
  const localProducts = await db.products
    .where("is_active")
    .equals(true)
    .sortBy("created_at");

  if (localProducts.length > 0) {
    if (isOnline()) {
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .then(async ({ data, error }) => {
          if (!error && data) {
            await db.products.bulkPut(
              data.map((product) => ({
                ...product,
                updated_at: product.updated_at ?? new Date().toISOString(),
              })),
            );
          }
        })
        .catch(() => {
          // Ignore remote sync failure, keep local cache.
        });
    }

    return localProducts as Product[];
  }

  if (!isOnline()) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const products = data ?? [];
  await db.products.bulkPut(
    products.map((product) => ({
      ...product,
      updated_at: product.updated_at ?? new Date().toISOString(),
    })),
  );
  return products;
}

export type CartLine = { product: Product; qty: number };

export type CheckoutInput = {
  cashierId: string;
  lines: CartLine[];
  paymentMethod: string;
  customerName?: string;
};

async function saveSaleLocally(
  sale: Omit<Partial<Sale>, "id"> & { id: string },
  items: Array<Omit<Partial<Tables<"sale_items">>, "id"> & { id: string }>,
  synced: boolean,
) {
  const now = new Date().toISOString();
  await db.transaction("rw", db.sales, db.saleItems, async () => {
    await db.sales.put({
      ...sale,
      id: sale.id,
      created_at: sale.created_at ?? now,
      updated_at: now,
      synced,
      invoice_number: sale.invoice_number ?? `OFF-${Date.now()}`,
      zatca_qr: sale.zatca_qr ?? undefined,
    } as any);

    await db.saleItems.bulkPut(
      items.map((item) => ({
        ...item,
        id: item.id,
        created_at: item.created_at ?? now,
      } as any)),
    );
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pending-sales-updated"));
  }
}

export async function checkout({
  cashierId,
  lines,
  paymentMethod,
  customerName = "عميل نقدي",
}: CheckoutInput): Promise<Sale> {
  const subtotal = lines.reduce((s, l) => s + Number(l.product.price) * l.qty, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  const saleId = createUuid();
  const createdAt = new Date().toISOString();
  const invoiceNumber = `OFF-${Date.now()}`;

  const salePayload = {
    id: saleId,
    cashier_id: cashierId,
    customer_name: customerName,
    subtotal,
    vat,
    total,
    payment_method: paymentMethod,
    status: "pending",
    invoice_number: invoiceNumber,
    created_at: createdAt,
    updated_at: createdAt,
  };

  const itemsPayload = lines.map((l) => ({
    id: createUuid(),
    sale_id: saleId,
    product_id: l.product.id,
    product_name: l.product.name,
    unit_price: Number(l.product.price),
    quantity: l.qty,
    line_total: Number(l.product.price) * l.qty,
    created_at: createdAt,
  }));

  if (!isOnline()) {
    await saveSaleLocally(salePayload, itemsPayload, false);
    return salePayload as Sale;
  }

  try {
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        cashier_id: cashierId,
        customer_name: customerName,
        subtotal,
        vat,
        total,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (saleError || !sale) {
      throw saleError ?? new Error("sale insert failed");
    }

    const { data: insertedItems, error: itemsError } = await supabase
      .from("sale_items")
      .insert(
        lines.map((l) => ({
          sale_id: sale.id,
          product_id: l.product.id,
          product_name: l.product.name,
          unit_price: Number(l.product.price),
          quantity: l.qty,
          line_total: Number(l.product.price) * l.qty,
        })),
      )
      .select();

    if (itemsError) {
      throw itemsError;
    }

    await saveSaleLocally(
      {
        ...sale,
        synced: true,
      } as any,
      (insertedItems ?? []).map((item) => ({
        ...item,
        id: createUuid(),
      })),
      true,
    );

    return sale;
  } catch (error) {
    await saveSaleLocally(salePayload, itemsPayload, false);
    return salePayload as Sale;
  }
}

export type NewProductInput = {
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
};

export async function createProduct(input: NewProductInput): Promise<Product> {
  const { data, error } = await supabase.from("products").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateProductStock(id: string, stock: number): Promise<void> {
  const { error } = await supabase.from("products").update({ stock }).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
