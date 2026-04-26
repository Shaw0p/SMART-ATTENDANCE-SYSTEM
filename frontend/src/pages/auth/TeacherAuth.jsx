import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Eye, EyeOff, QrCode } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function TeacherAuth() {
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', employeeId: '', department: '', designation: '', subject: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
            const payload = tab === 'login'
                ? { email: form.email, password: form.password }
                : {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: 'TEACHER',
                    employeeId: form.employeeId,
                    department: form.department,
                    designation: form.designation,
                    subject: form.subject
                };

            const { data } = await api.post(endpoint, payload);

            console.log('Auth response:', data);

            // Backend returns flat response — token is at data.token
            // role is at data.role as string "TEACHER"
            if (!data.token) {
                setError('No token received from server. Please try again.');
                return;
            }

            // Validate this is a teacher account
            const role = typeof data.role === 'string' ? data.role : data.role?.name?.();
            if (role !== 'TEACHER') {
                setError('This account is not registered as a faculty member.');
                return;
            }

            // Build clean user object from flat response
            const userData = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                role: data.role,
                department: data.department,
                employeeId: data.employeeId
            };

            // Save to AuthContext using correct key srats_token
            login(userData, data.token);

            console.log('✅ Teacher logged in:', userData.email);
            navigate('/teacher');

        } catch (err) {
            console.error('Auth error:', err.response?.status, err.response?.data);
            if (!err.response) {
                setError('Cannot reach the server. Make sure the backend is running and both devices are on the same WiFi.');
            } else if (err.response.status === 409) {
                setError('An account with this email or employee ID already exists. Please log in instead.');
            } else if (err.response.status === 400) {
                setError(err.response.data?.message || err.response.data?.error || 'Please check all fields and try again.');
            } else if (err.response.status === 401) {
                setError('Invalid email or password. Please try again.');
            } else if (err.response.status === 500) {
                setError('Server error. Please restart the backend and try again.');
            } else {
                setError(err.response.data?.message || err.response.data?.error || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/google', {
                idToken: credentialResponse.credential
            });

            // If it's a new teacher (no employee ID), show the registration form
            if (!data.employeeId) {
                setTab('register');
                setForm(f => ({
                    ...f,
                    name: data.name,
                    email: data.email,
                    password: 'GOOGLE_USER_PROFILE_COMPLETION' 
                }));
                setError('Welcome! Please complete your faculty profile to continue.');
                return;
            }

            if (data.role !== 'TEACHER') {
                setError('This account is registered as ' + data.role + '. Please use the correct portal.');
                return;
            }

            const userData = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                role: data.role,
                department: data.department,
                employeeId: data.employeeId
            };

            login(userData, data.token);
            navigate('/teacher');
        } catch (err) {
            console.error('Google auth error:', err);
            setError(err.response?.data?.message || 'Google authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', background: '#F4F7FE' }}>
            {/* BRANDING PANEL */}
            <div 
                style={{ 
                    flex: '0 0 40%', 
                    background: 'linear-gradient(135deg, #111C44 0%, #1B254B 100%)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 60,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Institutional Geometric Patterns */}
                <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
                
                <div className="flex items-center gap-12" style={{ marginBottom: 40, zIndex: 1 }}>
                    <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <QrCode size={24} color="#111C44" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: '0.05em' }}>SRATS</span>
                </div>

                {/* GPS Vigilance Visual */}
                <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="240" height="240" viewBox="0 0 240 240">
                        <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />
                        <circle cx="120" cy="120" r="60" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        <circle cx="120" cy="120" r="8" fill="#fff" />
                        {[...Array(6)].map((_, i) => {
                            const angle = (i / 6) * 2 * Math.PI;
                            const r = 40 + (i % 2) * 20;
                            return <circle key={i} cx={120 + r * Math.cos(angle)} cy={120 + r * Math.sin(angle)} r="4" fill="#05CD99" />;
                        })}
                    </svg>
                </div>

                <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>Faculty Command & Control.</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>Advanced session management and live attendance intelligence for academic staff.</p>
                </div>
            </div>

            {/* AUTHENTICATION FORM */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <div className="card" style={{ width: '100%', maxWidth: 440, padding: 48, background: '#fff', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: 40 }}>
                        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#2B3674', marginBottom: 8 }}>Faculty Portal</h1>
                        <p style={{ color: '#A3AED0', fontSize: 14 }}>Identify yourself to access the <strong>Academic Register</strong></p>
                    </div>

                    {/* Navigation Toggle */}
                    <div style={{ background: '#F4F7FE', borderRadius: 12, padding: 4, display: 'flex', marginBottom: 32 }}>
                        {['login', 'register'].map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{
                                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: 13,
                                background: tab === t ? '#fff' : 'transparent',
                                color: tab === t ? '#2B3674' : '#707EAE',
                                boxShadow: tab === t ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                transition: 'all 200ms ease'
                            }}>{t === 'login' ? 'Log In' : 'New Staff'}</button>
                        ))}
                    </div>

                    {error && (
                        <div style={{ background: '#FFF0ED', color: '#EE5D50', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 24, border: '1px solid #FFCECB' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {tab === 'register' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>FULL NAME</label>
                                    <input className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} value={form.name} onChange={set('name')} placeholder="Dr. Sarah Johnson" required />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>EMPLOYEE ID</label>
                                    <input className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} value={form.employeeId} onChange={set('employeeId')} placeholder="EMP1024" />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>DEPARTMENT</label>
                                    <select className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} value={form.department} onChange={set('department')}>
                                        <option value="">Select Dept</option>
                                        {['Computer Science', 'Information Technology', 'Electronics', 'Mathematics'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>SPECIALIZATION / SUBJECT</label>
                                    <input className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} value={form.subject} onChange={set('subject')} placeholder="e.g. Artificial Intelligence" />
                                </div>
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>FACULTY EMAIL</label>
                            <input className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} type="email" value={form.email} onChange={set('email')} placeholder="sarah.j@university.edu" required />
                        </div>
                        
                        <div className="form-group">
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>PASSWORD</label>
                            <div style={{ position: 'relative' }}>
                                <input className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 48px 12px 16px' }} type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" required />
                                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A3AED0' }}>
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ height: 50, borderRadius: 16, fontSize: 14, fontWeight: 800, marginTop: 12, background: '#422AFB', border: 'none', boxShadow: '0 10px 20px rgba(66,42,251,0.2)' }} disabled={loading}>
                            {loading ? 'AUTHENTICATING...' : tab === 'login' ? 'ACCESS PORTAL' : 'ESTABLISH CREDENTIALS'}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#E9EDF7' }}></div>
                            <span style={{ margin: '0 10px', color: '#A3AED0', fontSize: 12, fontWeight: 600 }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: '#E9EDF7' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess} 
                                onError={() => setError('Google Login Failed')}
                                theme="outline"
                                shape="pill"
                                size="large"
                                width="100%"
                            />
                        </div>
                    </form>

                    <div style={{ marginTop: 32, textAlign: 'center' }}>
                        <span style={{ color: '#A3AED0', fontSize: 14, fontWeight: 500 }}>Student? </span>
                        <Link to="/auth/student" style={{ color: '#422AFB', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Back to Student Portal</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
