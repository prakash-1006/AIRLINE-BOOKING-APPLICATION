import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Clock, ArrowRight } from 'lucide-react';

export default function SearchResults() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const source = queryParams.get('source');
  const destination = queryParams.get('destination');
  const date = queryParams.get('date');

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const url = new URL('http://localhost:5000/api/flights');
        if (source) url.searchParams.append('source', source);
        if (destination) url.searchParams.append('destination', destination);
        if (date) url.searchParams.append('date', date);

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch flights');
        
        const data = await response.json();
        setFlights(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [location.search]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getDuration = (start, end) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffHours = (endTime - startTime) / (1000 * 60 * 60);
    return `${Math.floor(diffHours)}h ${Math.round((diffHours % 1) * 60)}m`;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flight-600"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
        Error: {error}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flight Results</h1>
          <p className="text-gray-600 mt-2 flex items-center">
            {source || 'Any'} <ArrowRight className="h-4 w-4 mx-2" /> {destination || 'Any'} 
            <span className="mx-2">•</span> 
            {date || 'Any Date'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 sm:mt-0 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Modify Search
        </button>
      </div>

      {flights.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
           <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
           <h3 className="text-xl font-medium text-gray-900">No flights found</h3>
           <p className="text-gray-500 mt-2">Try adjusting your search criteria and try again.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {flights.map(flight => (
            <div key={flight.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col sm:flex-row">
              {/* Flight Details */}
              <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b sm:border-b-0 sm:border-r border-gray-100">
                <div className="flex flex-col sm:w-1/3">
                   <span className="text-2xl font-bold text-gray-900">{formatTime(flight.departure_time)}</span>
                   <span className="text-gray-500 font-medium">{flight.source}</span>
                   <span className="text-xs text-gray-400 mt-1">{flight.flight_number}</span>
                </div>
                
                <div className="flex flex-col items-center justify-center py-4 sm:py-0 sm:w-1/3">
                   <span className="text-xs text-gray-500 mb-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {getDuration(flight.departure_time, flight.arrival_time)}
                   </span>
                   <div className="w-full flex items-center justify-center">
                      <div className="h-px bg-gray-300 w-full flex-1"></div>
                      <Plane className="h-5 w-5 text-flight-500 mx-2 transform rotate-90" />
                      <div className="h-px bg-gray-300 w-full flex-1"></div>
                   </div>
                   <span className="text-xs text-flight-600 font-medium mt-1">Direct</span>
                </div>
                
                <div className="flex flex-col sm:w-1/3 sm:items-end text-left sm:text-right">
                   <span className="text-2xl font-bold text-gray-900">{formatTime(flight.arrival_time)}</span>
                   <span className="text-gray-500 font-medium">{flight.destination}</span>
                   <span className="text-xs text-gray-400 mt-1">{flight.aircraft?.name} ({flight.aircraft?.model})</span>
                </div>
              </div>
              
              {/* Price and Action */}
              <div className="p-6 bg-gray-50 sm:w-48 flex flex-col justify-center items-center">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price per adult</span>
                <span className="text-3xl font-bold text-gray-900 mb-4">${flight.price}</span>
                <button
                  onClick={() => navigate(`/seat-selection/${flight.id}`)}
                  className="w-full py-2 px-4 bg-flight-600 hover:bg-flight-700 text-white rounded-md font-medium transition-colors text-center shadow-sm"
                >
                  Select Seats
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
