import React, { useMemo } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, AlertCircle } from 'lucide-react';

const WalkInCart = ({ cart, setCart, setShowConfirmModal, formData }) => {
    
    // --- 1. DURATION CALCULATION ---
    const duration = useMemo(() => {
        if (!formData.checkInDate || !formData.checkOutDate) return 1;
        const start = new Date(formData.checkInDate);
        const end = new Date(formData.checkOutDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    }, [formData.checkInDate, formData.checkOutDate]);

    // --- 2. COST CALCULATIONS ---
    const amenitiesTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (Number(item.amenity_price) * item.quantity), 0) * duration;
    }, [cart, duration]);

    const entranceFeeTotal = useMemo(() => {
        const guests = parseInt(formData.numGuest) || 0;
        return guests * 50 * duration;
    }, [formData.numGuest, duration]);

    const grandTotal = amenitiesTotal + entranceFeeTotal;

    // --- HANDLERS ---
    const handleUpdateQty = (itemName, delta) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.amenity_name === itemName) {
                    const newQty = item.quantity + delta;
                    
                    // Check Max Limit
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
        
        // Validation
        if (!formData.fullName || !formData.contactNumber) return alert("Please fill in customer details.");
        if (!formData.checkInDate || !formData.checkOutDate) return alert("Please set Check-in and Check-out dates.");
        
        // Check for logic error passed from parent (if any)
        // assuming parent handles date logic validation before passing here or we check basic validity
        const start = new Date(formData.checkInDate);
        const end = new Date(formData.checkOutDate);
        if (end <= start) return alert("Check-out must be after Check-in.");

        if (cart.length === 0) return alert("Please select items first.");
        
        setShowConfirmModal(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            
            {/* Header */}
            <div className="bg-orange-500 p-4">
                <div className="flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <CreditCard size={20} /> Order Summary
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
                        cart.map((item, index) => (
                            <div key={index} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 relative group">
                                
                                {/* Top Row */}
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0 pr-6">
                                        <span className="font-bold text-gray-800 text-sm block truncate" title={item.amenity_name}>
                                            {item.amenity_name}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-medium block">
                                            ₱{Number(item.amenity_price).toLocaleString()} / day
                                        </span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemove(item.amenity_name)} 
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>

                                {/* Bottom Row: Qty & Total */}
                                <div className="flex justify-between items-center mt-1">
                                    {/* Qty Control */}
                                    <div className="flex items-center bg-white rounded-lg border border-gray-200 h-7 shadow-sm">
                                        <button 
                                            onClick={() => handleUpdateQty(item.amenity_name, -1)}
                                            className="px-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-l-lg h-full transition-colors"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-6 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                                        <button 
                                            onClick={() => handleUpdateQty(item.amenity_name, 1)}
                                            className={`px-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-r-lg h-full transition-colors ${item.quantity >= item.max_limit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={item.quantity >= item.max_limit}
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>

                                    {/* Line Total */}
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 block leading-none">x {duration} days</span>
                                        <span className="font-bold text-gray-900 text-sm">
                                            ₱{(item.amenity_price * item.quantity * duration).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Entrance Fee Line */}
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

                {/* Totals Section */}
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
                        disabled={cart.length === 0} 
                        className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                    >
                        Review & Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalkInCart;