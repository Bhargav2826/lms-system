import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StaffManagement from '../components/StaffManagement';
import ServiceManagement from '../components/ServiceManagement';
import OrderMonitoring from '../components/OrderMonitoring';
import AdminAnalytics from '../components/AdminAnalytics';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: '📈' },
        { id: 'orders', label: 'Orders', icon: '📋' },
        { id: 'services', label: 'Services', icon: '💰' },
        { id: 'staff', label: 'Staff', icon: '👥' }
    ];

    return (
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Top Navigation */}
            <nav className="dashboard-nav nav-header" style={{ flexShrink: 0, padding: '15px 20px', background: 'var(--card-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>Cocoon <span style={{ fontSize: '0.7rem', background: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '4px', marginLeft: '5px', verticalAlign: 'middle' }}>Admin</span></h1>
                <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Admin: {user?.name}</span>
                    <button onClick={handleLogout} className="logout-btn" style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: '500' }}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-layout" style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
                <aside className="sidebar" style={{
                    width: '240px',
                    background: 'var(--card-bg)',
                    padding: '20px',
                    borderRight: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {sidebarItems.map(item => (
                            <li
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={{
                                    padding: '12px 15px',
                                    cursor: 'pointer',
                                    borderRadius: '10px',
                                    background: activeTab === item.id ? 'var(--primary-color)' : 'transparent',
                                    color: activeTab === item.id ? 'white' : 'var(--text-secondary)',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    fontWeight: '600'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                <span className="sidebar-label">{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Main Content Area */}
                <main className="main-content" style={{ flexGrow: 1, padding: '30px', overflowY: 'auto', background: 'var(--bg-color)' }}>

                    {activeTab === 'overview' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>Analytics</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time business insights.</p>
                                </div>
                                <button
                                    onClick={() => window.open('http://localhost:5050/api/analytics/export', '_blank')}
                                    style={{ padding: '10px 20px', background: '#10b981', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    📊 Download Full Report (Excel)
                                </button>
                            </div>
                            <AdminAnalytics />
                        </div>
                    )}

                    {activeTab === 'orders' && <OrderMonitoring />}

                    {activeTab === 'services' && (
                        <div>
                            <div style={{ marginBottom: '25px' }}>
                                <h2 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0 }}>Services</h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Update pricing and active services.</p>
                            </div>
                            <ServiceManagement />
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div>
                            <div style={{ marginBottom: '25px' }}>
                                <h2 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0 }}>Staff</h2>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your workforce.</p>
                            </div>
                            <StaffManagement />
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
