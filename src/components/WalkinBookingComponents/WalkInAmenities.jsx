import React from 'react';
import { Search, Plus, Users, Package, Image as ImageIcon } from 'lucide-react';

const WalkInAmenities = ({ amenities, cart, setCart, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) => {
    
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:7777'; 

    const categories = ['All', ...new Set(amenities.map(a => a.type))];
    
    const filteredAmenities = amenities.filter(a => 
        (selectedCategory === 'All' || a.type === selectedCategory) && 
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- LOGIC FIX: Sort using 'slots_left' ---
    const sortedAmenities = [...filteredAmenities].sort((a, b) => {
        // Use slots_left directly if available, else calc
        const aSlots = a.slots_left !== undefined ? a.slots_left : (a.quantity - (a.booked || 0));
        const bSlots = b.slots_left !== undefined ? b.slots_left : (b.quantity - (b.booked || 0));

        const aAvailable = aSlots > 0;
        const bAvailable = bSlots > 0;

        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        return 0;
    });

    const addToCart = (amenity) => {
        // --- LOGIC FIX: Use 'slots_left' for limit check ---
        const available = amenity.slots_left !== undefined 
            ? amenity.slots_left 
            : (amenity.quantity - (amenity.booked || 0));
        
        if (available <= 0) return alert("This item is fully booked.");
        
        const existing = cart.find(i => i.amenity_name === amenity.name);
        const currentQty = existing ? existing.quantity : 0;

        if (currentQty + 1 > available) return alert(`Limit reached. Only ${available} left.`);

        if (existing) {
            setCart(cart.map(i => i.amenity_name === amenity.name ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, { 
                amenity_id: amenity.id, 
                amenity_name: amenity.name, 
                amenity_price: amenity.price, 
                amenity_capacity: amenity.capacity || 'N/A', 
                max_limit: available,
                quantity: 1 
            }]);
        }
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 h-[420px] flex flex-col">
            
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative w-full md:w-64 group">
                    <input 
                        type="text" 
                        placeholder="Search Amenity..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm" 
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar flex-1">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            type="button" 
                            onClick={() => setSelectedCategory(cat)} 
                            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                                selectedCategory === cat 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* GRID CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar content-start">
                {sortedAmenities.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                        <Package size={48} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium">No amenities found.</p>
                    </div>
                ) : (
                    sortedAmenities.map(amenity => {
                        // --- LOGIC FIX: Check Availability Display ---
                        const available = amenity.slots_left !== undefined 
                            ? amenity.slots_left 
                            : (amenity.quantity - (amenity.booked || 0));
                            
                        const isAvailable = available > 0;

                        let imageUrl = null;
                        if (amenity.image) {
                             if (amenity.image.startsWith('http')) {
                                 imageUrl = amenity.image;
                             } else {
                                 imageUrl = `${backendUrl}/uploads/am_images/${amenity.image}`;
                             }
                        }

                        return (
                            <div 
                                key={amenity.id} 
                                onClick={() => isAvailable && addToCart(amenity)} 
                                className={`
                                    group flex flex-row h-36 rounded-xl border transition-all duration-200 overflow-hidden
                                    ${isAvailable 
                                        ? 'bg-white border-gray-200 hover:border-orange-400 hover:shadow-md cursor-pointer' 
                                        : 'bg-gray-50 border-gray-100 opacity-75 cursor-not-allowed order-last'
                                    }
                                `}
                            >
                                {/* LEFT SIDE: DETAILS & TEXT */}
                                <div className="flex-1 p-3 flex flex-col justify-between">
                                    <div>
                                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mb-1.5">
                                            {amenity.type}
                                        </span>

                                        <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-1" title={amenity.name}>
                                            {amenity.name}
                                        </h4>
                                        
                                        <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                                            <Users size={14} />
                                            <span>{amenity.capacity || 1} Pax</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 mt-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">Price</span>
                                            <span className={`font-bold text-base ${isAvailable ? 'text-orange-600' : 'text-gray-400'}`}>
                                                ₱{Number(amenity.price).toLocaleString()}
                                            </span>
                                        </div>
                                        
                                        {isAvailable ? (
                                            <button 
                                                type="button"
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-200 shadow-sm"
                                            >
                                                <Plus size={18} strokeWidth={2.5} />
                                            </button>
                                        ) : (
                                            <button 
                                                type="button" 
                                                disabled
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-300 cursor-not-allowed"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT SIDE: IMAGE */}
                                <div className="w-32 h-full bg-gray-100 relative shrink-0">
                                    {imageUrl ? (
                                        <img 
                                            src={imageUrl} 
                                            alt={amenity.name} 
                                            className={`w-full h-full object-cover ${!isAvailable && 'grayscale'}`}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=No+Image"; }} 
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300">
                                            <ImageIcon size={24} />
                                        </div>
                                    )}

                                    {/* STATUS OVERLAY */}
                                    <div className="absolute top-2 right-2">
                                        {isAvailable ? (
                                            <span className="text-[9px] font-bold text-green-700 bg-green-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-green-200 shadow-sm">
                                                {available} Left
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-white bg-red-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                                                Fully Booked
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default WalkInAmenities;
