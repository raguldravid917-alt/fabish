/**
 * GSTInvoice.jsx
 * 
 * GST-compliant Indian Tax Invoice component.
 * Renders a professional A4 printable invoice with:
 * - Business details (Fabish GSTIN, PAN, address)
 * - Customer billing & shipping details
 * - Product table with HSN codes, GST rate, CGST/SGST/IGST
 * - Tax summary (taxable value, GST breakdown, grand total)
 * - Print/PDF support via window.print()
 * 
 * GST Rule: Same state (Tamil Nadu) = CGST + SGST, else = IGST
 */

import React, { useCallback } from 'react';
import { Printer, X, Building2 } from 'lucide-react';

// ─── Business constants (update with real credentials) ───────────────────────
const SELLER = {
  name: 'FABISH',
  legalName: 'Fabish Organic Cosmetics Pvt. Ltd.',
  gstin: '33AABCF1234A1ZX',          // Tamil Nadu (state code 33)
  pan: 'AABCF1234A',
  cin: 'U24234TN2024PTC123456',      // Optional CIN
  address: '12, Green Valley Road, Anna Nagar',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '600 040',
  country: 'India',
  phone: '+91 98765 43210',
  email: 'support@fabish.in',
  website: 'www.fabish.in',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatInr = (val) =>
  `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

// ─── Component ────────────────────────────────────────────────────────────────
const GSTInvoice = ({ order, onClose }) => {
  if (!order) return null;

  const gst = order.gstDetails || {};
  const isSameState = gst.isSameState !== false; // default to same state if not set
  const gstRate = gst.gstRate || 18;
  const taxableValue = gst.taxableValue || order.itemsPrice - (order.discountAmount || 0);
  const cgst = gst.cgst || 0;
  const sgst = gst.sgst || 0;
  const igst = gst.igst || 0;
  const totalGst = gst.totalGst || 0;

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const paymentBadgeColor = order.paymentStatus === 'Paid' || order.isPaid
    ? '#15803d'
    : order.paymentStatus === 'Failed'
    ? '#dc2626'
    : '#d97706';

  const statusBadgeColor = order.orderStatus === 'Delivered'
    ? '#15803d'
    : order.orderStatus === 'Cancelled'
    ? '#dc2626'
    : '#d97706';

  return (
    <>
      <style>{`
        /* Main modal overlay container */
        .invoice-modal-overlay {
          box-sizing: border-box;
        }

        /* Action bar for Print / Close actions */
        .invoice-action-bar {
          width: 100%;
          max-width: 800px;
          box-sizing: border-box;
          margin-bottom: 16px;
        }

        /* Main invoice print container */
        .invoice-container {
          background: white;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid #e5e7eb;
          box-sizing: border-box;
        }

        /* Text wrapping utilities */
        .wrap-text {
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          white-space: pre-wrap !important;
        }

        /* Header layout */
        .invoice-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }
        .invoice-header-logo {
          text-align: left;
        }
        .invoice-header-meta {
          text-align: right;
        }

        /* Details grid (Seller / Customer info) */
        .invoice-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid #e5e7eb;
          box-sizing: border-box;
        }
        .invoice-details-col-left {
          padding: 24px 32px;
          border-right: 1px solid #e5e7eb;
          box-sizing: border-box;
        }
        .invoice-details-col-right {
          padding: 24px 32px;
          box-sizing: border-box;
        }

        /* Product Table */
        .invoice-table-wrapper {
          width: 100%;
          overflow: visible;
        }
        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .invoice-table th, .invoice-table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
        }
        .invoice-table th {
          background: #f3f4f6;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 9px;
          letter-spacing: 0.5px;
          color: #374151;
          border-bottom: 2px solid #d1d5db;
        }
        .invoice-table tr:nth-child(even) {
          background: #fafafa;
        }

        /* Summary grid (Tax / Amount breakup) */
        .invoice-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-top: 2px solid #2f3e10;
          box-sizing: border-box;
        }
        .invoice-summary-col-left {
          padding: 24px 32px;
          border-right: 1px solid #e5e7eb;
          box-sizing: border-box;
        }
        .invoice-summary-col-right {
          padding: 24px 32px;
          box-sizing: border-box;
        }

        /* Footer columns */
        .invoice-footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
          box-sizing: border-box;
        }

        /* Responsive Breakpoints: Tablet (max-width: 1024px) */
        @media screen and (max-width: 1024px) {
          .invoice-details-col-left,
          .invoice-details-col-right,
          .invoice-summary-col-left,
          .invoice-summary-col-right {
            padding: 20px 24px;
          }
        }

        /* Responsive Breakpoints: Mobile (max-width: 767px) */
        @media screen and (max-width: 767px) {
          .invoice-modal-overlay {
            padding: 8px !important;
          }
          .invoice-action-bar {
            margin-bottom: 12px;
            padding: 12px !important;
            flex-direction: column !important;
            gap: 12px !important;
            align-items: stretch !important;
          }
          .invoice-action-bar .flex {
            justify-content: space-between !important;
            width: 100% !important;
          }
          .invoice-header-flex {
            flex-direction: column !important;
            gap: 12px !important;
            text-align: left !important;
          }
          .invoice-header-logo, .invoice-header-meta {
            text-align: left !important;
          }
          .invoice-details-grid {
            grid-template-columns: 1fr !important;
          }
          .invoice-details-col-left {
            border-right: none !important;
            border-bottom: 1px solid #e5e7eb !important;
            padding: 16px 20px !important;
          }
          .invoice-details-col-right {
            padding: 16px 20px !important;
          }
          
          /* Table to Stacked Cards transformation on mobile */
          .invoice-table-wrapper {
            overflow: visible !important;
          }
          .invoice-table, 
          .invoice-table thead, 
          .invoice-table tbody, 
          .invoice-table tr, 
          .invoice-table td {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .invoice-table thead {
            display: none !important; /* Hide standard desktop table header */
          }
          .invoice-table tr {
            border: 1px solid #e5e7eb !important;
            border-radius: 0px !important;
            padding: 16px !important;
            background: #faf9f5 !important;
            margin-bottom: 12px !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
          }
          .invoice-table tr:nth-child(even) {
            background: #faf9f5 !important; /* Keep consistent background */
          }
          .invoice-table td {
            text-align: right !important;
            padding: 8px 0 !important;
            border: none !important;
            border-bottom: 1px dashed #e5e7eb !important;
            position: relative !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            font-size: 11px !important;
          }
          .invoice-table td:last-child {
            border-bottom: none !important;
          }
          .invoice-table td::before {
            content: attr(data-label) !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            font-size: 9px !important;
            color: #6b7280 !important;
            text-align: left !important;
            margin-right: 12px !important;
          }
          /* Hide label prefix on description card header */
          .invoice-table td.cell-desc {
            display: block !important;
            text-align: left !important;
            padding: 0 0 10px 0 !important;
            border-bottom: 1px solid #e5e7eb !important;
            margin-bottom: 6px !important;
          }
          .invoice-table td.cell-desc::before {
            display: none !important;
          }
          .invoice-table td.cell-desc .item-title {
            font-size: 13px !important;
            font-weight: 700 !important;
            color: #111827 !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }

          /* Summary section */
          .invoice-summary-grid {
            grid-template-columns: 1fr !important;
          }
          .invoice-summary-col-left {
            padding: 16px 20px !important;
            border-right: none !important;
            border-bottom: 1px solid #e5e7eb !important;
          }
          .invoice-summary-col-right {
            padding: 16px 20px !important;
          }

          /* Footer section */
          .invoice-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }

        /* ── Dedicated Print Styles ── */
        @media print {
          /* Hide non-invoice content elements globally */
          #root > *:not(.invoice-modal-overlay),
          .no-print,
          header, footer, nav, button {
            display: none !important;
          }
          
          /* Set body for black and white and high contrast A4 */
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .invoice-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            z-index: auto !important;
            display: block !important;
          }

          /* Make invoice document take full A4 width */
          .invoice-container {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Desktop table layouts inside printed invoice */
          .invoice-table-wrapper {
            overflow: visible !important;
          }
          .invoice-table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .invoice-table thead {
            display: table-header-group !important;
          }
          .invoice-table tbody {
            display: table-row-group !important;
          }
          .invoice-table tr {
            display: table-row !important;
            background: transparent !important;
            page-break-inside: avoid !important;
          }
          .invoice-table th, .invoice-table td {
            display: table-cell !important;
            border: 1px solid #d1d5db !important;
            padding: 8px 12px !important;
          }
          .invoice-table td::before {
            display: none !important;
          }
          .invoice-table td.cell-desc {
            display: table-cell !important;
            border-bottom: 1px solid #d1d5db !important;
            padding-bottom: 8px !important;
            margin-bottom: 0 !important;
          }

          /* Tax summary structure */
          .invoice-summary-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            page-break-inside: avoid !important;
          }
          .invoice-summary-col-left {
            border-right: 1px solid #d1d5db !important;
            border-bottom: none !important;
          }

          /* Footer layout */
          .invoice-footer-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 20px !important;
            page-break-inside: avoid !important;
          }

          /* Force browser to print background colors and border styles */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      {/* ── Overlay modal ── */}
      <div className="invoice-modal-overlay fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-start p-4 overflow-y-auto">
        {/* ── Action bar (no-print) ── */}
        <div className="invoice-action-bar no-print sticky top-4 z-10 flex items-center justify-between bg-[#2f3e10] text-white px-6 py-3 rounded-none shadow-xl">
          <div className="font-heading font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            GST Tax Invoice — {order.invoiceNumber || order.orderNumber}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white text-[#2f3e10] hover:bg-[#eae8d8] px-4 py-2 font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-none rounded-none"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 border border-white/50 text-white hover:bg-white/20 px-4 py-2 font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer rounded-none bg-transparent"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>

        {/* ── Invoice document ── */}
        <div
          id="gst-invoice-print-area"
          className="invoice-container text-xs font-sans text-gray-800"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {/* ═══ HEADER ════════════════════════════════════════════════════════ */}
          <div style={{ background: '#2f3e10', color: 'white', padding: '24px 32px' }}>
            <div className="invoice-header-flex">
              {/* Business name */}
              <div className="invoice-header-logo">
                <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '4px', fontFamily: 'Georgia, serif' }}>
                  FABISH
                </div>
                <div style={{ fontSize: '10px', opacity: 0.7, letterSpacing: '2px', marginTop: '2px' }}>
                  PREMIUM ORGANIC SKINCARE
                </div>
              </div>
              {/* Invoice meta */}
              <div className="invoice-header-meta">
                <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '1px' }}>TAX INVOICE</div>
                <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '6px' }}>
                  Invoice No: <strong>{order.invoiceNumber || '—'}</strong>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85 }}>
                  Invoice Date: <strong>{formatDate(order.paidAt || order.createdAt)}</strong>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85 }}>
                  Order No: <strong>{order.orderNumber}</strong>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85 }}>
                  Order Date: <strong>{formatDate(order.createdAt)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ SELLER & BUYER DETAILS ════════════════════════════════════════ */}
          <div className="invoice-details-grid">
            {/* Sold By */}
            <div className="invoice-details-col-left">
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Sold By
              </div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#111827' }}>{SELLER.legalName}</div>
              <div className="wrap-text" style={{ marginTop: '4px', lineHeight: '1.6', color: '#374151', fontSize: '11px' }}>
                {SELLER.address}<br />
                {SELLER.city}, {SELLER.state} — {SELLER.pincode}<br />
                {SELLER.country}
              </div>
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#4b5563' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: '600' }}>GSTIN:</span> {SELLER.gstin}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: '600' }}>PAN:</span> {SELLER.pan}
                </div>
                <div style={{ fontWeight: '600' }}>State: {SELLER.state} (Code: 33)</div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#6b7280' }}>
                <div>{SELLER.phone}</div>
                <div className="wrap-text">{SELLER.email}</div>
                <div>{SELLER.website}</div>
              </div>
            </div>

            {/* Billed / Shipped To */}
            <div className="invoice-details-col-right">
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Billed & Shipped To
              </div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#111827' }}>
                {order.customerDetails?.name || '—'}
              </div>
              <div className="wrap-text" style={{ marginTop: '4px', lineHeight: '1.6', color: '#374151', fontSize: '11px' }}>
                {order.shippingAddress?.address}<br />
                {order.shippingAddress?.city}
                {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} — {order.shippingAddress?.postalCode}<br />
                {order.shippingAddress?.country || 'India'}
              </div>
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#4b5563' }}>
                {order.customerDetails?.phone && (
                  <div><span style={{ fontWeight: '600' }}>Phone:</span> {order.customerDetails.phone}</div>
                )}
                <div className="wrap-text"><span style={{ fontWeight: '600' }}>Email:</span> {order.customerDetails?.email}</div>
                {order.shippingAddress?.state && (
                  <div style={{ fontWeight: '600', marginTop: '4px' }}>State: {order.shippingAddress.state}</div>
                )}
              </div>

              {/* Payment & shipping status badges */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '2px', background: `${paymentBadgeColor}20`, color: paymentBadgeColor, border: `1px solid ${paymentBadgeColor}40` }}>
                  {order.paymentStatus || (order.isPaid ? 'Paid' : 'Pending')} — {order.paymentMethod}
                </span>
                <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '2px', background: `${statusBadgeColor}20`, color: statusBadgeColor, border: `1px solid ${statusBadgeColor}40` }}>
                  {order.orderStatus}
                </span>
              </div>

              {/* Razorpay transaction ID if available */}
              {order.razorpayPaymentId && (
                <div className="wrap-text" style={{ marginTop: '8px', fontSize: '9px', color: '#6b7280' }}>
                  Txn ID: {order.razorpayPaymentId}
                </div>
              )}
            </div>
          </div>

          {/* ═══ PRODUCT TABLE ═════════════════════════════════════════════════ */}
          <div className="invoice-table-wrapper">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Description</th>
                  <th style={{ textAlign: 'center' }}>HSN</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>GST%</th>
                  <th style={{ textAlign: 'right' }}>Total (incl. GST)</th>
                </tr>
              </thead>
              <tbody>
                {(order.orderItems || []).map((item, idx) => {
                  const lineTotal = item.price * item.qty;
                  const itemGstRate = item.gstRate || gstRate;
                  const lineTaxable = lineTotal / (1 + itemGstRate / 100);
                  const lineGst = lineTotal - lineTaxable;

                  return (
                    <tr key={idx}>
                      <td data-label="#" style={{ color: '#6b7280' }}>{idx + 1}</td>
                      <td className="cell-desc" data-label="Item Description">
                        <div className="item-title wrap-text">{item.title}</div>
                        {item.sku && <div className="wrap-text" style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>SKU: {item.sku}</div>}
                      </td>
                      <td data-label="HSN" style={{ textAlign: 'center', color: '#6b7280', fontFamily: 'monospace' }}>
                        {item.hsnCode || '3304'}
                      </td>
                      <td data-label="Qty" style={{ textAlign: 'center', fontWeight: '700', color: '#111827' }}>
                        {item.qty}
                      </td>
                      <td data-label="Unit Price" style={{ textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>
                        {formatInr(item.price)}
                      </td>
                      <td data-label="GST" style={{ textAlign: 'right', color: '#6b7280' }}>
                        {itemGstRate}%
                      </td>
                      <td data-label="Total" style={{ textAlign: 'right', fontWeight: '700', color: '#111827', fontFamily: 'monospace' }}>
                        {formatInr(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ═══ TAX SUMMARY & AMOUNT SUMMARY ══════════════════════════════════ */}
          <div className="invoice-summary-grid">
            {/* GST breakup table (left) */}
            <div className="invoice-summary-col-left">
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Tax Breakup
              </div>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '6px 0', textAlign: 'left', fontWeight: '600', color: '#6b7280', fontSize: '9px', textTransform: 'uppercase' }}>Tax Type</th>
                    <th style={{ padding: '6px 0', textAlign: 'center', fontWeight: '600', color: '#6b7280', fontSize: '9px', textTransform: 'uppercase' }}>Rate</th>
                    <th style={{ padding: '6px 0', textAlign: 'right', fontWeight: '600', color: '#6b7280', fontSize: '9px', textTransform: 'uppercase' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#374151' }}>Taxable Value</td>
                    <td style={{ padding: '6px 0', textAlign: 'center', color: '#374151' }}>—</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>{formatInr(taxableValue)}</td>
                  </tr>
                  {isSameState ? (
                    <>
                      <tr>
                        <td style={{ padding: '6px 0', color: '#374151' }}>CGST (Central GST)</td>
                        <td style={{ padding: '6px 0', textAlign: 'center', color: '#374151' }}>{gstRate / 2}%</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>{formatInr(cgst)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', color: '#374151' }}>SGST (State GST)</td>
                        <td style={{ padding: '6px 0', textAlign: 'center', color: '#374151' }}>{gstRate / 2}%</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>{formatInr(sgst)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td style={{ padding: '6px 0', color: '#374151' }}>IGST (Integrated GST)</td>
                      <td style={{ padding: '6px 0', textAlign: 'center', color: '#374151' }}>{gstRate}%</td>
                      <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>{formatInr(igst)}</td>
                    </tr>
                  )}
                  <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 0', fontWeight: '700', color: '#111827' }}>Total GST</td>
                    <td style={{ padding: '8px 0', textAlign: 'center', fontWeight: '700', color: '#111827' }}>{gstRate}%</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: '#2f3e10' }}>{formatInr(totalGst)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="wrap-text" style={{ marginTop: '8px', fontSize: '9px', color: '#9ca3af' }}>
                {isSameState
                  ? `Intra-state supply (${SELLER.state} → ${order.shippingAddress?.state || SELLER.state}). CGST + SGST applicable.`
                  : `Inter-state supply (${SELLER.state} → ${order.shippingAddress?.state || 'Other State'}). IGST applicable.`}
              </div>
            </div>

            {/* Order totals (right) */}
            <div className="invoice-summary-col-right">
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Amount Summary
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                  <span>Subtotal (incl. GST)</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatInr(order.itemsPrice)}</span>
                </div>
                {(order.discountAmount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                    <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                    <span style={{ fontFamily: 'monospace' }}>- {formatInr(order.discountAmount)}</span>
                  </div>
                )}
                {order.redeemedPointsDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                    <span>Points Discount ({order.redeemedPoints} pts)</span>
                    <span style={{ fontFamily: 'monospace' }}>- {formatInr(order.redeemedPointsDiscount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                  <span>Shipping Charges</span>
                  <span style={{ fontFamily: 'monospace', color: order.shippingPrice === 0 ? '#15803d' : '#374151' }}>
                    {order.shippingPrice === 0 ? 'FREE' : formatInr(order.shippingPrice)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151', borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
                  <span>Taxable Value</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatInr(taxableValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                  <span>Total GST ({gstRate}%)</span>
                  <span style={{ fontFamily: 'monospace' }}>{formatInr(totalGst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #2f3e10', paddingTop: '10px', marginTop: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>GRAND TOTAL</span>
                  <span style={{ fontWeight: '900', fontSize: '16px', color: '#2f3e10', fontFamily: 'monospace' }}>{formatInr(order.totalPrice)}</span>
                </div>
                <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
                  All amounts in Indian Rupees (INR)
                </div>
              </div>
            </div>
          </div>

          {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
          <div style={{ borderTop: '1px solid #e5e7eb', padding: '20px 32px' }}>
            <div className="invoice-footer-grid">
              <div>
                <div style={{ fontWeight: '700', color: '#374151', marginBottom: '4px', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.5px' }}>Return Policy</div>
                <p className="wrap-text" style={{ lineHeight: '1.5', margin: 0 }}>
                  We accept returns within 7 days of delivery only if the items are unopened, unused, and in their original packaging. Contact support@fabish.in for instructions.
                </p>
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#374151', marginBottom: '4px', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.5px' }}>Terms & Conditions</div>
                <p className="wrap-text" style={{ lineHeight: '1.5', margin: 0 }}>
                  This is a computer-generated invoice and does not require a physical signature. Goods once sold are not returnable except as per policy. Subject to Chennai jurisdiction.
                </p>
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#374151', marginBottom: '4px', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.5px' }}>Authorised Signatory</div>
                <div style={{ height: '40px', borderBottom: '1px solid #d1d5db', marginBottom: '4px' }}></div>
                <div style={{ fontWeight: '600', color: '#374151' }}>{SELLER.legalName}</div>
                <div style={{ fontSize: '9px' }}>Authorized Signature</div>
              </div>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
              <div style={{ fontWeight: '700', color: '#2f3e10', fontSize: '12px', letterSpacing: '2px', fontFamily: 'Georgia, serif' }}>
                Thank you for shopping with FABISH!
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                {SELLER.website} | {SELLER.email} | {SELLER.phone}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GSTInvoice;
