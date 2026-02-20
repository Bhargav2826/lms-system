import React from 'react';

const OrderStatus = ({ status }) => {
    const statuses = ['Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Delivered'];
    const currentIndex = statuses.indexOf(status);

    return (
        <div className="status-tracker" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '10px' }}>
                {statuses.map((s, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={s} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: isActive ? 'var(--primary-color)' : '#e2e8f0',
                                border: isCurrent ? '4px solid #dbeafe' : 'none',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px'
                            }}>
                                {isActive ? '✓' : index + 1}
                            </div>
                            <p style={{
                                fontSize: '10px',
                                marginTop: '8px',
                                textAlign: 'center',
                                color: isActive ? '#1e293b' : '#94a3b8',
                                fontWeight: isActive ? '600' : '400'
                            }}>{s}</p>
                        </div>
                    );
                })}
                {/* Progress Line */}
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '40px',
                    right: '40px',
                    height: '2px',
                    background: '#e2e8f0',
                    zIndex: 0
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '40px',
                    width: `${(currentIndex / (statuses.length - 1)) * 82}%`,
                    height: '2px',
                    background: 'var(--primary-color)',
                    zIndex: 0,
                    transition: 'width 0.5s ease'
                }}></div>
            </div>
        </div>
    );
};

export default OrderStatus;
