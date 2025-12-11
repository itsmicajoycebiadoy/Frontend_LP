import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./pages/AuthContext";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Reservations from "./pages/customer/Reservations";
import Feedback from "./pages/customer/Feedback";
import Contact from "./pages/customer/Contact";
import Amenities from "./pages/customer/Amenities";

// Dashboards
import CustomerDashboard from "./pages/customer/CustomerDashboard"; 
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard"; 
import OwnerDashboard from "./pages/owner/OwnerDashboard"; 

import FeedbackModal from "./components/FeedbackModal"; 

// --- 1. GLOBAL WRAPPER (Ang Solusyon sa Modal Issue) ---
const GlobalFeedbackWrapper = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // STRICT GUARD: Huwag ipakita sa Login o Reset Password page
    const isAuthPath = location.pathname === '/' || location.pathname === '/reset-password';
    
    if (isAuthPath) return null; // 👈 HINDI LILITAW DITO
    if (loading) return null;
    if (!user) return null; 

    return <FeedbackModal />;
};

// --- 2. PROTECTED ROUTE ---
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lp-orange"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/" replace />;
    if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" replace />;

    return children;
};

// --- 3. UNAUTHORIZED PAGE ---
const UnauthorizedPage = () => {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Unauthorized Access</h1>
                <button onClick={() => logout()} className="mt-4 bg-orange-500 text-white px-4 py-2 rounded">Logout</button>
            </div>
        </div>
    );
};

// --- MAIN APP ---
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                {/* 🎯 DITO NAKALAGAY ANG WRAPPER */}
                <GlobalFeedbackWrapper />

                <Routes>
                    <Route path="/" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* CUSTOMER */}
                    <Route path="/customer" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} /> 
                    <Route path="/amenities" element={<ProtectedRoute requiredRole="customer"><Amenities /></ProtectedRoute>} />
                    <Route path="/reservations" element={<ProtectedRoute requiredRole="customer"><Reservations /></ProtectedRoute>} />
                    <Route path="/feedback" element={<ProtectedRoute requiredRole="customer"><Feedback /></ProtectedRoute>} />
                    <Route path="/contact" element={<ProtectedRoute requiredRole="customer"><Contact /></ProtectedRoute>} />

                    {/* STAFF */}
                    <Route path="/receptionist" element={<ProtectedRoute requiredRole="receptionist"><ReceptionistDashboard /></ProtectedRoute>} /> 
                    <Route path="/owner" element={<ProtectedRoute requiredRole="owner"><OwnerDashboard /></ProtectedRoute>} /> 

                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;