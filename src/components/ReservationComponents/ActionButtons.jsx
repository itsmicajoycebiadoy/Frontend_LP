import React from 'react';
import { ShoppingCart, Calendar } from 'lucide-react';

const ActionButtons = ({ 
  onViewReservations, 
  onOpenCart, 
  cartCount,
  reservationCount = 0  // Add new prop for reservation count
}) => {
  return (
    <section className="bg-white border-b border-gray-200 py-3 sm:py-4">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4">
          {/* View Reservations Button */}
          <button
            onClick={onViewReservations}
            className="flex items-center justify-center gap-2 border-2 border-lp-orange text-lp-orange px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-lp-orange hover:text-white transition-colors relative w-full sm:w-auto text-sm sm:text-base"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">My Reservations</span>
            <span className="xs:hidden">Reservation Status</span>
            
            {/* Reservation Count Badge */}
            {reservationCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                {reservationCount > 9 ? '9+' : reservationCount}
              </div>
            )}
          </button>

          {/* Booking Cart Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center justify-center gap-2 border-2 border-lp-orange text-lp-orange px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-lp-orange hover:text-white transition-colors relative w-full sm:w-auto text-sm sm:text-base"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Booking Cart</span>
            {cartCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                {cartCount > 9 ? '9+' : cartCount}
              </div>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ActionButtons;