import React, { useState } from 'react';
import axios from 'axios';

const StaffManagement = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const res = await axios.post('http://localhost:5050/api/auth/create-staff',
                { name, email, password },
                config
            );

            setMessage(res.data.message);
            setName('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create staff');
        }
    };

    return (
        <div className="staff-management">
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '10px' }}>Create Staff Profile</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Generate login credentials for new laundry staff members.</p>

            {message && <div className="success-message" style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleCreateStaff} style={{ maxWidth: '400px', marginTop: '20px' }}>
                <div className="form-group">
                    <label>Staff Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Enter full name"
                    />
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="staff@laundry.com"
                    />
                </div>
                <div className="form-group">
                    <label>Temporary Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Set a password"
                    />
                </div>
                <button type="submit" className="auth-button" style={{ background: 'var(--primary-color)', borderRadius: '12px', padding: '14px', fontWeight: 'bold' }}>Create Staff Account</button>
            </form>
        </div>
    );
};

export default StaffManagement;
