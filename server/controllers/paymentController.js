const supabase = require('../config/supabase');

exports.processPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;
    const userId = req.user.id; // from auth middleware

    // Validate request
    if (!bookingId || !amount || !paymentMethod) {
         return res.status(400).json({ error: 'Missing payment details' });
    }

    // 1. Fetch the booking to verify it exists, belongs to user, and is 'Pending'
    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
        
    if (fetchError || !booking) {
         return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.user_id !== userId) {
         return res.status(403).json({ error: 'Unauthorized payment attempt' });
    }

    if (booking.payment_status === 'Paid') {
         return res.status(400).json({ error: 'Booking is already paid' });
    }
    
    if (booking.status === 'Cancelled') {
         return res.status(400).json({ error: 'Cannot pay for a cancelled booking' });
    }

    // --- MOCK PAYMENT PROCESSING ---
    console.log(`Processing payment of ${amount} via ${paymentMethod} for booking ${bookingId}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const paymentSuccess = true; // In a real app, this depends on the payment gateway response

    if (!paymentSuccess) {
         return res.status(400).json({ error: 'Payment failed' });
    }
    // --- END MOCK PAYMENT ---

    // 2. Update Booking Status -> Confirmed & Paid
    const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'Confirmed', payment_status: 'Paid' })
        .eq('id', bookingId)
        .select()
        .single();

    if (updateError) {
         console.error('Failed to update booking status after payment:', updateError);
         return res.status(500).json({ error: 'Payment successful, but failed to confirm booking. Please contact support.' });
    }
    
    // 3. Update Seat Status -> Booked
    const { error: seatUpdateError } = await supabase
        .from('seats')
        .update({ status: 'Booked' })
        .eq('id', booking.seat_id);
        
    if (seatUpdateError) {
         console.error('Failed to update seat status to Booked:', seatUpdateError);
         // Note: Booking is confirmed, but seat might look stuck in 'Selected'. 
         // A cron job or manual admin sync could fix this in a real system.
    }

    res.json({ message: 'Payment successful', booking: updatedBooking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
