const supabase = require('../config/supabase');

exports.searchFlights = async (req, res) => {
  try {
    const { source, destination, date } = req.query;

    let query = supabase
      .from('flights')
      .select(`
        *,
        aircraft:aircraft_id (name, model)
      `);

    if (source) {
      query = query.ilike('source', `%${source}%`);
    }
    
    if (destination) {
      query = query.ilike('destination', `%${destination}%`);
    }

    if (date) {
      // Assuming date is in 'YYYY-MM-DD' format
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte('departure_time', startOfDay).lte('departure_time', endOfDay);
    }

    const { data: flights, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch flights' });
    }

    res.json(flights);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getFlightDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: flight, error } = await supabase
      .from('flights')
      .select(`
        *,
        aircraft:aircraft_id (*)
      `)
      .eq('id', id)
      .single();

    if (error || !flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.json(flight);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
