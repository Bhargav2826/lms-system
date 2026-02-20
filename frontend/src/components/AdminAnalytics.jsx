import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const res = await axios.get('http://localhost:5050/api/analytics/stats', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) return <p>Loading Analytics...</p>;

    return (
        <div className="admin-analytics">
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Revenue</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success-color)' }}>₹{stats.totalRevenue}</p>
                </div>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Orders</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.totalOrders}</p>
                </div>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Active Staff</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.staffCount}</p>
                </div>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Customers</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.customerCount}</p>
                </div>
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '20px' }}>Daily Order Activity (Last 7 Days)</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '200px', paddingBottom: '30px' }}>
                    {stats.dailyOrders.map(day => {
                        const height = (day.count / Math.max(...stats.dailyOrders.map(d => d.count), 1)) * 150;
                        return (
                            <div key={day._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${height}px`,
                                    background: 'var(--primary-color)',
                                    borderRadius: '5px 5px 0 0',
                                    position: 'relative'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        top: '-25px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold'
                                    }}>{day.count}</span>
                                </div>
                                <span style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', transform: 'rotate(-45deg)', marginTop: '5px' }}>
                                    {day._id.split('-').slice(1).join('/')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
