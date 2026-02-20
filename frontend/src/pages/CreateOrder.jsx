import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateOrder = () => {
    const [services, setServices] = useState([]);
    const [cart, setCart] = useState([]);
    const [pickupDate, setPickupDate] = useState('');
    const [address, setAddress] = useState({ street: '', city: '', zipCode: '' });
    const [mobileNumber, setMobileNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            const res = await axios.get('http://localhost:5050/api/services');
            setServices(res.data);
        };
        fetchServices();
    }, []);

    const addToCart = (service) => {
        const existing = cart.find(item => item.service._id === service._id);
        if (existing) {
            setCart(cart.map(item =>
                item.service._id === service._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { service, quantity: 1, itemName: 'Item' }]);
        }
    };

    const removeFromCart = (serviceId) => {
        setCart(cart.filter(item => item.service._id !== serviceId));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.service.pricePerUnit * item.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return setError('Please add items to your cart');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const orderData = {
                items: cart.map(item => ({
                    service: item.service._id,
                    quantity: item.quantity,
                    itemName: item.itemName
                })),
                totalPrice: calculateTotal(),
                pickupDate,
                address,
                mobileNumber,
                customerName
            };

            await axios.post('http://localhost:5050/api/orders', orderData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            navigate('/customer');
        } catch (err) {
            console.error('Full Error Response:', err.response?.data);
            const serverMessage = err.response?.data?.message || 'Order failed';
            setError(serverMessage);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Create New Laundry Order</h2>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                    {/* Service Selection */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                        {services.map(service => (
                            <div key={service._id} style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{service.category}</div>
                                <h4 style={{ margin: '8px 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>{service.name}</h4>
                                <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹{service.pricePerUnit}</p>
                                <button onClick={() => addToCart(service)} className="auth-button" style={{ padding: '10px', marginTop: '10px', fontSize: '0.9rem', background: 'var(--primary-color)', borderRadius: '10px', fontWeight: 'bold' }}>Add to Basket</button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary & Details */}
                    <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', alignSelf: 'start' }}>
                        <h3 style={{ marginBottom: '20px' }}>Your Basket</h3>
                        <div>
                            {cart.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>Your basket is empty</p> : (
                                cart.map(item => (
                                    <div key={item.service._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div>
                                            <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.service.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.quantity} x ₹{item.service.pricePerUnit}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>₹{item.quantity * item.service.pricePerUnit}</p>
                                            <button onClick={() => removeFromCart(item.service._id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div style={{ marginTop: '15px', borderTop: '2px solid var(--border-color)', paddingTop: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--primary-color)' }}>₹{calculateTotal()}</span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ marginTop: '25px' }}>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem' }}>Pickup Time</label>
                                <input type="datetime-local" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required style={{ padding: '10px' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem' }}>Address</label>
                                <input type="text" placeholder="Street" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} required style={{ marginBottom: '8px', padding: '10px' }} />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required style={{ padding: '10px' }} />
                                    <input type="text" placeholder="Zip" value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} required style={{ padding: '10px' }} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem' }}>Mobile Number</label>
                                <input type="tel" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required style={{ padding: '10px' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: '0.8rem' }}>Customer Name</label>
                                <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required style={{ padding: '10px' }} />
                            </div>
                            {error && <p className="error-message" style={{ background: '#fee2e2', color: 'var(--error-color)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', marginTop: '15px' }}>{error}</p>}
                            <button type="submit" className="auth-button" style={{ marginTop: '20px', background: 'var(--primary-color)', padding: '14px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>Place Order</button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateOrder;
