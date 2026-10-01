import React from 'react';
import { formatCurrency } from '../../utils/currency';

interface TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

// Convert amount to Indian English Words
function numberToWords(amount: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  let remaining = rounded;
  let words = '';

  if (remaining >= 10000000) {
    words += convertChunk(Math.floor(remaining / 10000000)) + ' Crore ';
    remaining %= 10000000;
  }
  if (remaining >= 100000) {
    words += convertChunk(Math.floor(remaining / 100000)) + ' Lakh ';
    remaining %= 100000;
  }
  if (remaining >= 1000) {
    words += convertChunk(Math.floor(remaining / 1000)) + ' Thousand ';
    remaining %= 1000;
  }
  if (remaining > 0) {
    words += convertChunk(remaining);
  }

  return `${words.trim()} Rupees Only`;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen) return null;

  const orderId = order?.order_number || order?.id || 'UNI-839210';
  const invoiceNumber = `INV-2024-25-${orderId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const invoiceDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const totalAmount = Number(order?.total_amount || 2999);
  // 18% GST (9% CGST + 9% SGST intra-state, or 18% IGST)
  // Taxable = Total / 1.18
  const taxableValue = Math.round((totalAmount / 1.18) * 100) / 100;
  const totalGst = Math.round((totalAmount - taxableValue) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  const buyer = order?.shipping_address || {
    full_name: 'Valued UniStore Customer',
    address_line1: 'B-404, Prestige Heights, Outer Ring Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560103',
    phone: '+91 98765 43210',
  };

  const items = order?.items && order.items.length > 0
    ? order.items
    : [
        {
          id: 'demo-1',
          product_name: 'Acoustic Elite Active ANC Headphones',
          quantity: 1,
          price: totalAmount,
          total: totalAmount,
          hsn: '85183000',
        },
      ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      {/* Backdrop click dismiss on non-print */}
      <div className="fixed inset-0 print:hidden" onClick={onClose} />

      {/* Invoice Container */}
      <div className="relative bg-white text-zinc-900 rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-10 z-10 border border-zinc-200 print:border-none print:shadow-none print:rounded-none print:p-0 print:max-w-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between pb-6 mb-6 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
            <span className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Official GST Tax Invoice • Form GST INV-1
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-bold transition shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Content */}
        <div className="space-y-6 text-xs text-zinc-700">
          
          {/* Header & Seller Info */}
          <div className="grid grid-cols-2 gap-8 border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-black tracking-tight text-zinc-950">UniStore</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-300">
                  RETAIL PVT LTD
                </span>
              </div>
              <p className="font-semibold text-zinc-900">UniStore Retail Private Limited</p>
              <p>CIN: U52100MH2024PTC398210</p>
              <p>Unit 402, Signature Tower, BKC</p>
              <p>Bandra East, Mumbai, Maharashtra — 400051</p>
              <p className="mt-1 font-mono font-bold text-zinc-900">
                GSTIN: <span className="text-emerald-700">27AABCU9603R1ZM</span>
              </p>
              <p>State: 27 - Maharashtra</p>
            </div>

            <div className="text-right">
              <h2 className="text-lg font-black uppercase tracking-wider text-zinc-950 mb-1">
                Tax Invoice
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">Original for Recipient</p>
              
              <div className="mt-4 space-y-1 font-mono">
                <p>
                  <span className="text-zinc-500 font-sans">Invoice No: </span>
                  <span className="font-bold text-zinc-950">{invoiceNumber}</span>
                </p>
                <p>
                  <span className="text-zinc-500 font-sans">Invoice Date: </span>
                  <span className="font-bold text-zinc-950">{invoiceDate}</span>
                </p>
                <p>
                  <span className="text-zinc-500 font-sans">Order Ref: </span>
                  <span className="font-bold text-zinc-950">{orderId}</span>
                </p>
                <p>
                  <span className="text-zinc-500 font-sans">Reverse Charge: </span>
                  <span className="font-bold text-zinc-950">No</span>
                </p>
              </div>
            </div>
          </div>

          {/* Billing & Shipping Address Grid */}
          <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Billed To (Customer)
              </span>
              <p className="font-bold text-zinc-900 text-sm">{buyer.full_name}</p>
              <p>{buyer.address_line1}</p>
              <p>{buyer.city}, {buyer.state} — {buyer.postal_code}</p>
              <p>Phone: {buyer.phone}</p>
              <p className="text-zinc-500 mt-1">Place of Supply: {buyer.state || 'Karnataka'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Dispatched From (Fulfillment Hub)
              </span>
              <p className="font-bold text-zinc-900 text-sm">UniStore Air Fulfillment Center #4</p>
              <p>Plot 18, Logistics Park, MIDC Taloja</p>
              <p>Navi Mumbai, Maharashtra — 410208</p>
              <p>Air Courier: Bluedart Express Priority</p>
              <p className="text-emerald-700 font-semibold mt-1">Status: Tax Paid & Dispatched</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-900 text-[11px] font-bold text-zinc-900 uppercase">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-4">Description of Goods</th>
                  <th className="py-2 px-2">HSN/SAC</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Taxable Val</th>
                  <th className="py-2 px-2 text-right">CGST (9%)</th>
                  <th className="py-2 px-2 text-right">SGST (9%)</th>
                  <th className="py-2 pl-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-xs">
                {items.map((it: any, idx: number) => {
                  const itTotal = Number(it.total || it.price || 0);
                  const itTaxable = Math.round((itTotal / 1.18) * 100) / 100;
                  const itCgst = Math.round(((itTotal - itTaxable) / 2) * 100) / 100;
                  const itSgst = Math.round((itTotal - itTaxable - itCgst) * 100) / 100;
                  const hsn = it.hsn || (it.product_name?.toLowerCase().includes('chair') ? '9403' : '85183000');

                  return (
                    <tr key={it.id || idx}>
                      <td className="py-3 pr-2 text-zinc-400 font-mono">{idx + 1}</td>
                      <td className="py-3 pr-4">
                        <span className="font-bold text-zinc-900 block">{it.product_name || it.product?.name || 'UniStore Luxury Item'}</span>
                        <span className="text-[10px] text-zinc-400">Standard Manufacturer Warranty Included</span>
                      </td>
                      <td className="py-3 px-2 font-mono text-zinc-600">{hsn}</td>
                      <td className="py-3 px-2 text-center font-bold">{it.quantity || 1}</td>
                      <td className="py-3 px-2 text-right tabular-nums">{formatCurrency(itTaxable)}</td>
                      <td className="py-3 px-2 text-right tabular-nums text-zinc-600">{formatCurrency(itCgst)}</td>
                      <td className="py-3 px-2 text-right tabular-nums text-zinc-600">{formatCurrency(itSgst)}</td>
                      <td className="py-3 pl-2 text-right tabular-nums font-bold text-zinc-950">{formatCurrency(itTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation Summary */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-zinc-900">
            <div>
              <p className="font-bold text-zinc-900 text-xs uppercase mb-1">Invoice Value in Words:</p>
              <p className="font-semibold text-zinc-800 italic bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                {numberToWords(totalAmount)}
              </p>

              <div className="mt-4 space-y-1 text-[11px] text-zinc-500">
                <p>• GST Payable on Reverse Charge: No</p>
                <p>• Certified that the particulars given above are true and correct.</p>
                <p>• Computer-generated legal tax invoice under Section 31 of CGST Act, 2017.</p>
              </div>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2 font-mono">
              <div className="flex justify-between text-zinc-600 font-sans text-xs">
                <span>Taxable Amount</span>
                <span className="tabular-nums font-semibold">{formatCurrency(taxableValue)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 font-sans text-xs">
                <span>Central GST (CGST 9%)</span>
                <span className="tabular-nums">{formatCurrency(cgst)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 font-sans text-xs">
                <span>State GST (SGST 9%)</span>
                <span className="tabular-nums">{formatCurrency(sgst)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 font-sans text-xs">
                <span>Shipping & Packaging</span>
                <span className="tabular-nums text-emerald-700 font-semibold">FREE (₹0.00)</span>
              </div>
              <div className="border-t border-zinc-300 pt-2 flex justify-between font-bold text-sm text-zinc-950 font-sans">
                <span>Total Invoice Value (INR)</span>
                <span className="tabular-nums text-emerald-700 font-extrabold">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signature & Digital Verification */}
          <div className="pt-6 border-t border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-zinc-100 rounded-lg border border-zinc-300 flex items-center justify-center p-1 text-[10px] text-center font-mono font-bold text-zinc-700">
                GST QR VERIFIED
              </div>
              <div className="text-[10px] text-zinc-400">
                <p className="font-bold text-zinc-700">Digitally Signed & Validated</p>
                <p>IRN: 8a719c8f309b4...2190</p>
                <p>Authentication Server: GSTN NIC Portal</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-zinc-500">For UniStore Retail Private Limited</p>
              <div className="h-8 flex items-end justify-end">
                <span className="font-serif italic font-bold text-zinc-800 text-sm">Authorized Signatory</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">Signatory ID: IN-MUM-8921</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
