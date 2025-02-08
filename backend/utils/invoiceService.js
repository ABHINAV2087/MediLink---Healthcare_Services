import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoice = (appointment, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    
    doc.pipe(writeStream);

    // Add invoice header
    doc.fontSize(20).text('MediLink Healthcare', { align: 'center' });
    doc.moveDown();
    
    // Add appointment details
    doc.fontSize(14).text(`Invoice for Appointment #${appointment._id}`);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    // Add patient information
    doc.text(`Patient Name: ${appointment.userId.name}`);
    doc.text(`Doctor Name: Dr. ${appointment.docId.name}`);
    doc.text(`Appointment Date: ${appointment.slotDate}`);
    doc.text(`Appointment Time: ${appointment.slotTime}`);
    doc.moveDown();
    
    // Add payment details
    doc.fontSize(14).text('Payment Details', { underline: true });
    doc.text(`Amount: ₹${appointment.amount}`);
    doc.text(`Payment ID: ${appointment.paymentId}`);
    doc.text(`Payment Date: ${new Date().toLocaleString()}`);
    
    doc.end();

    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
};