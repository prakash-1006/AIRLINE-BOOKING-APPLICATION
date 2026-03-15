import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Download, Calendar, MapPin, Plane } from 'lucide-react';

export default function Confirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${user.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch booking details');
        
        const allBookings = await response.json();
        const currentBooking = allBookings.find(b => b.id === bookingId);
        
        if (!currentBooking || currentBooking.payment_status !== 'Paid') {
             // If not paid, user shouldn't be here. Send back to dashboard.
             navigate('/dashboard');
             return;
        }

        setBooking(currentBooking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user.id, navigate]);

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flight-600"></div>
    </div>
  );

  if (!booking) return null; // handled by useEffect redirect

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-3xl w-full">
        
        {/* Success Header */}
        <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600">
                Your payment was successful and your e-ticket has been issued.
            </p>
        </div>

        {/* Boarding Pass */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 relative">
            {/* Cutout effects */}
            <div className="absolute left-0 top-1/2 -mt-4 w-8 h-8 bg-gray-50 rounded-full -ml-4 border-r border-gray-200"></div>
            <div className="absolute right-0 top-1/2 -mt-4 w-8 h-8 bg-gray-50 rounded-full -mr-4 border-l border-gray-200"></div>
            
            <div className="bg-flight-600 px-8 py-6 text-white flex justify-between items-center">
               <div>
                  <h2 className="text-2xl font-bold tracking-tight">Boarding Pass</h2>
                  <p className="opacity-80">Reference: {booking.reference_id}</p>
               </div>
               <Plane className="h-10 w-10 opacity-30 transform -rotate-45" />
            </div>

            <div className="p-8 border-b border-dashed border-gray-300 relative">
               <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
                  <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Passenger Name</p>
                      <p className="text-xl font-bold text-gray-900">{user.full_name}</p>
                  </div>
                  <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 text-left md:text-right">Flight Number</p>
                      <p className="text-xl font-bold text-gray-900 text-left md:text-right">{booking.flights.flight_number}</p>
                  </div>
               </div>

               <div className="flex items-center justify-between mb-8">
                  <div className="text-center w-1/3">
                      <p className="text-4xl font-extrabold text-flight-600 mb-1">
                         {booking.flights.source.substring(0, 3).toUpperCase()}
                      </p>
                      <p className="text-sm font-medium text-gray-600">{booking.flights.source}</p>
                      <p className="text-sm text-gray-500 mt-2">{new Date(booking.flights.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  
                  <div className="w-1/3 flex flex-col items-center justify-center">
                      <Plane className="text-flight-300 h-6 w-6 transform rotate-90 mb-2" />
                      <div className="w-full h-px bg-gray-300 relative">
                          <div className="absolute w-2 h-2 rounded-full bg-gray-400 -left-1 -top-[3px]"></div>
                          <div className="absolute w-2 h-2 rounded-full bg-flight-500 -right-1 -top-[3px]"></div>
                      </div>
                  </div>
                  
                  <div className="text-center w-1/3">
                      <p className="text-4xl font-extrabold text-flight-600 mb-1">
                         {booking.flights.destination.substring(0, 3).toUpperCase()}
                      </p>
                      <p className="text-sm font-medium text-gray-600">{booking.flights.destination}</p>
                      <p className="text-sm text-gray-500 mt-2">{new Date(booking.flights.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
               </div>
            </div>

            <div className="bg-gray-50 p-8 flex justify-between items-center">
                <div>
                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Seat</p>
                   <p className="text-2xl font-bold text-gray-900">{booking.seats.seat_number}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                   <p className="text-lg font-bold text-gray-900">{new Date(booking.flights.departure_time).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                   <p className="text-lg font-bold text-green-600">CONFIRMED</p>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
                to="/dashboard"
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-flight-600 hover:bg-flight-700 shadow-sm transition-colors"
            >
                View My Dashboard
            </Link>
            <button 
                onClick={() => window.print()}
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
                <Download className="h-5 w-5 mr-2 text-gray-500" />
                Download Ticket
            </button>
        </div>

      </div>
    </div>
  );
}
