import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5050/api/auth/login', { email, password });
            if (res.data.role !== 'customer') {
                setError('Please use the Admin or Staff portals for management accounts.');
                return;
            }
            login(res.data);
            navigate('/customer');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container user-theme">
            <div className="auth-card">
                <h2>Customer Login</h2>
                <p>Access your laundry orders and profile</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="auth-button">Sign In</button>
                </form>
                <div className="auth-footer">
                    <p>New customer? <Link to="/register">Create Account</Link></p>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
