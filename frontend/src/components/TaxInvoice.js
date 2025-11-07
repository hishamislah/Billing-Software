import React from 'react';
import './TaxInvoice.css';

export default function TaxInvoice({ invoiceData }) {
  return (
    <div className="invoice-container">
      <div className="invoice-wrapper">
        {/* Header - Only show for B2B */}
        {invoiceData.billType === 'B2B' && (
          <>
            <div className="invoice-header">
              <h1>TAX INVOICE</h1>
              <h2>TRADE BAZAR</h2>
              <p>Home Centre Building, Vayaskara P.O, Kottayam-686001</p>
              <p>Contact: 9544023493, 9496423493</p>
              <p><strong>GST No: 32BSOPA1799R1Z1</strong></p>
            </div>
            <div className="invoice-divider"></div>
          </>
        )}

        {/* For B2C - Simple Header */}
        {invoiceData.billType === 'B2C' && (
          <>
            <div className="invoice-header">
              <h2>TRADE BAZAR</h2>
              <p>Home Centre Building, Vayaskara P.O, Kottayam-686001</p>
              <p>Contact: 9544023493, 9496423493</p>
            </div>
            <div className="invoice-divider"></div>
          </>
        )}

        {/* Invoice & Customer Details */}
        <div className="invoice-details-section">
          <div>
            <p><strong>Invoice No:</strong> {invoiceData.invoiceNumber}</p>
            <p><strong>Invoice Date:</strong> {new Date(invoiceData.invoiceDate).toLocaleDateString('en-GB')}</p>
            <p><strong>Order No:</strong> {invoiceData.orderNumber}</p>
            <p><strong>Order Date:</strong> {new Date(invoiceData.orderDate).toLocaleDateString('en-GB')}</p>
          </div>
          <div>
            <p><strong>Customer Name:</strong> {invoiceData.customer.name}</p>
            <p><strong>Contact:</strong> {invoiceData.customer.phone}</p>
            <p><strong>Address:</strong> {invoiceData.customer.address}</p>
            {invoiceData.billType === 'B2B' && invoiceData.customer.gstNumber && (
              <p><strong>GST Number:</strong> {invoiceData.customer.gstNumber}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Description of Goods</th>
              <th>Product Price</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>{parseFloat(item.price).toFixed(2)}</td>
                <td>{item.qty}</td>
                <td>{parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="invoice-total-row">
            <span><strong>Gross Value:</strong></span>
            <span>{invoiceData.grossValue.toFixed(2)}</span>
          </div>
          {invoiceData.discount > 0 && (
            <div className="invoice-total-row">
              <span><strong>Discount:</strong></span>
              <span>-{invoiceData.discount.toFixed(2)}</span>
            </div>
          )}
          {invoiceData.additionalCharges > 0 && (
            <div className="invoice-total-row">
              <span><strong>Additional Charges:</strong></span>
              <span>{invoiceData.additionalCharges.toFixed(2)}</span>
            </div>
          )}
          <div className="invoice-total-row">
            <span><strong>Net Value:</strong></span>
            <span>{invoiceData.netValue.toFixed(2)}</span>
          </div>
          {invoiceData.billType === 'B2B' && (
            <>
              <div className="invoice-total-row">
                <span><strong>CGST (9%):</strong></span>
                <span>{invoiceData.cgst.toFixed(2)}</span>
              </div>
              <div className="invoice-total-row">
                <span><strong>SGST (9%):</strong></span>
                <span>{invoiceData.sgst.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <div className="invoice-total-row invoice-final-total">
          <span>Total Amount:</span>
          <span>Rs. {invoiceData.totalAmount.toFixed(2)}</span>
        </div>

        <p className="invoice-amount-words">
          <strong>Amount in Words:</strong> {invoiceData.amountInWords}
        </p>

        <p className="invoice-terms">E&OE</p>

        <div className="invoice-divider"></div>

        <p className="invoice-company-name">
          For <strong>TRADE BAZAR</strong>
        </p>

        {/* Signatures */}
        <div className="invoice-signatures">
          <div className="invoice-signature-box">
            <div className="invoice-signature-space"></div>
            <div className="invoice-signature-label">Customer's Seal and Signature</div>
          </div>
          <div className="invoice-signature-box">
            <div className="invoice-signature-space"></div>
            <div className="invoice-signature-label">Authorized Signature</div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="invoice-payment-details">
          <h3>Payment Details</h3>
          <div className="invoice-payment-info">
            <p>Gpay No: <strong>8304904752</strong></p>
            <p>Account No: <strong>10250100272045</strong></p>
            <p>Account Name: <strong>Islah. S. A</strong></p>
            <p>Bank: <strong>Federal Bank</strong></p>
            <p>Branch: <strong>Main</strong></p>
            <p>IFSC Code: <strong>FDRL0001025</strong></p>
            <p>Contact no. <strong>9544023493</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
