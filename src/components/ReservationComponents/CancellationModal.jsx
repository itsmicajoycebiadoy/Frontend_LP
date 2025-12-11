import React from 'react';
import { AlertTriangle } from 'lucide-react';

const CancellationModal = ({ reservation, onConfirm, onCancel }) => {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cancel Reservation</h3>
              <p className="text-sm text-gray-600">Reservation #{reservation.reservationNumber}</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800 mb-1">Important Notice</p>
                <p className="text-xs text-red-700">
                  Cancelling a reservation has no refund as stated in our resort policy. 
                  The downpayment paid will not be refunded upon cancellation.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <p><strong>Amenities:</strong> {reservation.amenities.join(", ")}</p>
            <p><strong>Dates:</strong> {new Date(reservation.checkInDate).toLocaleString()} to {new Date(reservation.checkOutDate).toLocaleString()}</p>
            <p><strong>Total Amount:</strong> ₱{reservation.totalAmount.toLocaleString()}</p>
            <p><strong>Downpayment Paid:</strong> ₱{reservation.downpayment.toLocaleString()}</p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to proceed with cancelling this reservation?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Reservation
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;