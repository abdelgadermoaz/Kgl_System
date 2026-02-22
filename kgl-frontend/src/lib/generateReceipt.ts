import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReceipt = (sale: any) => {
  const doc = new jsPDF();
  
  // 1. Header Section
  doc.setFontSize(22);
  doc.setTextColor(2, 132, 199); // KGL Sky Blue
  doc.text('KGL Stock & Sales Management', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Kampala HQ, Uganda', 14, 30);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`, 14, 36);
  doc.text(`Receipt #: ${sale._id.slice(-6).toUpperCase()}`, 14, 42);

  // 2. Buyer Information
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Customer: ${sale.buyerName}`, 14, 55);
  doc.text(`Sale Type: ${sale.saleType}`, 14, 62);
  
  if (sale.saleType === 'CREDIT' && sale.nationalIdNIN) {
    doc.text(`NIN: ${sale.nationalIdNIN}`, 14, 69);
  }

  // 3. Transaction Table
  autoTable(doc, {
    startY: 75,
    head: [['Produce', 'Quantity (Kg)', 'Unit Price (UGX)', 'Total (UGX)']],
    body: [
      [
        sale.produceName, 
        sale.tonnageKg.toLocaleString(), 
        sale.unitPriceUgx.toLocaleString(), 
        sale.totalAmountUgx.toLocaleString()
      ]
    ],
    theme: 'striped',
    headStyles: { fillColor: [2, 132, 199] },
    styles: { fontSize: 11, cellPadding: 5 }
  });

  // 4. Financials Summary
  // @ts-ignore - jspdf-autotable adds lastAutoTable dynamically
  const finalY = doc.lastAutoTable.finalY || 100;
  
  doc.setFontSize(11);
  doc.text(`Amount Paid: UGX ${sale.amountPaidUgx.toLocaleString()}`, 14, finalY + 15);
  
  if (sale.amountDueUgx > 0) {
    doc.setTextColor(234, 88, 12); // Orange for debt
    doc.text(`Balance Due: UGX ${sale.amountDueUgx.toLocaleString()}`, 14, finalY + 23);
  }

  // 5. Status Stamp
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  if (sale.saleType === 'CASH' || sale.creditStatus === 'PAID') {
    doc.setTextColor(22, 163, 74); // Green
    doc.text('STATUS: PAID IN FULL', 14, finalY + 35);
  } else {
    doc.setTextColor(234, 88, 12); // Orange
    doc.text(`STATUS: ${sale.creditStatus}`, 14, finalY + 35);
  }

  // 6. Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  // Instantly trigger the download
  const cleanName = sale.buyerName.replace(/\s+/g, '_');
  doc.save(`KGL_Receipt_${cleanName}.pdf`);
};