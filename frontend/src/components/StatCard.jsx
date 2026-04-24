export default function StatCard({ label, value, icon, iconBg, trend, status, delay = 0 }) {
    const isAlert = status === 'ACTION REQUIRED';

    return (
        <div 
            className={`card stat-card animate-fadeup`} 
            style={{ 
                animationDelay: `${delay}ms`,
                background: '#fff',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                padding: '24px',
                position: 'relative',
                borderLeft: isAlert ? '4px solid #EE5D50' : 'none'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div 
                    style={{ 
                        width: 48, height: 48, borderRadius: 12, 
                        background: iconBg || '#F4F7FE', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}
                >
                    {icon}
                </div>
                {trend && (
                    <div style={{ background: '#E6F9F4', color: '#05CD99', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 2 }}>
                        {trend}
                    </div>
                )}
                {isAlert && (
                    <div style={{ background: '#FFF0ED', color: '#EE5D50', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 8, letterSpacing: '0.02em' }}>
                        ACTION REQUIRED
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#A3AED0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {label}
                </span>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#2B3674', letterSpacing: '-0.02em' }}>
                    {value}
                </span>
            </div>
        </div>
    );
}
