const supabase = require('../config/supabase');

exports.getSeatsByFlight = async (req, res) => {
  try {
    const { flightId } = req.params;

    const { data: seats, error } = await supabase
      .from('seats')
      .select('*')
      .eq('flight_id', flightId)
      .order('seat_number', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch seats' });
    }

    res.json(seats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Optional: Temporary hold seat to prevent race conditions before payment
exports.holdSeat = async (req, res) => {
    try {
        const { seatId } = req.body;
        // In a real production app we'd use a transaction or a specialized distributed lock
        // For simplicity, we check if it's available and update to 'Selected'
        const { data: currentSeat, error: fetchError } = await supabase
            .from('seats')
            .select('status')
            .eq('id', seatId)
            .single();
            
        if(fetchError || !currentSeat) {
             return res.status(404).json({ error: 'Seat not found' });
        }
        
        if (currentSeat.status !== 'Available') {
             return res.status(400).json({ error: 'Seat is no longer available' });
        }
        
        const { data: updatedSeat, error: updateError } = await supabase
            .from('seats')
            .update({ status: 'Selected' })
            .eq('id', seatId)
            .select()
            .single();
            
        if (updateError) {
             return res.status(500).json({ error: 'Failed to hold seat' });
        }
        
        res.json({ message: 'Seat held successfully', seat: updatedSeat });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}
