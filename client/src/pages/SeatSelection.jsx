import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Info, ArrowRight } from 'lucide-react';

export default function SeatSelection() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    const fetchFlightAndSeats = async () => {
      try {
        const flightRes = await fetch(`http://localhost:5000/api/flights/${flightId}`);
        if (!flightRes.ok) throw new Error('Failed to fetch flight details');
        const flightData = await flightRes.json();
        setFlight(flightData);

        const seatsRes = await fetch(`http://localhost:5000/api/seats/${flightId}`);
        if (!seatsRes.ok) throw new Error('Failed to fetch seats');
        const seatsData = await seatsRes.json();
        setSeats(seatsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightAndSeats();
  }, [flightId]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'Available') return;
    setSelectedSeat(seat.id === selectedSeat?.id ? null : seat);
  };

  const handleContinue = async () => {
    if (!selectedSeat) return;
    
    setHolding(true);
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          flightId,
          seatId: selectedSeat.id
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reserve seat');
      }

      // Important: Navigate to checkout with the created pending booking ID
      navigate(`/checkout/${data.id}`);
    } catch (err) {
      setError(err.message);
      // Refresh seats in case it was taken
      const seatsRes = await fetch(`http://localhost:5000/api/seats/${flightId}`);
      if (seatsRes.ok) setSeats(await seatsRes.json());
      setSelectedSeat(null);
    } finally {
      setHolding(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flight-600"></div>
    </div>
  );

  if (error && !flight) return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 text-red-700 rounded-lg text-center">
        Error: {error}
    </div>
  );

  // Group seats into rows based on seat_number (e.g. '1A', '1B' -> Row 1)
  const rows = {};
  seats.forEach(seat => {
      const rowMatch = seat.seat_number.match(/\d+/);
      if (rowMatch) {
          const rowNum = rowMatch[0];
          if (!rows[rowNum]) rows[rowNum] = [];
          rows[rowNum].push(seat);
      }
  });

  // Sort seats within rows alphabetically
  Object.keys(rows).forEach(rowNum => {
      rows[rowNum].sort((a, b) => a.seat_number.localeCompare(b.seat_number));
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Select Your Seat</h1>
        <p className="text-gray-600 mt-2">
          {flight?.source} to {flight?.destination} • {new Date(flight?.departure_time).toLocaleDateString()}
        </p>
      </div>

      {error && selectedSeat && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
           <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Plane Body / Seat Map */}
        <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
             
             {/* Plane Nose decorative */}
             <div className="w-64 h-32 bg-gray-100 rounded-t-full border-t border-l border-r border-gray-300 flex items-center justify-center mb-8 relative">
                <div className="w-40 h-20 bg-gray-200 rounded-t-full absolute bottom-0 opacity-50"></div>
                <div className="w-16 h-8 bg-blue-100 rounded-t-full absolute bottom-4 border border-blue-200"></div>
             </div>

             {/* Seat Legend */}
             <div className="w-full max-w-sm mb-10 flex justify-between px-4">
                 <div className="flex items-center">
                     <div className="w-6 h-6 rounded-md bg-white border-2 border-gray-300 mr-2"></div>
                     <span className="text-sm text-gray-600">Available</span>
                 </div>
                 <div className="flex items-center">
                     <div className="w-6 h-6 rounded-md bg-flight-600 mr-2 shadow-sm relative overflow-hidden">
                       <div className="absolute top-1 left-1 right-1 h-1 bg-white opacity-30 rounded-full"></div>
                     </div>
                     <span className="text-sm text-gray-600">Selected</span>
                 </div>
                 <div className="flex items-center">
                     <div className="w-6 h-6 rounded-md bg-gray-200 border border-gray-300 mr-2 flex items-center justify-center overflow-hidden">
                       <div className="w-full h-px bg-gray-400 transform rotate-45"></div>
                     </div>
                     <span className="text-sm text-gray-600">Unavailable</span>
                 </div>
             </div>

             {/* Dynamic Seat Grid */}
             <div className="bg-gray-50 border-l-2 border-r-2 border-gray-300 px-8 py-8 rounded-lg relative min-w-[320px]">
                {Object.keys(rows).sort((a,b)=>Number(a)-Number(b)).map(rowNum => {
                    const rowSeats = rows[rowNum];
                    // Find middle point to insert aisle
                    const halfway = Math.ceil(rowSeats.length / 2);
                    
                    return (
                        <div key={rowNum} className="flex justify-between items-center mb-4">
                            {/* Left side seats */}
                            <div className="flex gap-2">
                                {rowSeats.slice(0, halfway).map(seat => (
                                    <SeatButton 
                                        key={seat.id} 
                                        seat={seat} 
                                        isSelected={selectedSeat?.id === seat.id} 
                                        onClick={() => handleSeatClick(seat)} 
                                    />
                                ))}
                            </div>
                            
                            {/* Aisle identifier */}
                            <div className="w-8 text-center text-gray-400 font-medium text-sm flex items-center justify-center py-2 bg-gray-100 rounded-sm mx-4 shadow-inner">
                                {rowNum}
                            </div>
                            
                            {/* Right side seats */}
                            <div className="flex gap-2">
                                {rowSeats.slice(halfway).map(seat => (
                                    <SeatButton 
                                        key={seat.id} 
                                        seat={seat} 
                                        isSelected={selectedSeat?.id === seat.id} 
                                        onClick={() => handleSeatClick(seat)} 
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:w-96 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-flight-500" />
                    Selected Passengers
                </h3>
                
                {selectedSeat ? (
                    <div className="bg-flight-50 border border-flight-100 rounded-lg p-4 flex justify-between items-center mb-6">
                        <div>
                            <p className="font-semibold text-gray-900">{user?.full_name || 'Passenger 1'}</p>
                            <p className="text-sm text-gray-500">Adult</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-flight-600 text-xl">{selectedSeat.seat_number}</p>
                            <p className="text-xs text-gray-500">{selectedSeat.seat_type}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 mb-6">
                        Click on an available seat in the map to select it
                    </div>
                )}
                
                <div className="border-t border-gray-100 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Base Fare</span>
                        <span className="font-medium">${flight?.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Taxes & Fees</span>
                        <span className="font-medium">$45.00</span>
                    </div>
                    {selectedSeat && (
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600 text-sm italic">{selectedSeat.seat_type} Seat Selection</span>
                            <span className="font-medium text-sm text-green-600">Included</span>
                        </div>
                    )}
                    <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-flight-600">
                            ${(Number(flight?.price || 0) + 45).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md flex items-start mb-6">
                    <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                        Choosing a seat now guarantees your placement. Free seat selection is subject to availability at check-in.
                    </p>
                </div>

                <button
                    onClick={handleContinue}
                    disabled={!selectedSeat || holding}
                    className={`w-full flex justify-center items-center py-3 px-4 rounded-md font-medium text-white transition-colors shadow-md ${
                        !selectedSeat || holding 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-flight-600 hover:bg-flight-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flight-500'
                    }`}
                >
                    {holding ? 'Reserving...' : 'Continue to Payment'}
                    {!holding && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual seats
function SeatButton({ seat, isSelected, onClick }) {
    const isAvailable = seat.status === 'Available';
    
    let baseClasses = "relative w-10 h-10 sm:w-12 sm:h-12 rounded-t-xl rounded-b-md border-2 flex items-center justify-center transition-all ";
    
    if (isSelected) {
        baseClasses += "bg-flight-600 border-flight-700 shadow-md transform scale-105 z-10";
    } else if (isAvailable) {
        baseClasses += "bg-white border-gray-300 hover:border-flight-400 hover:shadow-sm cursor-pointer";
    } else {
        baseClasses += "bg-gray-200 border-gray-300 cursor-not-allowed overflow-hidden";
    }

    return (
        <button 
            disabled={!isAvailable}
            onClick={onClick}
            className={baseClasses}
            title={`${seat.seat_number} - ${seat.seat_type} (${seat.status})`}
        >
            {/* Top cushion visual */}
            <div className={`absolute top-0 w-3/4 h-2 rounded-b-full ${isSelected ? 'bg-flight-500' : isAvailable ? 'bg-gray-100' : 'bg-gray-300'}`}></div>
            
            <span className={`text-xs font-medium z-10 ${isSelected ? 'text-white' : isAvailable ? 'text-gray-700' : 'text-gray-400'}`}>
                {seat.seat_number}
            </span>

            {/* Cross out for unavailable */}
            {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-gray-400 transform rotate-45"></div>
                </div>
            )}
        </button>
    );
}
