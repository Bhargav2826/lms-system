import React, { useState } from 'react';
import axios from 'axios';

const ServiceRequest = ({ onOrderSuccess }) => {
    const [pickupDate, setPickupDate] = useState('');
    const [address, setAddress] = useState({ street: '', city: '', zipCode: '' });
    const [mobileNumber, setMobileNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));

            const orderData = {
                items: [],
                totalPrice: 0,
                pickupDate,
                address,
                mobileNumber,
                customerName,
                isBulk: true,
                discountAmount: 0,
                orderType: 'Bulk-Weighted',
                billingStatus: 'Pending'
            };

            await axios.post('http://localhost:5050/api/orders', orderData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            onOrderSuccess();
        } catch (err) {
            console.error('Full Error Response:', err.response?.data);
            const serverMessage = err.response?.data?.message || 'Order failed';
            setError(serverMessage);
        }
    };

    return (
        <div className="service-request-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', padding: '0 10px' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '10px' }}>Schedule Bulk Pickup</h2>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>We'll weigh your laundry at collection.</p>
            </div>

            <div className="service-request-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 1fr', gap: '30px', padding: '10px' }}>
                {/* Information Card */}
                <div style={{ background: 'var(--primary-color)', color: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Bulk Logistics Policy</h3>
                    <ul style={{ padding: 0, listStyle: 'none', display: 'grid', gap: '15px' }}>
                        <li style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🚛</span>
                            <div>
                                <small style={{ display: 'block', fontWeight: 'bold' }}>Doorstep Collection</small>
                                <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>We pick up from your home.</span>
                            </div>
                        </li>
                        <li style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>⚖️</span>
                            <div>
                                <small style={{ display: 'block', fontWeight: 'bold' }}>Verified Weight</small>
                                <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>Calculated at collection.</span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Form Container */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Pickup Time</label>
                            <input
                                type="datetime-local"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                required
                                style={{ padding: '12px', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Address</label>
                            <input
                                type="text"
                                placeholder="Street"
                                value={address.street}
                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                required
                                style={{ marginBottom: '10px', padding: '12px', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={address.city}
                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                    required
                                    style={{ padding: '12px', width: '60%', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                />
                                <input
                                    type="text"
                                    placeholder="Zip"
                                    value={address.zipCode}
                                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                                    required
                                    style={{ padding: '12px', width: '40%', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mobile Number</label>
                            <input
                                type="tel"
                                placeholder="Mobile Number"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                required
                                style={{ padding: '12px', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Full Name</label>
                            <input
                                type="text"
                                placeholder="Customer Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                                style={{ padding: '12px', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        {error && (
                            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '15px' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                        >
                            Request Pickup
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequest;
