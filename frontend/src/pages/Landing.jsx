import { useNavigate } from 'react-router-dom';
import { QrCode, MapPin, ShieldCheck, BarChart2, Bell, Zap } from 'lucide-react';

const features = [
    { icon: QrCode, title: 'QR Code Scanning', desc: 'Unique QR per session. Auto-expires every 30 seconds to prevent sharing.' },
    { icon: MapPin, title: 'GPS Geofencing', desc: 'Haversine distance check. Students must be within 50m of the classroom.' },
    { icon: ShieldCheck, title: 'Anti-Proxy Detection', desc: 'Distance + QR validation blocks every proxy attempt in real time.' },
    { icon: Zap, title: 'Real-Time Marking', desc: 'Attendance hits the database the moment the QR is scanned. No delays.' },
    { icon: Bell, title: 'Defaulter Alerts', desc: 'Automated notifications when student attendance drops below 75%.' },
    { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Subject-wise breakdowns, trend charts, and semester heatmaps.' },
];

const steps = [
    { n: '01', title: 'Teacher Starts Session', desc: 'Set subject, room, and GPS anchor. System generates a unique QR.' },
    { n: '02', title: 'QR + GPS Radius Active', desc: 'QR displayed on screen. 50m geofence activated around classroom.' },
    { n: '03', title: 'Students Scan & Verify', desc: 'Student scans QR. Backend checks location. Attendance marked instantly.' },
];

export default function Landing() {
    const navigate = useNavigate();
    return (
        <div style={{ minHeight: '100vh', background: '#F4F7FE' }}>
            {/* NAVBAR */}
            <nav style={{ 
                height: 80, 
                background: 'rgba(17, 28, 68, 0.95)', 
                backdropFilter: 'blur(20px)', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                position: 'sticky', 
                top: 0, 
                zIndex: 100, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0 80px' 
            }}>
                <div className="flex items-center gap-12">
                    <div style={{ width: 36, height: 36, background: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <QrCode size={20} color="#111C44" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 24, color: '#fff', letterSpacing: '0.05em' }}>SRATS</span>
                </div>
                <div className="flex items-center gap-40">
                    <div className="flex gap-32">
                        {['Features', 'Intelligence', 'Institutions'].map(item => (
                            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>{item}</a>
                        ))}
                    </div>
                    <button 
                        onClick={() => navigate('/auth/student')}
                        style={{ background: '#422AFB', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px rgba(66,42,251,0.2)' }}
                    >
                        ACCESS PORTAL
                    </button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header style={{ 
                minHeight: '85vh', 
                background: 'linear-gradient(135deg, #111C44 0%, #1B254B 100%)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                textAlign: 'center',
                padding: '0 40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Cryptographic Background Pattern */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(66,42,251,0.1)', filter: 'blur(100px)' }} />
                <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(5,205,153,0.05)', filter: 'blur(80px)' }} />

                <div style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '8px 20px', 
                    borderRadius: 999, 
                    color: '#05CD99', 
                    fontSize: 12, 
                    fontWeight: 800, 
                    letterSpacing: '0.2em', 
                    marginBottom: 32,
                    border: '1px solid rgba(5,205,153,0.2)'
                }}>
                    SECURED BY CRYPTOGRAPHIC LEDGER
                </div>

                <h1 style={{ fontSize: 72, fontWeight: 800, color: '#fff', maxWidth: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
                    Institutional Attendance <br />
                    <span style={{ color: '#422AFB' }}>Reinforced by GPS.</span>
                </h1>

                <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', maxWidth: 640, lineHeight: 1.6, marginBottom: 48 }}>
                    Eliminate proxy culture with dynamic QR verification and sub-meter precision geofencing. The gold standard for modern academic oversight.
                </p>

                <div className="flex gap-20">
                    <button 
                        onClick={() => navigate('/auth/student')}
                        style={{ background: '#fff', color: '#111C44', border: 'none', padding: '18px 40px', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                    >
                        Student Portal
                    </button>
                    <button 
                        onClick={() => navigate('/auth/teacher')}
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 40px', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
                    >
                        Faculty Access
                    </button>
                </div>
            </header>

            {/* TRUST STRIP */}
            <section style={{ transform: 'translateY(-50%)', margin: '0 auto', maxWidth: 1000, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, padding: '0 40px' }}>
                {[
                    { val: '99.9%', label: 'ACCURACY RATE', color: '#05CD99' },
                    { val: 'ZERO', label: 'PROXY TOLERANCE', color: '#EE5D50' },
                    { val: '200ms', label: 'VERIFICATION SPEED', color: '#422AFB' }
                ].map(stat => (
                    <div key={stat.label} style={{ background: '#fff', padding: 40, borderRadius: 24, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.val}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.1em' }}>{stat.label}</div>
                    </div>
                ))}
            </section>

            {/* FEATURE GRID */}
            <section id="features" style={{ padding: '80px 80px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <h2 style={{ fontSize: 36, fontWeight: 800, color: '#2B3674', marginBottom: 16 }}>Advanced Institutional Vigilance</h2>
                    <p style={{ color: '#707EAE', fontSize: 18 }}>The most robust feature set ever deployed for academic attendance tracking.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="card" style={{ padding: 32, border: 'none', background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', transition: 'transform 300ms ease' }}>
                            <div style={{ width: 56, height: 56, background: '#F4F7FE', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                <Icon size={24} color="#422AFB" />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2B3674', marginBottom: 12 }}>{title}</h3>
                            <p style={{ color: '#A3AED0', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section style={{ padding: '120px 40px', background: '#fff', textAlign: 'center' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', background: 'linear-gradient(135deg, #422AFB 0%, #111C44 100%)', padding: 80, borderRadius: 40, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, background: 'radial-gradient(circle at top right, #fff, transparent)' }} />
                    <h2 style={{ fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 24, zIndex: 1, position: 'relative' }}>Ready to Modernize?</h2>
                    <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 40, zIndex: 1, position: 'relative' }}>Join the elite institutions using SRATS to maintain academic integrity.</p>
                    <button 
                        onClick={() => navigate('/auth/student')}
                        style={{ background: '#fff', color: '#422AFB', border: 'none', padding: '20px 48px', borderRadius: 16, fontSize: 16, fontWeight: 800, cursor: 'pointer', zIndex: 1, position: 'relative' }}
                    >
                        Initialize System Setup
                    </button>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '80px 80px 40px', background: '#111C44', color: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 80 }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 24 }}>SRATS</div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>The definitive high-precision attendance management platform for higher education institutions.</p>
                    </div>
                    {['Product', 'Legal', 'Governance'].map(cat => (
                        <div key={cat}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 24, letterSpacing: '0.05em' }}>{cat.toUpperCase()}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {['Analytics', 'Privacy', 'Compliance'].map(link => (
                                    <a key={link} href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13 }}>{link}</a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 40, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                    © 2026 INSTITUTIONAL ATTENDANCE LEDGER. POWERED BY SUB-METER GPS VIGILANCE.
                </div>
            </footer>
        </div>
    );
}
