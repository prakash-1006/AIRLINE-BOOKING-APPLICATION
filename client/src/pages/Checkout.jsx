import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Mock payment details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${user.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch booking details');
        
        const allBookings = await response.json();
        // Find the specific pending booking created in previous step
        const currentBooking = allBookings.find(b => b.id === bookingId);
        
        if (!currentBooking) {
            throw new Error('Booking not found or you are not authorized');
        }
        
        if (currentBooking.status === 'Confirmed' && currentBooking.payment_status === 'Paid') {
            navigate(`/confirmation/${bookingId}`);
            return;
        }

        setBooking(currentBooking);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user.id, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    // Basic mock validation
    if (cardNumber.length < 15 || cvv.length < 3 || expiry.length < 5) {
        setProcessing(false);
        return setError('Please enter valid mock payment details.');
    }

    try {
      const response = await fetch('http://localhost:5000/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: parseFloat(booking.flights.price) + 45, // Including 45 mock tax
          paymentMethod: 'Credit Card (Mock)'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Payment success, go to confirmation
      navigate(`/confirmation/${booking.id}`);
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flight-600"></div>
    </div>
  );

  if (error && !booking) return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 text-red-700 rounded-lg text-center">
        Error: {error}
    </div>
  );

  const totalAmount = (Number(booking?.flights?.price || 0) + 45).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-2 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
          Seat {booking?.seats?.seat_number} reserved. Complete payment to confirm your booking.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Payment Form */}
        <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-flight-600" />
                Payment Details
             </h2>

             {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                   <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

             <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex items-start">
                 <ShieldCheck className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                 <p className="text-sm text-blue-800">
                     This is a mock payment gateway for demonstration. Real transactions are not processed. Enter any details to proceed.
                 </p>
             </div>

             <form onSubmit={handlePayment} className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                        type="text"
                        required
                        className="focus:ring-flight-500 focus:border-flight-500 block w-full py-3 px-4 border-gray-300 rounded-md border"
                        placeholder="John Doe"
                        defaultValue={user?.full_name}
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            required
                            maxLength="19"
                            className="focus:ring-flight-500 focus:border-flight-500 block w-full pl-10 py-3 border-gray-300 rounded-md border font-mono tracking-wide"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={(e) => {
                                // Simple mock formatting
                                let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                let matches = v.match(/\d{4,16}/g);
                                let match = matches && matches[0] || '';
                                let parts = [];
                                for (let i=0, len=match.length; i<len; i+=4) {
                                    parts.push(match.substring(i, i+4));
                                }
                                if (parts.length) {
                                    setCardNumber(parts.join(' '));
                                } else {
                                    setCardNumber(v);
                                }
                            }}
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                            type="text"
                            required
                            maxLength="5"
                            className="focus:ring-flight-500 focus:border-flight-500 block w-full py-3 px-4 border-gray-300 rounded-md border"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                            type="text"
                            required
                            maxLength="4"
                            className="focus:ring-flight-500 focus:border-flight-500 block w-full py-3 px-4 border-gray-300 rounded-md border"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                        />
                    </div>
                 </div>

                 <button
                    type="submit"
                    disabled={processing}
                    className={`w-full mt-8 flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white transition-colors ${
                        processing ? 'bg-flight-400' : 'bg-flight-600 hover:bg-flight-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flight-500'
                    }`}
                 >
                    {processing ? 'Processing Payment...' : `Pay $${totalAmount}`}
                 </button>
             </form>
        </div>

        {/* Order Summary Summary */}
        <div className="lg:w-96">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-4">
                    Order Summary
                </h3>
                
                <div className="mb-6">
                    <p className="font-semibold text-gray-900 text-lg mb-1">
                        {booking?.flights?.source} to {booking?.flights?.destination}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                        {new Date(booking?.flights?.departure_time).toLocaleDateString()} • Flight {booking?.flights?.flight_number}
                    </p>
                    <p className="text-sm text-gray-600">
                        Passenger: {user?.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                        Seat: <span className="font-semibold">{booking?.seats?.seat_number}</span> ({booking?.seats?.seat_type})
                    </p>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Base Fare (1 Adult)</span>
                        <span className="font-medium">${booking?.flights?.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Taxes & Carrier Fees</span>
                        <span className="font-medium">$45.00</span>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-flight-600">
                            ${totalAmount}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
