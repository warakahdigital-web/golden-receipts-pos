import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/indexed-db";

const PENDING_SALES_UPDATED = "pending-sales-updated";

type OfflineSale = {
  id: string;
  cashier_id: string;
  customer_name: string;
  subtotal: number;
  vat: number;
  total: number;
  payment_method: string;
  status: string;
  invoice_number?: string;
};

type OfflineSaleItem = {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export const isOnline = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.onLine === "boolean" && navigator.onLine;

export async function getPendingSalesCount(): Promise<number> {
  return db.sales.where("synced").equals(false).count();
}

export async function syncPendingSales(): Promise<void> {
  if (!isOnline()) return;

  const pendingSales = await db.sales.where("synced").equals(false).toArray();
  if (pendingSales.length === 0) return;

  for (const pending of pendingSales) {
    const items = await db.saleItems.where("sale_id").equals(pending.id).toArray();
    if (items.length === 0) continue;

    try {
      const { data: remoteSale, error: saleError } = await supabase
        .from("sales")
        .insert({
          cashier_id: pending.cashier_id,
          customer_name: pending.customer_name,
          subtotal: pending.subtotal,
          vat: pending.vat,
          total: pending.total,
          payment_method: pending.payment_method,
          status: pending.status,
          invoice_number: pending.invoice_number,
        })
        .select()
        .single();

      if (saleError || !remoteSale) {
        throw saleError ?? new Error("Failed to insert sale during sync");
      }

      const { error: itemsError } = await supabase.from("sale_items").insert(
        items.map((item) => ({
          sale_id: remoteSale.id,
          product_id: item.product_id,
          product_name: item.product_name,
          unit_price: item.unit_price,
          quantity: item.quantity,
          line_total: item.line_total,
        })),
      );

      if (itemsError) {
        throw itemsError;
      }

      await db.sales.update(pending.id, {
        synced: true,
        invoice_number: remoteSale.invoice_number,
      } as any);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(PENDING_SALES_UPDATED));
      }
    } catch (error) {
      console.error("syncPendingSales failed for sale", pending.id, error);
    }
  }
}

export function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

export function usePendingSalesStatus() {
  const online = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePendingCount = async () => {
      const count = await getPendingSalesCount();
      setPendingCount(count);
    };

    void updatePendingCount();

    const handlePendingUpdate = () => {
      void updatePendingCount();
    };

    window.addEventListener(PENDING_SALES_UPDATED, handlePendingUpdate);

    return () => {
      window.removeEventListener(PENDING_SALES_UPDATED, handlePendingUpdate);
    };
  }, []);

  useEffect(() => {
    if (!online) return;
    void syncPendingSales().then(() => getPendingSalesCount().then(setPendingCount));
  }, [online]);

  return { online, pendingCount };
}

export function useSyncPendingSalesOnReconnect() {
  const online = useOnlineStatus();

  useEffect(() => {
    if (!online) return;
    void syncPendingSales();
  }, [online]);
}
