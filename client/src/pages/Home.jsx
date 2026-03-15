import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Plane } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: ''
  });
  
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(formData).toString();
    navigate(`/flights?${queryParams}`);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-flight-900 pb-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-flight-800 to-flight-900 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Where will you go next?
          </h1>
          <p className="mt-6 text-xl text-flight-100 max-w-3xl">
            Discover the world with AeroFlow. Book flights easily, manage your reservations, and experience seamless travel.
          </p>
        </div>
      </div>

      {/* Search Container */}
      <div className="relative max-w-5xl mx-auto -mt-32 px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Search className="h-6 w-6 mr-2 text-flight-500" />
              Search Flights
            </h2>
            
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Source */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="source"
                    required
                    className="focus:ring-flight-500 focus:border-flight-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md border"
                    placeholder="Departure City"
                    value={formData.source}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="destination"
                    required
                    className="focus:ring-flight-500 focus:border-flight-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md border"
                    placeholder="Arrival City"
                    value={formData.destination}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    required
                    className="focus:ring-flight-500 focus:border-flight-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md border"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-3 mt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-md text-lg font-medium text-white bg-flight-600 hover:bg-flight-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flight-500 transition-colors"
                >
                  Find Flights
                </button>
              </div>
            </form>
          </div>
          
          {/* Decorative bottom bar */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <span>More than 500+ daily flights</span>
            <span>Secure & fast booking</span>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-20 text-center">
         <h3 className="text-3xl font-bold text-gray-900 mb-12">Why travel with AeroFlow?</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="bg-flight-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                  <Plane className="h-8 w-8 text-flight-600" />
               </div>
               <h4 className="text-xl font-semibold mb-3">Extensive Network</h4>
               <p className="text-gray-600">Fly to over 100 destinations worldwide with our modern fleet of aircraft.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="bg-flight-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-flight-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
               </div>
               <h4 className="text-xl font-semibold mb-3">Secure Booking</h4>
               <p className="text-gray-600">Your payments and personal information are protected with enterprise-grade security.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="bg-flight-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-flight-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <h4 className="text-xl font-semibold mb-3">Excellent Support</h4>
               <p className="text-gray-600">Our customer service team is available 24/7 to help you with any issues.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
