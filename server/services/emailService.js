'use strict';
// shortcut: inline HTML templates, upgrade to templating engine for complex layouts
const EMAIL_FROM = process.env.EMAIL_FROM || 'HotelPro <noreply@hotelpro.com>';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER) {
    console.warn('[emailService] EMAIL_USER not configured — emails will be skipped');
    return null;
  }
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    return transporter;
  } catch (err) {
    console.warn('[emailService] nodemailer not available:', err.message);
    return null;
  }
}

async function send(to, subject, html) {
  const t = getTransporter();
  if (!t) return { skipped: true };
  try {
    const info = await t.sendMail({ from: EMAIL_FROM, to, subject, html });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[emailService] Failed to send email to', to, ':', err.message);
    return { success: false, error: err.message };
  }
}

async function sendBookingConfirmation(guest, booking, room) {
  const subject = `HotelPro Booking Confirmation #${booking.bookingReference}`;
  const html = `
    <h2>Booking Confirmed ✓</h2>
    <p>Dear ${guest.name || guest.guestName},</p>
    <p>Your reservation at <strong>HotelPro Grand Resort</strong> is confirmed.</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><td>Booking Ref</td><td>#${booking.bookingReference}</td></tr>
      <tr><td>Room</td><td>${booking.roomNumber} — ${booking.roomCategory || room.category}</td></tr>
      <tr><td>Check-in</td><td>${booking.checkInDate}</td></tr>
      <tr><td>Check-out</td><td>${booking.checkOutDate}</td></tr>
      <tr><td>Nights</td><td>${booking.totalNights}</td></tr>
      <tr><td>Total Amount</td><td>$${booking.totalAmount}</td></tr>
    </table>
    <p>Thank you for choosing HotelPro!</p>`;
  return send(guest.email || guest.guestEmail, subject, html);
}

async function sendCancellationNotice(guest, booking) {
  const subject = `HotelPro Cancellation Notice #${booking.bookingReference}`;
  const html = `
    <h2>Booking Cancelled</h2>
    <p>Dear ${guest.name || guest.guestName},</p>
    <p>Your reservation <strong>#${booking.bookingReference}</strong> has been cancelled.</p>
    ${booking.refundAmount ? `<p>Refund of <strong>$${booking.refundAmount}</strong> will be processed shortly.</p>` : ''}
    <p>We hope to welcome you again soon.</p>`;
  return send(guest.email || guest.guestEmail, subject, html);
}

async function sendCheckInReminder(guest, booking) {
  const subject = `HotelPro Check-in Reminder — Tomorrow!`;
  const html = `
    <h2>Your Stay is Tomorrow!</h2>
    <p>Dear ${guest.name || guest.guestName},</p>
    <p>Just a reminder: your check-in at <strong>HotelPro Grand Resort</strong> is tomorrow.</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><td>Booking Ref</td><td>#${booking.bookingReference}</td></tr>
      <tr><td>Room</td><td>${booking.roomNumber} (${booking.roomCategory})</td></tr>
      <tr><td>Check-in</td><td>${booking.checkInDate}</td></tr>
    </table>
    <p>We look forward to your arrival!</p>`;
  return send(guest.email || guest.guestEmail, subject, html);
}

async function sendInvoiceEmail(guest, invoiceData) {
  const subject = `HotelPro Invoice — ${invoiceData.invoiceNumber}`;
  const html = `
    <h2>Your Invoice — ${invoiceData.invoiceNumber}</h2>
    <p>Dear ${guest.name || guest.guestName}, please find your invoice details below.</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><td>Booking Ref</td><td>${invoiceData.bookingReference}</td></tr>
      <tr><td>Check-in</td><td>${invoiceData.checkInDate}</td></tr>
      <tr><td>Check-out</td><td>${invoiceData.checkOutDate}</td></tr>
      <tr><td>Room</td><td>${invoiceData.roomNumber} (${invoiceData.roomCategory})</td></tr>
      <tr><td>Subtotal</td><td>$${invoiceData.subtotal}</td></tr>
      <tr><td>GST (18%)</td><td>$${invoiceData.gst}</td></tr>
      <tr><td><strong>Total</strong></td><td><strong>$${invoiceData.total}</strong></td></tr>
      <tr><td>Payment Status</td><td>${invoiceData.paymentStatus}</td></tr>
    </table>
    <p>Thank you for staying at HotelPro Grand Resort.</p>`;
  return send(guest.email || guest.guestEmail, subject, html);
}

module.exports = { sendBookingConfirmation, sendCancellationNotice, sendCheckInReminder, sendInvoiceEmail };
