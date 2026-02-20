import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OrderStatus from '../components/OrderStatus';
import ServiceRequest from '../components/ServiceRequest';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5050/api/orders/myorders', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // Pulse every 5 seconds for instant updates
        return () => clearInterval(interval);
    }, [user.token]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'Overview', icon: '📊' },
        { id: 'bills', label: 'Bills', icon: '🧾' },
        { id: 'tracking', label: 'Tracking', icon: '🚚' },
        { id: 'request', label: 'Pickup', icon: '➕' }
    ];

    const totalSpent = orders.reduce((acc, curr) => acc + (curr.billingStatus === 'Billed' ? curr.totalPrice : 0), 0);

    return (
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
            <nav className="dashboard-nav nav-header" style={{ flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', background: 'var(--card-bg)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>Cocoon</h1>
                    <span style={{ fontSize: '0.6rem', background: '#eff6ff', color: 'var(--primary-color)', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', background: 'var(--primary-color)', borderRadius: '50%', animation: 'statusPulse 2s infinite' }}></span> LIVE
                    </span>
                </div>
                <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name}</span>
                    <button onClick={handleLogout} className="logout-btn" style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-layout" style={{ flexGrow: 1, overflow: 'hidden' }}>
                <aside className="sidebar" style={{ width: '260px', background: 'var(--card-bg)', padding: '20px', borderRight: '1px solid var(--border-color)' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {sidebarItems.map(item => (
                            <li key={item.id} onClick={() => setActiveTab(item.id)} style={{
                                padding: '14px 20px',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                background: activeTab === item.id ? 'var(--primary-color)' : 'transparent',
                                color: activeTab === item.id ? 'white' : 'var(--text-secondary)',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: '0.2s',
                                fontWeight: activeTab === item.id ? '600' : '500'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                <span className="sidebar-label">{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="main-content" style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
                    {activeTab === 'dashboard' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>Hi, {user?.name.split(' ')[0]}!</h2>
                                <button onClick={() => setActiveTab('request')} style={{ padding: '12px 24px', background: 'var(--primary-color)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                                    Request Pickup
                                </button>
                            </div>

                            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' }}>TOTAL TASKS</p>
                                    <h3 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', fontWeight: '800', margin: '10px 0 0 0' }}>{orders.length}</h3>
                                </div>
                                <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <p style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' }}>ACTIVE ORDERS</p>
                                    <h3 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', fontWeight: '800', margin: '10px 0 0 0' }}>{orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length}</h3>
                                </div>
                                <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <p style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' }}>TOTAL SPENT</p>
                                    <h3 style={{ fontSize: '2.2rem', color: '#10b981', fontWeight: '800', margin: '10px 0 0 0' }}>₹{totalSpent}</h3>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '15px' }}>
                                {orders.slice(0, 5).map(order => (
                                    <div key={order._id} className="order-card" style={{ background: 'white', padding: '15px 20px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>#{order.orderId}</span>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.billingStatus === 'Pending' ? 'Calculating weight...' : `₹${order.totalPrice}`}</p>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            background: order.status === 'Delivered' ? '#dcfce7' : '#fef3c7',
                                            color: order.status === 'Delivered' ? '#166534' : '#92400e'
                                        }}>{order.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bills' && (
                        <div style={{ overflowX: 'auto' }}>
                            <h2 style={{ marginBottom: '20px' }}>Invoices</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                                <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                                    <tr>
                                        <th style={{ padding: '15px' }}>Date</th>
                                        <th style={{ padding: '15px' }}>Weight</th>
                                        <th style={{ padding: '15px' }}>Amount</th>
                                        <th style={{ padding: '15px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '15px', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '15px', fontSize: '0.85rem' }}>{order.weight || '--'} kg</td>
                                            <td style={{ padding: '15px', fontSize: '0.85rem', fontWeight: 'bold' }}>₹{order.totalPrice || '0'}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ fontSize: '0.7rem', color: order.billingStatus === 'Billed' ? '#166534' : '#ef4444' }}>{order.billingStatus}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'tracking' && (
                        <div>
                            <h2 style={{ marginBottom: '20px' }}>Order History</h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {orders.map(order => (
                                    <div key={order._id} style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                                            <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: '700' }}>#{order.orderId}</h4>
                                            <span style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '0.9rem' }}>{order.status}</span>
                                        </div>
                                        <OrderStatus status={order.status} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'request' && (
                        <ServiceRequest onOrderSuccess={() => {
                            setActiveTab('dashboard');
                            fetchOrders();
                        }} />
                    )}
                </main>
            </div>

            <style>{`
                @keyframes statusPulse {
                    0% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0.3; transform: scale(0.8); }
                }
            `}</style>
        </div>
    );
};

export default CustomerDashboard;
