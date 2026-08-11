REVOKE ALL ON FUNCTION public.create_invoice_for_sale() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.decrement_stock_on_sale_item() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;