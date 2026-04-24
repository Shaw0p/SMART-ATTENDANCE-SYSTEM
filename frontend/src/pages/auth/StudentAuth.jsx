import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { QrCode, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function StudentAuth() {
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', rollNo: '', department: '', year: 1 });
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
                    role: 'STUDENT',
                    rollNo: form.rollNo,
                    department: form.department,
                    year: parseInt(form.year) || 1
                };

            const { data } = await api.post(endpoint, payload);

            // data is flat: { token, userId, name, email, role, department, rollNo }
            // role comes back as plain string "STUDENT"
            if (!data.token) {
                setError('No token received from server. Please try again.');
                return;
            }

            if (data.role !== 'STUDENT') {
                setError('This account is not registered as a student. Use the Teacher portal instead.');
                return;
            }

            // Build clean userData object
            const userData = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                role: data.role,
                department: data.department,
                rollNo: data.rollNo
            };

            login(userData, data.token);
            navigate('/student');

        } catch (err) {
            console.error('Auth error:', err.response?.status, err.response?.data);
            if (!err.response) {
                setError('Cannot reach the server. Make sure the backend is running on port 8080 and both devices are on the same WiFi network.');
            } else if (err.response.status === 409) {
                setError('An account with this email or roll number already exists. Please log in instead.');
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

            if (data.role !== 'STUDENT') {
                setError('This account is registered as ' + data.role + '. Please use the correct portal.');
                return;
            }

            const userData = {
                userId: data.userId,
                name: data.name,
                email: data.email,
                role: data.role,
                department: data.department,
                rollNo: data.rollNo
            };

            login(userData, data.token);
            navigate('/student');
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

                <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>Institutional Integrity through Technology.</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>Empowering academic oversight with cryptographic attendance verification.</p>
                </div>

                <div style={{ marginTop: 60, padding: '12px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', zIndex: 1 }}>
                    SECURED BY CRYPTOGRAPHIC LEDGER
                </div>
            </div>

            {/* AUTHENTICATION FORM */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <div className="card" style={{ width: '100%', maxWidth: 440, padding: 48, background: '#fff', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: 40 }}>
                        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#2B3674', marginBottom: 8 }}>{tab === 'login' ? 'Sign In' : 'Registration'}</h1>
                        <p style={{ color: '#A3AED0', fontSize: 14 }}>Enter your credentials to access the <strong>Student Portal</strong></p>
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
                            }}>{t === 'login' ? 'Log In' : 'New Account'}</button>
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
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>FULL LEGAL NAME</label>
                                    <input className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} value={form.name} onChange={set('name')} placeholder="e.g. John Doe" required />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>ROLL NUMBER</label>
                                    <input className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} value={form.rollNo} onChange={set('rollNo')} placeholder="CS21102" />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>YEAR</label>
                                    <select className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} value={form.year} onChange={set('year')}>
                                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}st Year</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>DEPARTMENT</label>
                                    <select className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} value={form.department} onChange={set('department')}>
                                        <option value="">Select Department</option>
                                        {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>INSTITUTIONAL EMAIL</label>
                            <input className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 16px' }} type="email" value={form.email} onChange={set('email')} placeholder="mail@university.edu" required />
                        </div>
                        
                        <div className="form-group">
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 8, display: 'block' }}>PASSWORD</label>
                            <div style={{ position: 'relative' }}>
                                <input className="input-field" style={{ background: '#fff', border: '1px solid #E9EDF7', borderRadius: 16, padding: '12px 48px 12px 16px' }} type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />
                                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A3AED0' }}>
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ height: 50, borderRadius: 16, fontSize: 14, fontWeight: 800, marginTop: 12, background: '#422AFB', border: 'none', boxShadow: '0 10px 20px rgba(66,42,251,0.2)' }} disabled={loading}>
                            {loading ? 'AUTHENTICATING...' : tab === 'login' ? 'SIGN IN' : 'COMPLETE REGISTRATION'}
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
                        <span style={{ color: '#A3AED0', fontSize: 14, fontWeight: 500 }}>Academic Staff? </span>
                        <a href="/auth/teacher" style={{ color: '#422AFB', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Login to Faculty Portal</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
