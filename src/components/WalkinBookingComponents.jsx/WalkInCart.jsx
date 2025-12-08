// FILE: src/pages/receptionist/receptionistdashboardcomponents/walkin/WalkInCart.jsx
import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

const WalkInCart = ({ cart, setCart, total, dateError, setShowConfirmModal, formData }) => {
    
    // Logic: Update quantity inside cart
    const handleUpdateQty = (itemName, delta) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.amenity_name === itemName) {
                    const newQty = item.quantity + delta;
                    
                    // Check Max Limit Logic (using max_limit property from amenities)
                    if (delta > 0 && item.max_limit && newQty > item.max_limit) {
                        alert(`Limit reached! Only ${item.max_limit} available.`);
                        return item;
                    }

                    return { ...item, quantity: newQty > 0 ? newQty : 1 }; 
                }
                return item;
            });
        });
    };

    const handleRemove = (itemName) => {
        setCart(prevCart => prevCart.filter(item => item.amenity_name !== itemName));
    };

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        if (!formData.checkInDate || !formData.checkOutDate) return alert("Please set Check-in and Check-out dates.");
        if (dateError) return alert("Please fix the schedule dates.");
        if (cart.length === 0) return alert("Please select items first.");
        setShowConfirmModal(true);
    };

    // --- RENDER ---
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-800 text-lg">Amenities:</h3>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                    {cart.length} Items
                </span>
            </div>

            {/* --- SCROLLABLE CART LIST --- */}
            <div className="space-y-2 my-2 max-h-[250px] overflow-y-auto pr-2">
                {cart.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <ShoppingCart className="mx-auto mb-2 opacity-20" size={32}/>
                        <p className="text-sm italic">Cart is empty.</p>
                    </div>
                ) : (
                    cart.map((item, index) => (
                        <div key={index} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 relative">
                            
                            {/* Top: Name, Pax, Remove */}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-gray-800 text-sm block line-clamp-1" title={item.amenity_name}>
                                        {item.amenity_name}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                                        Capacity: {item.amenity_capacity || 'N/A'} Pax
                                    </span>
                                </div>
                                <button type="button" onClick={() => handleRemove(item.amenity_name)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <Trash2 size={16}/>
                                </button>
                            </div>

                            {/* Bottom: Price & Quantity */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">
                                        @ ₱{Number(item.amenity_price).toLocaleString()}
                                    </div>
                                    <div className="text-orange-600 font-bold text-sm">
                                        ₱{(item.amenity_price * item.quantity).toLocaleString()}
                                    </div>
                                </div>

                                {/* Qty Buttons */}
                                <div className="flex items-center bg-white rounded border border-gray-300 shadow-sm h-7 overflow-hidden">
                                    <button 
                                        type="button"
                                        onClick={() => handleUpdateQty(item.amenity_name, -1)}
                                        className="w-7 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 border-r border-gray-200 active:bg-gray-200 transition"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <div className="w-8 h-full flex items-center justify-center font-bold text-xs text-gray-800 bg-gray-50">
                                        {item.quantity}
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => handleUpdateQty(item.amenity_name, 1)}
                                        className={`w-7 h-full flex items-center justify-center border-l border-gray-200 active:bg-gray-200 transition ${item.quantity >= item.max_limit ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-orange-600 hover:bg-orange-50'}`}
                                        disabled={item.quantity >= item.max_limit}
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- Footer: Totals & Action --- */}
            <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-600 text-sm">Total</span>
                    <span className="font-bold text-lg text-orange-600">₱{total.toLocaleString()}</span>
                </div>
                
                <button 
                    type="button" 
                    onClick={handleInitialSubmit} 
                    disabled={cart.length === 0} 
                    className="w-full py-3 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 disabled:opacity-50 transition shadow-sm"
                >
                    Review & Confirm
                </button>
            </div>
        </div>
    );
};

export default WalkInCart;