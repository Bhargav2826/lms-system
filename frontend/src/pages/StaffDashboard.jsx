import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StaffDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [billingOrder, setBillingOrder] = useState(null);
    const [billData, setBillData] = useState({ weight: '', price: '' });
    const [inspectionOrder, setInspectionOrder] = useState(null);
    const [inspectionNotes, setInspectionNotes] = useState('');
    const [inspectionPhotos, setInspectionPhotos] = useState([]);

    const handleInspectionSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('notes', inspectionNotes);
        inspectionPhotos.forEach(photo => formData.append('photos', photo));

        try {
            await axios.put(`http://localhost:5050/api/orders/${inspectionOrder._id}/inspection`, formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setInspectionOrder(null);
            setInspectionNotes('');
            setInspectionPhotos([]);
            fetchOrders();
        } catch (err) {
            console.error('Inspection upload failed');
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5050/api/orders/all', {
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
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`http://localhost:5050/api/orders/${orderId}/status`,
                { status: newStatus, assignedStaff: user._id },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            fetchOrders();
        } catch (err) {
            console.error('Update failed');
        }
    };

    const handleGenerateBill = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5050/api/orders/${billingOrder._id}/generate-bill`,
                { weight: billData.weight, totalPrice: billData.price },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setBillingOrder(null);
            setBillData({ weight: '', price: '' });
            fetchOrders();
        } catch (err) {
            console.error('Billing failed');
        }
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'dashboard', icon: '📊' },
        { id: 'order-request', label: 'order-request', icon: '📩' },
        { id: 'create-bill', label: 'create bill', icon: '🧾' }
    ];

    const totalDelivered = orders.filter(o => o.status === 'Delivered').length;
    const activeRequests = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
    const unassignedTasks = orders.filter(o => !o.assignedStaff && !['Delivered', 'Cancelled'].includes(o.status)).length;
    const pendingBills = orders.filter(o => o.billingStatus === 'Pending' && !['Delivered', 'Cancelled'].includes(o.status)).length;

    return (
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)' }}>
            <nav className="dashboard-nav nav-header" style={{ flexShrink: 0, background: 'var(--staff-color)', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Staff Command</h1>
                    <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span> LIVE
                    </span>
                </div>
                <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'white', display: 'block', fontSize: '0.85rem', fontWeight: '700' }}>{user?.name}</span>
                        <span style={{ color: 'rgba(255,255,255,0.7)', display: 'block', fontSize: '0.7rem' }}>Service Personnel</span>
                    </div>
                    <button onClick={() => { logout(); navigate('/staff'); }} className="logout-btn" style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'none', color: 'white', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-layout" style={{ flexGrow: 1, overflow: 'hidden' }}>
                <aside className="sidebar" style={{ width: '260px', background: 'var(--card-bg)', padding: '25px 15px', borderRight: '1px solid var(--border-color)' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {sidebarItems.map(item => (
                            <li key={item.id} onClick={() => setActiveTab(item.id)} style={{
                                padding: '14px 20px',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                background: activeTab === item.id ? 'var(--staff-color)' : 'transparent',
                                color: activeTab === item.id ? 'white' : 'var(--text-secondary)',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                fontWeight: '700',
                                transition: '0.3s'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                <span className="sidebar-label">{item.label}</span>
                                {item.id === 'order-request' && unassignedTasks > 0 && (
                                    <span style={{ marginLeft: 'auto', background: activeTab === 'order-request' ? 'white' : '#ef4444', color: activeTab === 'order-request' ? 'var(--staff-color)' : 'white', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px' }}>{unassignedTasks}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="main-content" style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
                    {activeTab === 'dashboard' && (
                        <div>
                            <h2 style={{ marginBottom: '30px', color: '#1e293b' }}>Operations Tracker</h2>
                            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>UNCLAIMED</p>
                                    <h3 style={{ fontSize: '2rem', color: '#1e293b' }}>{unassignedTasks}</h3>
                                </div>
                                <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#4f46e5', fontSize: '0.75rem', fontWeight: 'bold' }}>ACTIVE</p>
                                    <h3 style={{ fontSize: '2rem', color: '#4f46e5' }}>{activeRequests}</h3>
                                </div>
                                <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 'bold' }}>BILLS DUE</p>
                                    <h3 style={{ fontSize: '2rem', color: '#f59e0b' }}>{pendingBills}</h3>
                                </div>
                                <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold' }}>COMPLETED</p>
                                    <h3 style={{ fontSize: '2rem', color: '#10b981' }}>{totalDelivered}</h3>
                                </div>
                            </div>

                            <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '20px', borderRadius: '15px', color: 'var(--primary-color)' }}>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>💡 Team Workflow Note:</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem' }}>Shared dash for all 5 staff members. Claim actions are live.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'order-request' && (
                        <div>
                            <h2 style={{ color: '#1e293b', marginBottom: '25px' }}>Global Pickup Feed</h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).map(order => (
                                    <div key={order._id} className="order-card" style={{
                                        background: 'white',
                                        padding: '20px',
                                        borderRadius: '20px',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: order.assignedStaff ? 'none' : '0 4px 15px rgba(239, 68, 68, 0.05)'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                                                <span style={{ fontWeight: 'bold' }}>ORD #{order.orderId}</span>
                                                <span style={{ background: '#f1f5f9', fontSize: '0.65rem', padding: '3px 10px', borderRadius: '10px' }}>{order.status}</span>
                                                {order.assignedStaff ? (
                                                    <span style={{
                                                        background: order.assignedStaff._id === user._id ? '#dcfce7' : '#e0f2fe',
                                                        color: order.assignedStaff._id === user._id ? '#166534' : '#0369a1',
                                                        fontSize: '0.65rem', padding: '3px 10px', borderRadius: '10px', fontWeight: 'bold'
                                                    }}>
                                                        👤 {order.assignedStaff._id === user._id ? 'YOU' : order.assignedStaff.name}
                                                    </span>
                                                ) : (
                                                    <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.65rem', padding: '3px 10px', borderRadius: '10px', fontWeight: 'bold' }}>NEW</span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.9rem', margin: '5px 0' }}><strong>Order Name:</strong> {order.customerName}</p>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0' }}><strong>Account:</strong> {order.customer?.name}</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>📞 {order.mobileNumber}</p>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {order.address?.street}</p>
                                        </div>

                                        <div className="order-actions" style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setInspectionOrder(order)} style={{ background: '#64748b', color: 'white', padding: '10px 15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>📸 Inspect</button>
                                            {order.status === 'Pending' && <button onClick={() => updateStatus(order._id, 'Confirmed')} style={{ background: '#4f46e5', color: 'white', padding: '10px 15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>Claim</button>}
                                            {order.status === 'Confirmed' && <button onClick={() => updateStatus(order._id, 'Processing')} style={{ background: '#fbbf24', color: 'white', padding: '10px 15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>Wash</button>}
                                            {order.status === 'Processing' && <button onClick={() => updateStatus(order._id, 'Ready for Pickup')} style={{ background: '#10b981', color: 'white', padding: '10px 15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>Ready</button>}
                                            {order.status === 'Ready for Pickup' && <button onClick={() => updateStatus(order._id, 'Delivered')} style={{ background: '#1e293b', color: 'white', padding: '10px 25px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>Finish</button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'create-bill' && (
                        <div>
                            <h2 style={{ marginBottom: '25px', color: '#1e293b' }}>Billing Queue</h2>
                            <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
                                {orders.filter(o => o.billingStatus === 'Pending' && !['Delivered', 'Cancelled'].includes(o.status)).length > 0 ? (
                                    orders.filter(o => o.billingStatus === 'Pending' && !['Delivered', 'Cancelled'].includes(o.status)).map(order => (
                                        <div key={order._id} className="order-card" style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', borderLeft: '8px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ margin: 0 }}>Order #{order.orderId}</h4>
                                                <p style={{ margin: '5px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{order.customerName}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Account: {order.customer?.name}</p>
                                            </div>
                                            <button onClick={() => setBillingOrder(order)} style={{ background: '#f59e0b', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                                Bill
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No pending orders in the billing queue.</p>
                                )}
                            </div>

                            <h2 style={{ marginBottom: '25px', color: '#1e293b', opacity: 0.8 }}>Recently Billed by You</h2>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {orders.filter(o => o.billingStatus === 'Billed' && o.assignedStaff?._id === user._id).length > 0 ? (
                                    orders.filter(o => o.billingStatus === 'Billed' && o.assignedStaff?._id === user._id).slice(0, 5).map(order => (
                                        <div key={order._id} style={{ background: 'rgba(255,255,255,0.6)', padding: '15px 20px', borderRadius: '15px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 }}>
                                            <div>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>#{order.orderId}</span>
                                                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>BILLED</span>
                                                </div>
                                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}><strong>Name:</strong> {order.customerName} <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({order.customer?.name})</span></p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>₹{order.totalPrice}</span>
                                                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{order.weight} kg</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>You haven't generated any bills recently.</p>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
            `}</style>

            {billingOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Bill Generation</h3>
                        <form onSubmit={handleGenerateBill}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Weight (kg)</label>
                                <input type="number" step="0.1" required style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '12px', border: '2px solid #e2e8f0' }} value={billData.weight} onChange={(e) => setBillData({ ...billData, weight: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Amount (₹)</label>
                                <input type="number" required style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '12px', border: '2px solid #e2e8f0' }} value={billData.price} onChange={(e) => setBillData({ ...billData, price: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setBillingOrder(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontWeight: 'bold' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--staff-color)', color: 'white', fontWeight: 'bold' }}>Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {inspectionOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📸 Pre-Wash Inspection</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '20px' }}>Note any existing damage or stains for Order #{inspectionOrder.orderId}</p>
                        <form onSubmit={handleInspectionSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Photos (Max 5)</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setInspectionPhotos(Array.from(e.target.files))}
                                    style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Inspection Notes</label>
                                <textarea
                                    required
                                    placeholder="e.g., Small tear on left sleeve, tea stain on collar"
                                    style={{ width: '100%', padding: '12px', marginTop: '5px', borderRadius: '12px', border: '2px solid #e2e8f0', minHeight: '100px', fontFamily: 'inherit' }}
                                    value={inspectionNotes}
                                    onChange={(e) => setInspectionNotes(e.target.value)}
                                />
                            </div>

                            {inspectionOrder.inspectionPhotos?.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Previously Uploaded:</p>
                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                        {inspectionOrder.inspectionPhotos.map((path, idx) => (
                                            <img key={idx} src={`http://localhost:5050${path}`} alt="old" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setInspectionOrder(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontWeight: 'bold' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--staff-color)', color: 'white', fontWeight: 'bold' }}>Save Inspection</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
