import Dexie, { Table } from "dexie";

export interface ProductRecord {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  is_active: boolean;
  barcode: string | null;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface SaleRecord {
  id: string;
  cashier_id: string;
  customer_name: string;
  subtotal: number;
  vat: number;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  invoice_number?: string;
  zatca_qr?: string;
}

export interface SaleItemRecord {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export class ErpDatabase extends Dexie {
  products!: Table<ProductRecord, string>;
  sales!: Table<SaleRecord, string>;
  saleItems!: Table<SaleItemRecord, string>;

  constructor() {
    super("sahab_erp_db");

    this.version(1).stores({
      products: "id, sku, category, name, is_active, created_at, updated_at",
      sales: "id, cashier_id, status, created_at, updated_at, synced, invoice_number",
      saleItems: "id, sale_id, product_id, created_at",
    });

    this.products.mapToClass(ProductStoreItem);
    this.sales.mapToClass(SaleStoreItem);
    this.saleItems.mapToClass(SaleItemStoreItem);
  }
}

export const db = new ErpDatabase();

class ProductStoreItem implements ProductRecord {
  id = "";
  name = "";
  sku = "";
  category = "";
  price = 0;
  cost = 0;
  stock = 0;
  is_active = true;
  barcode = null;
  unit = "";
  created_at = new Date().toISOString();
  updated_at = new Date().toISOString();
}

class SaleStoreItem implements SaleRecord {
  id = "";
  cashier_id = "";
  customer_name = "عميل نقدي";
  subtotal = 0;
  vat = 0;
  total = 0;
  payment_method = "cash";
  created_at = new Date().toISOString();
  synced = false;
  invoice_number?: string;
  zatca_qr?: string;
}

class SaleItemStoreItem implements SaleItemRecord {
  id = "";
  sale_id = "";
  product_id = "";
  product_name = "";
  unit_price = 0;
  quantity = 0;
  line_total = 0;
}

/**
 * قاعدة بيانات IndexedDB لمشروع سحاب ERP.
 *
 * الجداول:
 * - products: تخزن بيانات المنتجات المحلية والمزامنة.
 * - sales: تخزن الفواتير والمبيعات المحلية قبل مزامنتها إلى الخادم.
 * - saleItems: تخزن بنود الفاتورة المرتبطة بكل بيع.
 *
 * يمكن استخدام هذه القاعدة لاحقاً لدعم وضع Offline-first
 * ولتخزين البيانات محلياً عند انقطاع الإنترنت.
 */
