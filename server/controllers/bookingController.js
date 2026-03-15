const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

exports.createBooking = async (req, res) => {
  try {
    const { flightId, seatId } = req.body;
    const userId = req.user.id; // from auth middleware

    // 1. Verify Seat Availability
    const { data: seat, error: seatError } = await supabase
      .from('seats')
      .select('status')
      .eq('id', seatId)
      .eq('flight_id', flightId)
      .single();

    if (seatError || !seat) {
      return res.status(404).json({ error: 'Seat not found on this flight' });
    }

    if (seat.status === 'Booked') {
      return res.status(400).json({ error: 'Seat has already been booked by someone else' });
    }

    // Generate unique reference
    const referenceId = `AB-${uuidv4().substring(0, 8).toUpperCase()}`;

    // 2. Insert into Bookings table
    const { data: newBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        reference_id: referenceId,
        user_id: userId,
        flight_id: flightId,
        seat_id: seatId,
        status: 'Pending', // will change to confirmed after payment
        payment_status: 'Pending'
      }])
      .select()
      .single();

    if (bookingError) {
      // Handle unique constraint error if multiple try to book simultaneously
      console.error('Booking insert error:', bookingError);
      return res.status(500).json({ error: 'Failed to create booking. Please try again.' });
    }

    // 3. Update seat status to 'Selected' (Holding it pending payment)
    await supabase
      .from('seats')
      .update({ status: 'Selected' })
      .eq('id', seatId);

    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // ensure user is requesting their own bookings (or is admin)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        flights (*, aircraft(*)),
        seats (seat_number, seat_type)
      `)
      .eq('user_id', userId)
      .order('booking_time', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get the booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Ensure authorized
    if (booking.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'Cancelled', payment_status: 'Refunded' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to cancel booking' });
    }

    // Release the seat
    await supabase
      .from('seats')
      .update({ status: 'Available' })
      .eq('id', booking.seat_id);

    res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
