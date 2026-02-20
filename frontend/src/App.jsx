import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/StaffLogin';
import UserLogin from './pages/UserLogin';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import './styles/main.css';

const PrivateRoute = ({ children, role, loginPath }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to={loginPath || "/login"} />;
    if (role && user.role !== role) return <Navigate to={loginPath || "/login"} />;

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Specific Portals */}
                    <Route path="/adminlogin" element={<AdminLogin />} />
                    <Route path="/staff" element={<StaffLogin />} />
                    <Route path="/login" element={<UserLogin />} />

                    {/* User Registration */}
                    <Route path="/register" element={<Register />} />

                    {/* Protected Dashboards */}
                    <Route path="/admin" element={
                        <PrivateRoute role="admin" loginPath="/adminlogin">
                            <AdminDashboard />
                        </PrivateRoute>
                    } />

                    <Route path="/staff-dashboard" element={
                        <PrivateRoute role="staff" loginPath="/staff">
                            <StaffDashboard />
                        </PrivateRoute>
                    } />

                    <Route path="/customer" element={
                        <PrivateRoute role="customer" loginPath="/login">
                            <CustomerDashboard />
                        </PrivateRoute>
                    } />

                    {/* Default Redirection to User Login */}
                    <Route path="/" element={<Navigate to="/login" />} />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
