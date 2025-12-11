import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview'; // Make sure this path is correct
import { User, Upload, CreditCard, AlertCircle } from 'lucide-react';

const ReservationForm = ({
  reservationForm,
  formErrors,
  imagePreview,
  cart,
  calculateTotal,
  calculateDownpayment,
  handleReservationInputChange,
  handleReservationSubmit,
  removeImagePreview
}) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (showConfirmationModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showConfirmationModal]);

  const handleConfirmClick = (e) => {
    e.preventDefault();
    setShowConfirmationModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmationModal(false);
    
    const syntheticEvent = {
      preventDefault: () => {},
      target: {}
    };
    
    try {
      await handleReservationSubmit(syntheticEvent);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Complete Your Reservation
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Finalize your details and secure your booking at La Piscina.
        </p>
      </div>

      <form onSubmit={handleConfirmClick} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        
        {/* LEFT COLUMN: User Details & Payment Upload (Span 7) */}
        <section className="lg:col-span-7 space-y-8">
          
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b pb-4">
              <User className="w-5 h-5 text-lp-orange" />
              Guest Information
            </h3>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={reservationForm.fullName || ''}
                  onChange={handleReservationInputChange}
                  required
                  className={`block w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lp-orange/50 focus:border-lp-orange transition-all sm:text-sm ${
                    formErrors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Juan Dela Cruz"
                />
                {formErrors.fullName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.fullName}</p>}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={reservationForm.contactNumber || ''}
                  onChange={handleReservationInputChange}
                  required
                  maxLength="11"
                  className={`block w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lp-orange/50 focus:border-lp-orange transition-all sm:text-sm ${
                    formErrors.contactNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="09XXXXXXXXX"
                />
                {formErrors.contactNumber ? (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.contactNumber}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">Must be 11 digits starting with 09</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  name="address"
                  value={reservationForm.address || ''}
                  onChange={handleReservationInputChange}
                  required
                  rows="2"
                  className={`block w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lp-orange/50 focus:border-lp-orange transition-all sm:text-sm ${
                    formErrors.address ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Barangay, City, Province"
                />
                {formErrors.address && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.address}</p>}
              </div>

              {/* Number of Guests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests * <span className='text-xs text-gray-400 font-normal'>(₱50 per head/day)</span></label>
                <input
                  type="number"
                  name="numGuest"
                  value={reservationForm.numGuest || ''}
                  onChange={handleReservationInputChange}
                  required
                  min="1"
                  className={`block w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-lp-orange/50 focus:border-lp-orange transition-all sm:text-sm ${
                    formErrors.numGuest ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter total pax"
                />
                {formErrors.numGuest && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formErrors.numGuest}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
                  <input
                    type="datetime-local"
                    name="checkInDate"
                    value={reservationForm.checkInDate || ''}
                    onChange={handleReservationInputChange}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    className={`block w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-lp-orange/50 focus:border-lp-orange transition-all sm:text-sm ${
                      formErrors.checkInDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.checkInDate && <p className="mt-1 text-xs text-red-500">{formErrors.checkInDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
                  <input
                    type="datetime-local"
                    name="checkOutDate"
                    value={reservationForm.checkOutDate || ''}
                    onChange={handleReservationInputChange}
                    required
                    min={reservationForm.checkInDate || new Date().toISOString().slice(0, 16)}
                    className={`block w-full px-4 py-3 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-lp-orange/50 focus:border-lp-orange transition-all sm:text-sm ${
                      formErrors.checkOutDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.checkOutDate && <p className="mt-1 text-xs text-red-500 font-semibold">{formErrors.checkOutDate}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Upload Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b pb-4">
              <Upload className="w-5 h-5 text-lp-orange" />
              Proof of Payment
            </h3>
            
            <div className="space-y-4">
              {/* Preview stays if image exists */}
              {imagePreview && (
                <div className="mb-4">
                  <ImagePreview
                    imagePreview={imagePreview}
                    onRemove={removeImagePreview}
                  />
                </div>
              )}

              {/* Simplified Choose File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Screenshot *
                </label>
                
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    name="paymentScreenshot"
                    onChange={handleReservationInputChange}
                    required={!reservationForm.paymentScreenshot}
                    accept="image/*"
                    id="file-upload"
                    className="hidden"
                  />
                  
                  <label 
                    htmlFor="file-upload" 
                    className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap shadow-sm ${
                      formErrors.paymentScreenshot 
                        ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100' 
                        : 'bg-lp-orange border-transparent text-white hover:bg-orange-600 hover:shadow-md'
                    }`}
                  >
                    Choose File
                  </label>

                  <span className="text-sm text-gray-500 italic truncate max-w-[200px] sm:max-w-xs">
                    {reservationForm.paymentScreenshot && reservationForm.paymentScreenshot.name 
                      ? reservationForm.paymentScreenshot.name 
                      : "No file chosen"}
                  </span>
                </div>
                
                {formErrors.paymentScreenshot && (
                  <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3"/> {formErrors.paymentScreenshot}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Order Summary & Payment Info (Span 5) - STICKY */}
        <section className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="lg:sticky lg:top-24 space-y-6">
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-lp-orange p-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-white" />
                  Order Summary
                </h3>
              </div>
              
              <div className="p-5 sm:p-6">
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 italic text-sm">Your cart is empty.</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="bg-gray-100 text-gray-600 w-6 h-6 flex items-center justify-center rounded text-xs font-bold">
                            {item.quantity}
                          </span>
                          <span className="text-gray-700 font-medium truncate max-w-[140px] sm:max-w-[180px]">{item.amenity_name}</span>
                        </div>
                        <span className="text-gray-900 font-semibold">₱{(item.amenity_price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))
                  )}

                  {/* Display Entrance Fee ONLY if Guests > 0 AND Cart is not empty */}
                  {cart.length > 0 && reservationForm.numGuest > 0 && (
                      <div className="flex justify-between items-center text-sm border-t border-dashed pt-2">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-50 text-blue-600 w-6 h-6 flex items-center justify-center rounded text-xs font-bold">
                          {reservationForm.numGuest}
                        </span>
                        <span className="text-gray-700 font-medium">Entrance Fee (₱50)</span>
                      </div>
                      <span className="text-gray-900 font-semibold">₱{(reservationForm.numGuest * 50).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* ✅ MODIFIED: VALUES ARE EMPTY IF CART IS EMPTY */}
                <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Subtotal (Amenities + Entrance)</span>
                    <span>
                      {cart.length > 0 
                        ? `₱${(calculateTotal() / (Math.ceil((new Date(reservationForm.checkOutDate) - new Date(reservationForm.checkInDate)) / (1000 * 60 * 60 * 24)) || 1)).toLocaleString()}` 
                        : ''}
                    </span>
                  </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                    <span>Duration</span>
                    <span>
                      {cart.length > 0 
                        ? `${Math.ceil((new Date(reservationForm.checkOutDate) - new Date(reservationForm.checkInDate)) / (1000 * 60 * 60 * 24)) || 1} Day(s)` 
                        : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold text-base border-t pt-2">
                    <span>Grand Total</span>
                    <span>
                      {cart.length > 0 ? `₱${calculateTotal().toLocaleString()}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2">
                    <span className="text-orange-800 font-bold text-sm">Downpayment (20%)</span>
                    <span className="text-xl font-extrabold text-lp-orange">
                      {cart.length > 0 ? `₱${calculateDownpayment().toLocaleString()}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide text-center">Scan to Pay via GCash</h4>
              
              <div className="flex justify-center mb-6">
                <div className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <img 
                    src="/images/gcash.jpg" 
                    alt="GCash QR Code" 
                    className="w-40 h-40 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.src = "";
                      console.log("GCash image failed to load");
                    }}
                  />
                </div>
              </div>

              <div className="text-center space-y-1 mb-6">
                <p className="text-sm text-gray-500">Or send manually to:</p>
                <p className="text-xl font-bold text-gray-900">0906 704 5360</p>
                <p className="text-xs text-gray-400">La Piscina De Conception Resort</p>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0 || isSubmitting}
                className="w-full py-4 bg-lp-orange text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-lp-orange-hover hover:shadow-orange-300 transform transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm Reservation'
                )}
              </button>
            </div>

          </div>
        </section>
      </form>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <>
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
              
              <div className="bg-orange-50 p-6 flex items-start gap-4 border-b border-orange-100">
                <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-lp-orange" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Strict Cancellation Policy</h3>
                  <p className="text-sm text-gray-600 mt-1">Please read before proceeding.</p>
                </div>
                <button onClick={handleCancelSubmit} className="ml-auto text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-1">No Refund Policy</h4>
                  <p className="text-sm text-red-700 leading-relaxed">
                    Downpayments are non-refundable once confirmed. Please ensure all details are correct.
                  </p>
                </div>

                {/* REMOVED RESCHEDULING SECTION */}
                
                 {/* Summary inside modal for double checking */}
                 <div className="text-xs text-gray-500 pt-2 border-t">
                  <p>Guests: {reservationForm.numGuest}</p>
                  <p>Total: ₱{calculateTotal().toLocaleString()}</p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCancelSubmit}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-400 transition-all"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-5 py-2.5 bg-lp-orange text-white rounded-xl text-sm font-semibold hover:bg-lp-orange-hover shadow-md hover:shadow-lg transition-all"
                >
                  I Agree & Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReservationForm;