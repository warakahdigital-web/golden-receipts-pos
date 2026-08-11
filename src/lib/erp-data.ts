import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type Sale = Tables<"sales">;

export const VAT_RATE = 0.15;

export const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export type CartLine = { product: Product; qty: number };

export type CheckoutInput = {
  cashierId: string;
  lines: CartLine[];
  paymentMethod: string;
  customerName?: string;
};

export async function checkout({
  cashierId,
  lines,
  paymentMethod,
  customerName = "عميل نقدي",
}: CheckoutInput): Promise<Sale> {
  const subtotal = lines.reduce((s, l) => s + Number(l.product.price) * l.qty, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

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
  if (saleError || !sale) throw saleError ?? new Error("sale insert failed");

  const { error: itemsError } = await supabase.from("sale_items").insert(
    lines.map((l) => ({
      sale_id: sale.id,
      product_id: l.product.id,
      product_name: l.product.name,
      unit_price: Number(l.product.price),
      quantity: l.qty,
      line_total: Number(l.product.price) * l.qty,
    })),
  );
  if (itemsError) throw itemsError;

  return sale;
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
