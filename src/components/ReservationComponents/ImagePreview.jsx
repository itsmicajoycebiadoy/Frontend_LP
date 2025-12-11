// ImagePreview.jsx
import React from 'react';

const ImagePreview = ({ imagePreview, onRemove }) => {
  return (
    <div className="mt-4 relative">
      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
      <div className="relative inline-block">
        <img 
          src={imagePreview} 
          alt="Payment screenshot preview" 
          className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;