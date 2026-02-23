import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateInvoice = (order) => {
    const doc = new jsPDF();

    // Add Brand Header
    doc.setFillColor(30, 64, 175); // Blue color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('COCOON LAUNDRY', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('PREMIUM CARE FOR YOUR CLOTHES', 105, 30, { align: 'center' });

    // Customer & Order Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`INVOICE: #${order.orderId}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`${order.customerName}`, 20, 78);
    doc.text(`Contact: ${order.mobileNumber}`, 20, 84);
    doc.text(`Address: ${order.address?.street}, ${order.address?.city}`, 20, 90);

    // Table
    const tableData = order.items?.map(item => [
        item.service?.name || 'Laundry Service',
        item.itemName || '-',
        item.quantity,
        `Rs. ${item.service?.pricePerUnit || 0}`,
        `Rs. ${item.quantity * (item.service?.pricePerUnit || 0)}`
    ]) || [];

    // Add row for weighted bulk if applicable
    if (order.orderType === 'Bulk-Weighted') {
        tableData.push([
            'Bulk-Weighted Service',
            '-',
            `${order.weight} kg`,
            'Variable',
            `Rs. ${order.totalPrice}`
        ]);
    }

    doc.autoTable({
        startY: 100,
        head: [['Service', 'Item', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL AMOUNT: Rs. ${order.totalPrice}`, 140, finalY + 10);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing Cocoon!', 105, 280, { align: 'center' });

    doc.save(`Invoice_${order.orderId}.pdf`);
};
