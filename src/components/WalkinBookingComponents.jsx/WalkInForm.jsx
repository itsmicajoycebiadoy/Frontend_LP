import React, { useState } from 'react';
import { User, Calendar, AlertCircle, Clock } from 'lucide-react';

const WalkInForm = ({ formData, setFormData, errors = {} }) => {
    // Local state para sa duration (hours)
    const [duration, setDuration] = useState('');

    // Function para mag-compute ng Check-out date
    const calculateCheckOut = (checkInVal, durationVal) => {
        if (!checkInVal || !durationVal) return;

        const date = new Date(checkInVal);
        const hoursToAdd = parseFloat(durationVal);

        if (isNaN(hoursToAdd)) return;

        // Add hours
        date.setHours(date.getHours() + hoursToAdd);

        // Format to "YYYY-MM-DDTHH:mm"
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

        setFormData(prev => ({ ...prev, checkOutDate: formattedDate }));
    };

    const handleCheckInChange = (e) => {
        const newCheckIn = e.target.value;
        setFormData(prev => ({ ...prev, checkInDate: newCheckIn }));
        if (duration) calculateCheckOut(newCheckIn, duration);
    };

    const handleDurationChange = (e) => {
        const newDuration = e.target.value;
        setDuration(newDuration);
        if (formData.checkInDate) calculateCheckOut(formData.checkInDate, newDuration);
    };

    // Helper para sa input classes (nagiging pula pag may error)
    const getInputClass = (fieldName) => {
        return `w-full px-3 py-2 border rounded-lg outline-none transition-all ${
            errors[fieldName] 
                ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50' 
                : 'border-gray-300 focus:ring-2 focus:ring-orange-500'
        }`;
    };

    return (
        <>
            {/* Customer Details Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <User size={18} className="text-orange-500"/> Customer Details
                </h3>
                
                {/* Name Input */}
                <div>
                    <input 
                        type="text" 
                        placeholder="Full Name *" 
                        value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})} 
                        className={getInputClass('fullName')}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> Full Name is required</p>}
                </div>

                {/* Contact Input */}
                <div>
                    <input 
                        type="tel" 
                        placeholder="Contact Number *" 
                        value={formData.contactNumber} 
                        onChange={e => setFormData({...formData, contactNumber: e.target.value})} 
                        className={getInputClass('contactNumber')}
                    />
                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> Contact number is required</p>}
                </div>

                {/* Address Input */}
                <div>
                    <textarea 
                        placeholder="Address *" 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        className={`${getInputClass('address')} resize-none`}
                        rows="2" 
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> Address is required</p>}
                </div>
            </div>

            {/* Schedule Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={18} className="text-orange-500"/> Schedule
                </h3>
                
                {/* Check-In */}
                <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1 block">Check-in Date *</label>
                    <input 
                        type="datetime-local" 
                        value={formData.checkInDate} 
                        onChange={handleCheckInChange} 
                        className={getInputClass('checkInDate')}
                    />
                    {errors.checkInDate && <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> Check-in date is required</p>}
                </div>

                {/* Duration */}
                <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1 block flex items-center gap-1">
                        <Clock size={12} /> Duration (Hours)
                    </label>
                    <input 
                        type="number" 
                        placeholder="e.g. 12, 22" 
                        value={duration}
                        onChange={handleDurationChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        min="1"
                    />
                </div>

                {/* Check-Out (Auto) */}
                <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1 block">Check-out Date *</label>
                    <input 
                        type="datetime-local" 
                        value={formData.checkOutDate} 
                        onChange={e => setFormData({...formData, checkOutDate: e.target.value})} 
                        className={getInputClass('checkOutDate')}
                    />
                    {errors.checkOutDate && <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> Check-out date is required</p>}
                    
                    {/* Additional Date Logic Error (galing sa parent logic) */}
                    {errors.dateLogic && (
                        <div className="flex items-center gap-2 mt-2 text-red-600 bg-red-50 p-2 rounded text-xs font-semibold border border-red-100">
                            <AlertCircle size={14} /> {errors.dateLogic}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default WalkInForm;