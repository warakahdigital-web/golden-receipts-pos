import QRCode from "qrcode";

export type ZatcaInvoiceData = {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalAmount: string;
  vatAmount: string;
};

function encodeTLV(tag: number, value: string): string {
  const utf8 = new TextEncoder().encode(value);
  const length = utf8.length;
  const header = new Uint8Array([tag, length]);
  const tlv = new Uint8Array(header.length + utf8.length);
  tlv.set(header, 0);
  tlv.set(utf8, header.length);
  return Array.from(tlv)
    .map((byte) => String.fromCharCode(byte))
    .join("");
}

export function generateZatcaBase64(data: ZatcaInvoiceData): string {
  const tlv =
    encodeTLV(1, data.sellerName) +
    encodeTLV(2, data.vatNumber) +
    encodeTLV(3, data.timestamp) +
    encodeTLV(4, data.totalAmount) +
    encodeTLV(5, data.vatAmount);

  const bytes = new TextEncoder().encode(tlv);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64;
}

export async function generateZatcaQr(data: ZatcaInvoiceData): Promise<string> {
  const payload = generateZatcaBase64(data);
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    type: "image/png",
    margin: 2,
    width: 220,
  });
}
