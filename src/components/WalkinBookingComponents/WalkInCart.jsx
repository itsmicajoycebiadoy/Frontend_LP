import React, { useMemo } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, AlertTriangle } from 'lucide-react';

const WalkInCart = ({ cart, setCart, setShowConfirmModal, formData, amenities = [] }) => {
    
    // Duration Calculation
    const duration = useMemo(() => {
        if (!formData.checkInDate || !formData.checkOutDate) return 1;
        const start = new Date(formData.checkInDate);
        const end = new Date(formData.checkOutDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    }, [formData.checkInDate, formData.checkOutDate]);

    // Cost Calculations
    const amenitiesTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (Number(item.amenity_price) * item.quantity), 0) * duration;
    }, [cart, duration]);

    const entranceFeeTotal = useMemo(() => {
        const guests = parseInt(formData.numGuest) || 0;
        return guests * 50 * duration;
    }, [formData.numGuest, duration]);

    const grandTotal = amenitiesTotal + entranceFeeTotal;

    // Conflict Checker
    const checkConflict = (cartItem) => {
        const amenityStatus = amenities.find(a => a.id === cartItem.amenity_id);
        
        if (!formData.checkInDate) return null;
        if (!amenityStatus) return null;

        if (cartItem.quantity > amenityStatus.slots_left) {
            return {
                isConflict: true,
                remaining: amenityStatus.slots_left
            };
        }
        return null;
    };

    const hasAnyConflict = cart.some(item => {
        const conflict = checkConflict(item);
        return conflict && conflict.isConflict;
    });

    // Handlers
    const handleUpdateQty = (itemName, delta) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.amenity_name === itemName) {
                    const newQty = item.quantity + delta;
                    if (newQty < 1) return item; 
                    return { ...item, quantity: newQty }; 
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
        
        if (!formData.fullName || !formData.contactNumber) return alert("Please fill in customer details.");
        if (!formData.checkInDate || !formData.checkOutDate) return alert("Please set Check-in and Check-out dates.");
        
        const start = new Date(formData.checkInDate);
        const end = new Date(formData.checkOutDate);
        if (end <= start) return alert("Check-out must be after Check-in.");

        if (cart.length === 0) return alert("Please select amenities first.");
        
        if (hasAnyConflict) return alert("Please remove fully booked amenities from your cart.");
        
        setShowConfirmModal(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            
            {/* Header */}
            <div className={`${hasAnyConflict ? 'bg-red-500' : 'bg-orange-500'} transition-colors duration-300 p-4`}>
                <div className="flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        {hasAnyConflict ? <AlertTriangle size={20}/> : <CreditCard size={20} />} 
                        {hasAnyConflict ? 'Issues in Cart' : 'Order Summary'}
                    </h3>
                    <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-full">
                        {cart.length} Items
                    </span>
                </div>
            </div>

            {/* Cart Items */}
            <div className="p-4">
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <ShoppingCart className="mx-auto mb-2 opacity-30" size={32}/>
                            <p className="text-sm italic">Cart is empty.</p>
                        </div>
                    ) : (
                        cart.map((item, index) => {
                            const conflict = checkConflict(item);
                            
                            return (
                                <div key={index} className={`flex flex-col gap-2 p-3 rounded-xl border relative group transition-all ${
                                    conflict 
                                    ? 'bg-red-50 border-red-200 ring-1 ring-red-200' 
                                    : 'bg-gray-50 border-gray-100'
                                }`}>
                                    
                                    {/* Conflict Message Banner */}
                                    {conflict && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded mb-1 mr-6">
                                            <AlertTriangle size={10} />
                                            {conflict.remaining <= 0 
                                                ? "FULLY BOOKED" 
                                                : `Only ${conflict.remaining} left`}
                                        </div>
                                    )}

                                    {/* Top Row */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 pr-6">
                                            <span className={`font-bold text-sm block truncate ${conflict ? 'text-red-700' : 'text-gray-800'}`} title={item.amenity_name}>
                                                {item.amenity_name}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-medium block">
                                                ₱{Number(item.amenity_price).toLocaleString()} / day
                                            </span>
                                        </div>
                                        
                                        {/* ✅ FIXED DELETE BUTTON: Mas visible na at may z-index */}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemove(item.amenity_name)} 
                                            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors z-10 ${
                                                conflict 
                                                ? 'text-red-600 hover:text-white hover:bg-red-500 bg-red-100' // Dark Red Text on Light Red BG
                                                : 'text-gray-300 hover:text-red-500 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>

                                    {/* Bottom Row */}
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="flex items-center bg-white rounded-lg border border-gray-200 h-7 shadow-sm">
                                            <button 
                                                onClick={() => handleUpdateQty(item.amenity_name, -1)}
                                                className="px-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-l-lg h-full transition-colors"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className={`w-6 text-center text-xs font-bold ${conflict ? 'text-red-600' : 'text-gray-700'}`}>
                                                {item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => handleUpdateQty(item.amenity_name, 1)}
                                                className="px-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-r-lg h-full transition-colors"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-xs text-gray-400 block leading-none">x {duration} days</span>
                                            <span className={`font-bold text-sm ${conflict ? 'text-red-600 line-through decoration-2' : 'text-gray-900'}`}>
                                                ₱{(item.amenity_price * item.quantity * duration).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {formData.numGuest > 0 && (
                        <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold">
                                    {formData.numGuest}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-700">Entrance Fee</p>
                                    <p className="text-[10px] text-blue-500">₱50 x {duration} days</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-800 text-sm">₱{entranceFeeTotal.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Duration</span>
                        <span className="font-medium text-gray-700">{duration} Day(s)</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                        <span className="font-bold text-gray-600 text-sm">Total Amount</span>
                        <span className="font-extrabold text-xl text-orange-600">₱{grandTotal.toLocaleString()}</span>
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={handleInitialSubmit} 
                        disabled={cart.length === 0 || hasAnyConflict} 
                        className={`w-full mt-4 py-3 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.98] ${
                            hasAnyConflict 
                            ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed' 
                            : 'bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed'
                        }`}
                    >
                        {hasAnyConflict ? 'Remove Unavailable Amenities' : 'Review & Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalkInCart;
