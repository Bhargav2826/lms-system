import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderMonitoring = () => {
    const [orders, setOrders] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            const [ordersRes, staffRes] = await Promise.all([
                axios.get('http://localhost:5050/api/orders/all', config),
                axios.get('http://localhost:5050/api/auth/get-staff', config)
            ]);

            setOrders(ordersRes.data);
            setStaff(staffRes.data);
        } catch (err) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleAssign = async (orderId, staffId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.put(`http://localhost:5050/api/orders/${orderId}/assign`,
                { assignedStaff: staffId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setMessage('Assignment updated!');
            fetchData();
            setTimeout(() => setMessage(''), 30000);
        } catch (err) {
            setMessage('Failed to assign staff');
        }
    };

    return (
        <div className="order-monitoring">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Global Order Feed</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Monitor and assign tasks in real-time.</p>
                </div>
                {message && <span style={{ background: '#dcfce7', color: 'var(--success-color)', padding: '5px 15px', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 'bold' }}>{message}</span>}
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--bg-color)' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Order ID</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Customer</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Items</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Price</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Assigned To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Loading...</td></tr> : orders.map(order => (
                            <tr key={order._id}>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ fontWeight: 'bold' }}>#{order.orderId}</span>
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{order.customerName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Account: {order.customer?.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customer?.email}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 'bold', marginTop: '4px' }}>📞 {order.mobileNumber}</div>
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>{order.items.length}</td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', color: 'var(--primary-color)' }}>₹{order.totalPrice}</td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        background: order.status === 'Ready for Pickup' ? '#dcfce7' : '#eff6ff',
                                        color: order.status === 'Ready for Pickup' ? 'var(--success-color)' : 'var(--primary-color)'
                                    }}>{order.status}</span>
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                    <select
                                        value={order.assignedStaff?._id || ''}
                                        onChange={(e) => handleAssign(order._id, e.target.value)}
                                        style={{
                                            padding: '6px',
                                            borderRadius: '5px',
                                            fontSize: '0.8rem',
                                            border: '1px solid #cbd5e1',
                                            width: '100%'
                                        }}
                                    >
                                        <option value="">Unassigned</option>
                                        {staff.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                    {order.inspectionNotes && (
                                        <div style={{ marginTop: '10px', fontSize: '0.7rem', background: '#f8fafc', padding: '8px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '3px' }}>📋 Inspection Note:</div>
                                            <div>{order.inspectionNotes}</div>
                                            {order.inspectionPhotos?.length > 0 && (
                                                <div style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>
                                                    {order.inspectionPhotos.map((p, i) => (
                                                        <img key={i} src={`http://localhost:5050${p}`} alt="damage" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '3px', cursor: 'pointer' }} onClick={() => window.open(`http://localhost:5050${p}`, '_blank')} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderMonitoring;
