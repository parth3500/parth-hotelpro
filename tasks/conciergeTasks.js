const Notification = require('../server/models/Notification');
const emailService = require('../server/services/emailService');

class ProcessGuestInquiryTask {
  static get taskName() {
    return 'ProcessGuestInquiryTask';
  }

  static async execute({ inquiryText, guestName = 'Guest' }) {
    const text = (inquiryText || '').toLowerCase();
    let reply = '';
    let category = 'general';

    if (text.includes('check-in') || text.includes('checkin') || text.includes('check out') || text.includes('checkout')) {
      reply = `Standard check-in begins at 2:00 PM and check-out is by 11:00 AM. Early check-in and express check-out are available upon request through the front desk.`;
      category = 'front_desk';
    } else if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet')) {
      reply = `Complimentary high-speed Wi-Fi is available property-wide. Connect to 'HotelPro-Guest' and authenticate using your room number and last name.`;
      category = 'technology';
    } else if (text.includes('breakfast') || text.includes('dinner') || text.includes('restaurant') || text.includes('food')) {
      reply = `Our signature restaurant 'The Azure Terrace' serves breakfast buffet from 6:30 AM to 10:30 AM, lunch from 12:00 PM to 3:00 PM, and fine dining dinner until 11:00 PM. 24/7 room service is also available.`;
      category = 'dining';
    } else if (text.includes('pool') || text.includes('spa') || text.includes('gym') || text.includes('fitness')) {
      reply = `The infinity pool and fitness center are open daily from 6:00 AM to 10:00 PM. Spa appointments can be scheduled anytime via your guest dashboard or dial 0 from your room.`;
      category = 'wellness';
    } else if (text.includes('parking') || text.includes('valet')) {
      reply = `Secure valet parking is complimentary for all registered guests. Self-parking is located in our lower level garage.`;
      category = 'transport';
    } else if (text.includes('cancel') || text.includes('refund')) {
      reply = `Reservations cancelled at least 24 hours prior to scheduled check-in qualify for a 100% full refund. Cancellations within 24 hours incur a modest 20% adjustment.`;
      category = 'policy';
    } else {
      reply = `Thank you for contacting HotelPro Guest Services, ${guestName}! Our concierge desk is available 24/7 to assist with your stay, dining reservations, and transportation.`;
      category = 'general';
    }

    return {
      success: true,
      query: inquiryText,
      reply,
      category,
      resolvedAt: new Date()
    };
  }
}

class SendBookingConfirmationNotificationTask {
  static get taskName() {
    return 'SendBookingConfirmationNotificationTask';
  }

  static async execute({ booking }) {
    if (!booking) {
      throw new Error('Booking object is required.');
    }
    const emailResult = await emailService.sendBookingConfirmation(booking, booking.guestEmail);
    return {
      success: true,
      notificationSent: true,
      emailResult
    };
  }
}

class RecommendAmenitiesTask {
  static get taskName() {
    return 'RecommendAmenitiesTask';
  }

  static async execute({ roomCategory, nightsCount = 1, guestsCount = 2 }) {
    const recommendations = [];

    if (roomCategory === 'Suite' || roomCategory === 'Executive') {
      recommendations.push({
        title: 'Complimentary Executive Lounge Access',
        description: 'Enjoy panoramic sunset views, private bar service, and complimentary hors d\'oeuvres daily from 5 to 7 PM.',
        price: 'Included'
      });
      recommendations.push({
        title: 'Spa & Wellness Sanctuary Pass',
        description: 'Indulge in hydrotherapy, steam rooms, and aromatherapy massages.',
        price: '$45 / person'
      });
    }

    if (nightsCount >= 3) {
      recommendations.push({
        title: 'Gourmet Sunset Dinner Experience',
        description: 'Chef\'s 5-course tasting menu paired with curated sommelier selections.',
        price: '$85 / person'
      });
    }

    recommendations.push({
      title: 'Airport Luxury Transfer',
      description: 'Private chauffeur service directly to/from international airport terminals.',
      price: '$50 flat rate'
    });

    return {
      success: true,
      roomCategory,
      totalRecommendations: recommendations.length,
      recommendations
    };
  }
}

module.exports = {
  ProcessGuestInquiryTask,
  SendBookingConfirmationNotificationTask,
  RecommendAmenitiesTask
};
