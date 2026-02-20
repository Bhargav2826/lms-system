import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Wash & Fold');
    const [unit, setUnit] = useState('piece');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await axios.get('http://localhost:5050/api/services');
            setServices(res.data);
        } catch (err) {
            console.error('Failed to fetch services');
        }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.post('http://localhost:5050/api/services',
                { name, pricePerUnit: price, category, unit },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setMessage('Service added successfully');
            setName('');
            setPrice('');
            fetchServices();
        } catch (err) {
            console.error('Service Add Failed:', err.response?.data?.message || err.message);
            setMessage(err.response?.data?.message || 'Failed to add service');
        }
    };

    const handleDelete = async (id) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.delete(`http://localhost:5050/api/services/${id}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            fetchServices();
        } catch (err) {
            console.error('Delete failed');
        }
    };

    return (
        <div className="service-management">
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Pricing Engine & Services</h2>
            <div className="admin-card" style={{ marginTop: '20px', padding: '25px', background: 'var(--bg-color)', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                <h3>Add New Service</h3>
                <form onSubmit={handleAddService} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                    <div className="form-group">
                        <label>Service Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Regular Shirt Wash" />
                    </div>
                    <div className="form-group">
                        <label>Price (₹)</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option>Wash & Fold</option>
                            <option>Ironing</option>
                            <option>Dry Clean</option>
                            <option>Premium Wash</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Unit</label>
                        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                            <option value="piece">Per Piece</option>
                            <option value="kg">Per KG</option>
                        </select>
                    </div>
                    <button type="submit" className="auth-button" style={{ gridColumn: '1 / -1', background: 'var(--primary-color)', borderRadius: '12px', padding: '14px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>Create Service</button>
                </form>
                {message && <p style={{ marginTop: '10px', color: 'var(--primary-color)', fontWeight: '600' }}>{message}</p>}
            </div>

            <div className="services-list" style={{ marginTop: '30px' }}>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '15px' }}>Active Services</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Category</th>
                            <th style={{ padding: '12px' }}>Price</th>
                            <th style={{ padding: '12px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px' }}>{service.name}</td>
                                <td style={{ padding: '12px' }}>{service.category}</td>
                                <td style={{ padding: '12px' }}>₹{service.pricePerUnit} / {service.unit}</td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => handleDelete(service._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Deactivate</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServiceManagement;
