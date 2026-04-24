import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Bell, MapPin, ChevronRight } from 'lucide-react';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'gps', label: 'GPS Settings', icon: MapPin },
];

function Toggle({ on, onToggle }) {
    return <div className={`toggle${on ? ' on' : ''}`} onClick={onToggle} role="switch" aria-checked={on} />;
}

function ProfileTab({ user }) {
    const [name, setName] = useState(user?.name || '');
    const [dept, setDept] = useState(user?.department || '');
    const [saved, setSaved] = useState(false);

    const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '24px', background: '#F4F7FE', borderRadius: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: '#111C44', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800 }}>
                    {user?.name?.charAt(0)}
                </div>
                <div>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: '#2B3674', marginBottom: 4 }}>{user?.name}</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                         <span style={{ background: '#422AFB', color: '#fff', padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>{user?.role}</span>
                         <span style={{ background: '#E9EDF7', color: '#707EAE', padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{user?.email}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4 }}>LEGAL NAME</label>
                    <input style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 12, padding: '14px 16px', fontWeight: 600, color: '#2B3674' }} value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4 }}>FACULTY DEPT / YEAR</label>
                    <input style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 12, padding: '14px 16px', fontWeight: 600, color: '#2B3674' }} value={dept} onChange={e => setDept(e.target.value)} />
                </div>
            </div>

            <button 
                onClick={save}
                style={{ background: '#111C44', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 16, fontSize: 14, fontWeight: 800, cursor: 'pointer', alignSelf: 'flex-start', boxShadow: '0 10px 20px rgba(17,28,68,0.2)' }}
            >
                {saved ? 'AUTHENTICATION UPDATE SUCCESSFUL' : 'UPDATE PORTAL PROFILE'}
            </button>
        </div>
    );
}

function GpsTab() {
    const [radius, setRadius] = useState(50);
    const [strictness, setStrictness] = useState('strict');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <label style={{ fontSize: 12, fontWeight: 800, color: '#2B3674', letterSpacing: '0.05em' }}>GEOFENCE RADIUS</label>
                            <span style={{ fontSize: 18, fontWeight: 900, color: '#422AFB' }}>{radius} METERS</span>
                        </div>
                        <input type="range" min={10} max={200} step={5} value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: '100%', accentColor: '#422AFB' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, fontWeight: 700, color: '#A3AED0' }}>
                            <span>10M (SECURE)</span>
                            <span>200M (LENIENT)</span>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: 12, fontWeight: 800, color: '#2B3674', letterSpacing: '0.05em', marginBottom: 16, display: 'block' }}>VIGILANCE MODE</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {['strict', 'moderate', 'lenient'].map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => setStrictness(s)} 
                                    style={{ 
                                        flex: 1,
                                        padding: '12px 0', 
                                        borderRadius: 12, 
                                        border: 'none',
                                        background: strictness === s ? '#111C44' : '#F4F7FE', 
                                        color: strictness === s ? '#fff' : '#A3AED0', 
                                        fontWeight: 800, 
                                        fontSize: 12, 
                                        cursor: 'pointer',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ background: '#F4F7FE', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <svg width="160" height="160" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r={Math.min(90, 30 + radius / 2.5)} fill="rgba(66,42,251,0.05)" stroke="#422AFB" strokeWidth="1" strokeDasharray="4,4" />
                        <circle cx="100" cy="100" r={Math.min(70, 20 + radius / 3)} fill="rgba(66,42,251,0.03)" stroke="#422AFB" strokeWidth="0.5" />
                        <circle cx="100" cy="100" r="12" fill="#111C44" />
                        <circle cx="100" cy="100" r="4" fill="#05CD99" />
                    </svg>
                    <div style={{ position: 'absolute', bottom: 20, fontSize: 10, color: '#707EAE', fontWeight: 800 }}>GPS ANCHOR PREVIEW</div>
                </div>
            </div>

            <button style={{ background: '#111C44', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 16, fontSize: 14, fontWeight: 800, cursor: 'pointer', alignSelf: 'flex-start' }}>
                CALIBRATE GPS GEOMETRY
            </button>
        </div>
    );
}

export default function Settings() {
    const { user } = useAuth();
    const [tab, setTab] = useState('profile');

    const tabContent = { profile: <ProfileTab user={user} />, security: <div style={{ color: '#A3AED0', fontWeight: 700 }}>Security module initialized.</div>, notifications: <div style={{ color: '#A3AED0', fontWeight: 700 }}>Notification services active.</div>, gps: <GpsTab /> };

    return (
        <DashboardLayout title="Portal Configuration" subtitle="System / Governance">
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>
                {/* Left navigation sidebar */}
                <div className="card" style={{ padding: 12, border: 'none', background: '#fff', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.02)' }}>
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button 
                            key={id} 
                            onClick={() => setTab(id)} 
                            style={{ 
                                width: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 16, 
                                padding: '16px 20px', 
                                borderRadius: 16, 
                                background: tab === id ? '#F4F7FE' : 'transparent', 
                                color: tab === id ? '#111C44' : '#A3AED0', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontWeight: 800, 
                                fontSize: 14, 
                                textAlign: 'left', 
                                transition: 'all 200ms ease',
                                marginBottom: 4 
                            }}
                        >
                            <Icon size={20} />
                            <span style={{ flex: 1 }}>{label.toUpperCase()}</span>
                            {tab === id && <ChevronRight size={18} />}
                        </button>
                    ))}
                </div>

                {/* Main dynamic card */}
                <div className="card" style={{ padding: 40, border: 'none', background: '#fff', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.02)', minHeight: 500 }}>
                    <div style={{ borderBottom: '1px solid #F4F7FE', paddingBottom: 24, marginBottom: 40 }}>
                         <h2 style={{ fontSize: 24, fontWeight: 900, color: '#2B3674', letterSpacing: '-0.02em' }}>
                            {TABS.find(t => t.id === tab)?.label.toUpperCase()}
                         </h2>
                         <p style={{ color: '#A3AED0', fontSize: 14, marginTop: 4 }}>Configure your institutional preferences and security parameters.</p>
                    </div>
                    {tabContent[tab]}
                </div>
            </div>
        </DashboardLayout>
    );
}
