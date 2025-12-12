import React, { useEffect } from 'react';

const CartModal = ({
  isOpen,
  onClose,
  cart,
  removeFromCart,
  adjustQuantity,
  calculateTotal,
  calculateDownpayment,
  setCart
}) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col relative z-[101]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Your Booking Cart</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
          >
            ×
          </button>
        </div>

        {/* Scrollable Amenities Section */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your cart is empty</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex gap-3">
                    {/* Small Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.amenity_name}
                        className="w-16 h-16 object-cover rounded-md bg-gray-100"
                        onError={(e) => {
                          e.target.src = "/images/default-amenity.jpg";
                        }}
                      />
                    </div>
                    
                    {/* Amenity Details */}
                    <div className="flex-1 min-w-0">
                      {/* Amenity Header */}
                      <div className="flex justify-between items-start mb-1">
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{item.amenity_name}</h4>
                          <p className="text-xs text-gray-600">{item.amenity_type}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold flex-shrink-0 ml-2"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                        <div>
                          <p className="text-gray-500">Capacity:</p>
                          <p className="font-semibold">{item.capacity} people</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price:</p>
                          <p className="font-semibold text-orange-600">
                            ₱{item.amenity_price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Qty:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setCart(prev => {
                                  const newCart = [...prev];
                                  const newQuantity = newCart[index].quantity - 1;
                                  if (newQuantity >= 1) {
                                    newCart[index] = {
                                      ...newCart[index],
                                      quantity: newQuantity
                                    };
                                  }
                                  return newCart;
                                });
                              }}
                              className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors text-xs font-bold text-gray-600"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setCart(prev => {
                                  const newCart = [...prev];
                                  newCart[index] = {
                                    ...newCart[index],
                                    quantity: newCart[index].quantity + 1
                                  };
                                  return newCart;
                                });
                              }}
                              className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors text-xs font-bold text-gray-600"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Subtotal</p>
                          <p className="text-sm font-bold text-orange-600">
                            ₱{(item.amenity_price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        {cart.length > 0 ? (
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0 rounded-b-lg">
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-orange-600">
                  ₱{calculateTotal().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 bg-orange-50 p-2 rounded border border-orange-100">
                <span>20% Downpayment Required:</span>
                <span className="font-semibold text-orange-600">
                  ₱{calculateDownpayment().toLocaleString()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-lp-orange text-white rounded-lg font-semibold hover:bg-lp-orange-hover transition-colors text-sm shadow-md"
              >
                Close Cart
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0 rounded-b-lg">
            <button
              onClick={onClose}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;