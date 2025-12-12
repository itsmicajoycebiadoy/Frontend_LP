import React, { useState } from 'react';
import { Search, User, Phone, MapPin, Calendar, DollarSign, Package, AlertCircle, Eye, X, FileText } from 'lucide-react';
import api from '../../config/axios';

const CustomerSearch = () => {
  const [searchType, setSearchType] = useState('reference');
  const [searchData, setSearchData] = useState({
    reference: '',
    customerName: '',
    contactNumber: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    
    try {
      let response;
      
      if (searchType === 'reference') {
        response = await api.get(`/api/transactions/${searchData.reference}`);
        setResults(response.data.data ? [response.data.data] : []);
      } else {
        response = await api.get('/api/transactions/customer', {
          params: {
            customer_name: searchData.customerName,
            contact_number: searchData.contactNumber
          }
        });
        setResults(response.data.data || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fully paid': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Proof of Payment Modal */}
      {selectedTransaction?.proof_of_payment && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 hidden" id="proofModalSearch">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Proof of Payment</h3>
              <button 
                onClick={() => document.getElementById('proofModalSearch').classList.add('hidden')}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[500px]">
              <img 
                src={`${api.defaults.baseURL}/uploads/payments/${selectedTransaction.proof_of_payment}`}
                alt="Proof of Payment"
                className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" font-size="16" text-anchor="middle" dy=".3em">Image not available</text></svg>';
                }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Transaction Ref: <span className="font-semibold">{selectedTransaction.transaction_ref}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-3xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Complete Reservation Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-600 mb-1">Transaction Reference</p>
                  <p className="font-bold text-xl text-orange-900">{selectedTransaction.transaction_ref}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Booking Status</p>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(selectedTransaction.booking_status)}`}>
                    {selectedTransaction.booking_status}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="text-orange-500" size={20} />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <User className="text-gray-400 mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{selectedTransaction.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-medium text-gray-900">{selectedTransaction.contact_number}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">{selectedTransaction.customer_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="text-orange-500" size={20} />
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Total Amount</p>
                    <p className="font-bold text-xl text-blue-900">₱{selectedTransaction.total_amount.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 mb-1">Paid</p>
                    <p className="font-bold text-xl text-green-900">₱{selectedTransaction.downpayment.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-600 mb-1">Balance</p>
                    <p className="font-bold text-xl text-orange-900">₱{selectedTransaction.balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(selectedTransaction.payment_status)}`}>
                      {selectedTransaction.payment_status}
                    </span>
                  </div>
                </div>

                {/* Proof of Payment Section */}
                {selectedTransaction.proof_of_payment && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <FileText className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">Proof of Payment Attached</p>
                          <p className="text-sm text-blue-700">Click to view payment receipt</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          document.getElementById('proofModalSearch').classList.remove('hidden');
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition font-medium"
                      >
                        <Eye size={18} />
                        View
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reservations */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="text-orange-500" size={20} />
                  Reserved Amenities
                </h4>
                <div className="space-y-3">
                  {selectedTransaction.reservations?.map(res => (
                    <div key={res.id} className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900 text-lg">{res.amenity_name}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Quantity: {res.quantity} × ₱{res.price.toLocaleString()} = 
                            <span className="font-semibold text-gray-900 ml-1">₱{(res.quantity * res.price).toLocaleString()}</span>
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(res.status)}`}>
                          {res.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div className="bg-white p-3 rounded border border-gray-200 flex items-center gap-2">
                          <Calendar className="text-green-600" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Check-in</p>
                            <p className="font-medium text-sm text-gray-900">
                              {new Date(res.check_in_date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-gray-200 flex items-center gap-2">
                          <Calendar className="text-red-600" size={16} />
                          <div>
                            <p className="text-xs text-gray-500">Check-out</p>
                            <p className="font-medium text-sm text-gray-900">
                              {new Date(res.check_out_date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Info */}
              <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Booking Type</p>
                    <p className="font-semibold text-gray-900">{selectedTransaction.booking_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedTransaction.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Search</h2>
        <p className="text-gray-600">Search for reservations by reference number or customer information</p>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="mb-4">
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setSearchType('reference')}
              className={`pb-3 px-4 font-medium transition ${
                searchType === 'reference'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Search by Reference
            </button>
            <button
              onClick={() => setSearchType('customer')}
              className={`pb-3 px-4 font-medium transition ${
                searchType === 'customer'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Search by Customer Info
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          {searchType === 'reference' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Reference Number
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchData.reference}
                  onChange={(e) => setSearchData({...searchData, reference: e.target.value})}
                  placeholder="e.g., TXN-20241202-A1B2"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchData.customerName}
                    onChange={(e) => setSearchData({...searchData, customerName: e.target.value})}
                    placeholder="Full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={searchData.contactNumber}
                    onChange={(e) => setSearchData({...searchData, contactNumber: e.target.value})}
                    placeholder="09XX-XXX-XXXX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Search size={20} />
            {loading ? 'Searching...' : 'Search Reservations'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({results.length})
            </h3>
          </div>

          {results.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <AlertCircle className="mx-auto mb-3 text-gray-400" size={64} />
              <p className="text-lg font-medium">No reservations found</p>
              <p className="text-sm mt-1">Please check your search criteria and try again</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {results.map(transaction => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">{transaction.customer_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(transaction.booking_status)}`}>
                          {transaction.booking_status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(transaction.payment_status)}`}>
                          {transaction.payment_status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-2">
                          <Search className="text-gray-400" size={16} />
                          <span className="font-medium">{transaction.transaction_ref}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="text-gray-400" size={16} />
                          <span>{transaction.contact_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="text-gray-400" size={16} />
                          <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">₱{transaction.total_amount.toLocaleString()}</p>
                        <p className="text-sm text-orange-600 font-medium">Balance: ₱{transaction.balance.toLocaleString()}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetailModal(true);
                        }}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition font-medium"
                      >
                        <Eye size={18} />
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Amenities:</span> {transaction.reservations?.map(r => r.amenity_name).join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;