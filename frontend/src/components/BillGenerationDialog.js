import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import TaxInvoice from './TaxInvoice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './BillGenerationDialog.css';

const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  const convertHundreds = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertHundreds(n % 100) : '');
  };

  const convertThousands = (n) => {
    if (n < 1000) return convertHundreds(n);
    if (n < 100000) return convertHundreds(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertHundreds(n % 1000) : '');
    if (n < 10000000) return convertHundreds(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertThousands(n % 100000) : '');
    return convertHundreds(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertThousands(n % 10000000) : '');
  };

  return convertThousands(Math.floor(num)) + ' Rupees Only';
};

export default function BillGenerationDialog({ order, onClose, onBillGenerated }) {
  const [billType, setBillType] = useState('B2B');
  const [items, setItems] = useState(
    order.products?.map((p, idx) => ({
      description: p.productName,
      price: parseFloat(p.price),
      qty: parseInt(p.quantity),
      amount: parseFloat(p.price) * parseInt(p.quantity)
    })) || []
  );
  const [discount, setDiscount] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewInvoiceNumber, setPreviewInvoiceNumber] = useState('TB-PREVIEW');
  const invoiceRef = useRef();

  const grossValue = items.reduce((sum, item) => sum + item.amount, 0);
  const netValue = grossValue - discount + additionalCharges;
  const cgst = billType === 'B2B' ? netValue * 0.09 : 0;
  const sgst = billType === 'B2B' ? netValue * 0.09 : 0;
  const totalAmount = netValue + cgst + sgst;

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    if (field === 'price' || field === 'qty') {
      newItems[index].amount = newItems[index].price * newItems[index].qty;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', price: 0, qty: 1, amount: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const getNextInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .ilike('invoice_number', 'TB-%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('Error fetching last invoice:', error);
        return 'TB-001';
      }

      if (!data || data.length === 0) {
        return 'TB-001';
      }

      // Extract number from TB-XXX format
      const lastInvoice = data[0].invoice_number;
      const lastNumber = parseInt(lastInvoice.replace('TB-', '')) || 0;
      const nextNumber = lastNumber + 1;
      
      // Format with leading zeros (TB-001, TB-002, etc.)
      return `TB-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return 'TB-001';
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const invoiceNumber = await getNextInvoiceNumber();
      
      // Update the preview with the actual invoice number
      setPreviewInvoiceNumber(invoiceNumber);
      
      const invoiceData = {
        invoiceNumber,
        invoiceDate: new Date(),
        orderNumber: `ORD${order.id}`,
        orderDate: order.created_at,
        customer: {
          name: order.customer_name,
          phone: order.contact,
          address: order.address,
          gstNumber: order.gst_number
        },
        billType,
        items,
        grossValue,
        netValue,
        discount,
        additionalCharges,
        cgst,
        sgst,
        totalAmount,
        amountInWords: numberToWords(totalAmount)
      };

      // Show preview if not already showing
      if (!showPreview) {
        setShowPreview(true);
      }
      
      // Wait for the preview to update with new invoice number
      await new Promise(resolve => setTimeout(resolve, 500));

      // Wait for fonts to load
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      // Additional wait to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get the invoice wrapper element
      const invoiceWrapper = invoiceRef.current.querySelector('.invoice-wrapper');
      const elementToCapture = invoiceWrapper || invoiceRef.current;

      const canvas = await html2canvas(elementToCapture, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,  // 210mm in pixels at 96 DPI
        height: 1123, // 297mm in pixels at 96 DPI
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.invoice-wrapper');
          if (clonedElement) {
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.transform = 'scale(1)';
            clonedElement.style.width = '210mm';
            clonedElement.style.minHeight = '297mm';
            clonedElement.style.maxWidth = '210mm';
            clonedElement.style.margin = '0';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add image to fill entire A4 page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      
      const pdfBlob = pdf.output('blob');

      let fileName = null;
      
      // Try to upload to Supabase Storage (optional)
      try {
        fileName = `invoices/${invoiceNumber.replace(/\//g, '_')}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('bills')
          .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (uploadError) {
          console.warn('Storage upload failed:', uploadError);
          fileName = null;
        }
      } catch (storageError) {
        console.warn('Storage not available:', storageError);
        fileName = null;
      }

      // Save invoice record
      const { error: insertError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          order_id: order.id,
          bill_type: billType,
          customer_name: order.customer_name,
          total_amount: totalAmount,
          invoice_data: invoiceData,
          pdf_path: fileName
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to save invoice: ${insertError.message}`);
      }

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'Completed',
          invoice_number: invoiceNumber
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Update error:', updateError);
      }

      // Download PDF
      pdf.save(`Invoice_${invoiceNumber.replace(/\//g, '_')}.pdf`);

      alert('Bill generated successfully!');
      if (onBillGenerated) onBillGenerated();
      onClose();
    } catch (error) {
      console.error('Error generating bill:', error);
      alert(`Error generating bill: ${error.message || 'Please try again.'}`);
    } finally {
      setGenerating(false);
    }
  };

  const invoiceData = {
    invoiceNumber: previewInvoiceNumber,
    invoiceDate: new Date(),
    orderNumber: `ORD${order.id}`,
    orderDate: order.created_at,
    customer: {
      name: order.customer_name,
      phone: order.contact,
      address: order.address,
      gstNumber: order.gst_number
    },
    billType,
    items,
    grossValue,
    netValue,
    discount,
    additionalCharges,
    cgst,
    sgst,
    totalAmount,
    amountInWords: numberToWords(totalAmount)
  };

  return (
    <div className="modal-overlay">
      <div className="bill-dialog-content">
        <div className="bill-dialog-header">
          <h2>{showPreview ? 'Invoice Preview' : 'Generate Bill'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!showPreview ? (
          <div className="bill-form">
            <div className="form-group">
              <label>Bill Type:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="B2B"
                    checked={billType === 'B2B'}
                    onChange={(e) => setBillType(e.target.value)}
                  />
                  B2B (with 18% GST)
                </label>
                <label>
                  <input
                    type="radio"
                    value="B2C"
                    checked={billType === 'B2C'}
                    onChange={(e) => setBillType(e.target.value)}
                  />
                  B2C (no GST)
                </label>
              </div>
            </div>

            <div className="items-section">
              <h3>Items</h3>
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                  />
                  <span className="item-amount">₹{item.amount.toFixed(2)}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="remove-item-btn">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className="add-item-btn">+ Add Item</button>
            </div>

            <div className="charges-section">
              <div className="form-group">
                <label>Discount:</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Additional Charges:</label>
                <input
                  type="number"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="bill-summary">
              <div className="summary-row">
                <span>Gross Value:</span>
                <span>₹{grossValue.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row">
                  <span>Discount:</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              {additionalCharges > 0 && (
                <div className="summary-row">
                  <span>Additional Charges:</span>
                  <span>₹{additionalCharges.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Net Value:</span>
                <span>₹{netValue.toFixed(2)}</span>
              </div>
              {billType === 'B2B' && (
                <>
                  <div className="summary-row">
                    <span>CGST (9%):</span>
                    <span>₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>SGST (9%):</span>
                    <span>₹{sgst.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowPreview(true)} className="preview-btn">
                Preview Bill
              </button>
              <button type="button" onClick={generatePDF} className="generate-btn" disabled={generating}>
                {generating ? 'Generating...' : 'Generate Bill'}
              </button>
            </div>
          </div>
        ) : (
          <div className="preview-section">
            <div ref={invoiceRef}>
              <TaxInvoice invoiceData={invoiceData} />
            </div>
            <div className="preview-actions">
              <button onClick={() => setShowPreview(false)} className="back-btn">
                Back to Edit
              </button>
              <button onClick={generatePDF} className="generate-btn" disabled={generating}>
                {generating ? 'Generating...' : 'Generate & Download PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
