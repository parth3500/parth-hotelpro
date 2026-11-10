class InvoiceService {
  generateInvoiceNumber() {
    const prefix = 'INV';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${timestamp}-${random}`;
  }

  calculateBreakdown(baseAmount, discountRate = 0) {
    const subtotal = Number(baseAmount.toFixed(2));
    const discount = Number((subtotal * discountRate).toFixed(2));
    const taxableAmount = subtotal - discount;
    const taxRate = 0.10; // 10% hospitality tax
    const tax = Number((taxableAmount * taxRate).toFixed(2));
    const serviceFeeRate = 0.05; // 5% service fee
    const serviceFee = Number((taxableAmount * serviceFeeRate).toFixed(2));
    const total = Number((taxableAmount + tax + serviceFee).toFixed(2));

    return {
      subtotal,
      discount,
      tax,
      serviceFee,
      total
    };
  }

  generateInvoiceDocument({ booking, payment }) {
    return {
      invoiceNumber: payment.invoiceNumber,
      issuedDate: payment.createdAt || new Date(),
      bookingReference: booking.bookingReference,
      guest: {
        name: booking.guestName,
        email: booking.guestEmail,
        phone: booking.guestPhone
      },
      room: {
        number: booking.roomNumber,
        category: booking.roomCategory,
        checkIn: booking.checkInDate,
        checkOut: booking.checkOutDate,
        nights: booking.totalNights
      },
      financials: {
        subtotal: payment.subtotal,
        discount: payment.discount,
        tax: payment.tax,
        serviceFee: payment.serviceFee,
        totalPaid: payment.amount,
        status: payment.status
      },
      hotel: {
        name: 'HotelPro Grand Resort',
        address: '100 Oceanview Boulevard, Paradise Bay',
        contact: 'contact@hotelpro.com'
      }
    };
  }
}

module.exports = new InvoiceService();
