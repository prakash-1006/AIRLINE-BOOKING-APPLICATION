import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plane, Calendar, MapPin, XCircle, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user.id]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
        return;
    }
    
    setCancelLoading(bookingId);
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flight-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.full_name}</h1>
        <p className="text-gray-600 mt-2">Manage your flights and bookings.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            Error: {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
           <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
           <h3 className="text-xl font-medium text-gray-900">No bookings yet</h3>
           <p className="text-gray-500 mt-2 mb-6">Looks like you haven't booked any flights.</p>
           <Link to="/" className="inline-flex px-6 py-3 bg-flight-600 hover:bg-flight-700 text-white font-medium rounded-md transition-colors">
               Search Flights
           </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Trips</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {bookings.map(booking => {
                const isCancelled = booking.status === 'Cancelled';
                const isPaid = booking.payment_status === 'Paid';
                const isPending = booking.status === 'Pending' && booking.payment_status === 'Pending';
                
                return (
                <div key={booking.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${isCancelled ? 'border-red-200 opacity-70' : 'border-gray-100 hover:shadow-md transition-shadow'}`}>
                    
                    <div className={`px-6 py-4 flex justify-between items-center text-white ${isCancelled ? 'bg-red-500' : isPending ? 'bg-yellow-500' : 'bg-flight-600'}`}>
                        <div>
                            <span className="font-bold tracking-wide">Ref: {booking.reference_id}</span>
                            <span className="mx-2 opacity-60">|</span>
                            <span className="text-sm font-medium">
                                Booked on {new Date(booking.booking_time).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white ${isCancelled ? 'text-red-700' : isPending ? 'text-yellow-700' : 'text-flight-700'}`}>
                                {booking.status}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6 flex flex-col md:flex-row gap-6 justify-between border-b border-gray-100">
                        {/* Flight Info */}
                        <div className="flex-1">
                            <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                <Plane className="w-4 h-4 mr-1" /> Flight Details
                            </h4>
                            <div className="flex items-center space-x-6">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 flex items-center">
                                        {booking.flights.source} 
                                        <ArrowRight className="w-5 h-5 mx-2 text-gray-400" /> 
                                        {booking.flights.destination}
                                    </p>
                                    <p className="text-gray-600 mt-1 flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(booking.flights.departure_time).toLocaleDateString()} at {new Date(booking.flights.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Flight {booking.flights.flight_number} • {booking.flights.aircraft?.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Seat Info */}
                        <div className="md:w-48 bg-gray-50 rounded-lg p-4 flex flex-col justify-center items-center">
                            <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Assigned Seat</span>
                            <span className="text-3xl font-bold text-gray-900">{booking.seats.seat_number}</span>
                            <span className="text-sm text-gray-600">{booking.seats.seat_type}</span>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center text-sm">
                            <Info className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                                Payment Status: <strong className={isPaid ? 'text-green-600' : isCancelled ? 'text-red-600' : 'text-yellow-600'}>{booking.payment_status}</strong>
                            </span>
                        </div>
                        
                        <div className="flex gap-3">
                            {isPending && (
                                <Link 
                                    to={`/checkout/${booking.id}`}
                                    className="px-4 py-2 bg-flight-600 text-white text-sm font-medium rounded-md hover:bg-flight-700 transition-colors"
                                >
                                    Complete Payment
                                </Link>
                            )}

                            {isPaid && !isCancelled && (
                                <Link 
                                    to={`/confirmation/${booking.id}`}
                                    className="px-4 py-2 border border-flight-600 text-flight-600 text-sm font-medium rounded-md hover:bg-flight-50 transition-colors"
                                >
                                    View Ticket
                                </Link>
                            )}

                            {!isCancelled && (
                                <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    disabled={cancelLoading === booking.id}
                                    className={`flex items-center px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors ${cancelLoading === booking.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <XCircle className="w-4 h-4 mr-1.5" />
                                    {cancelLoading === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}

