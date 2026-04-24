import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function AdminAuth() {
    const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP (simulated)
    const [form, setForm] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleStep1 = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            // Simulate 2FA — validate credentials first
            const { data } = await api.post('/auth/login', form);
            if (data.role !== 'ADMIN') throw new Error('Access denied. Admin only.');
            localStorage.setItem('_admin_pending', JSON.stringify(data));
            setStep(2);
        } catch (err) { setError(err.response?.data?.error || err.message || 'Login failed.'); }
        finally { setLoading(false); }
    };

    const handleOtp = (idx, val) => {
        const next = [...otp]; next[idx] = val.slice(-1);
        setOtp(next);
        if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    };

    const handleVerify = (e) => {
        e.preventDefault();
        // Simulated OTP: any 6-digit code works
        const code = otp.join('');
        if (code.length < 6) { setError('Enter all 6 digits.'); return; }
        const pending = JSON.parse(localStorage.getItem('_admin_pending') || '{}');
        localStorage.removeItem('_admin_pending');
        login(pending, pending.token);
        navigate('/admin');
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/google', {
                idToken: credentialResponse.credential
            });

            if (data.role !== 'ADMIN') {
                setError('Access denied. This account does not have administrative privileges.');
                return;
            }

            // Since it's admin, we still skip OTP for Google users for now or could implement it
            login(data, data.token);
            navigate('/admin');
        } catch (err) {
            console.error('Google auth error:', err);
            setError(err.response?.data?.message || 'Google authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#F4F7FE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            {/* Security Background Pattern */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none', background: 'repeating-linear-gradient(45deg, #2B3674, #2B3674 1px, transparent 1px, transparent 20px)' }} />

            {/* Institutional Seal */}
            <div className="flex items-center gap-16" style={{ marginBottom: 40, zIndex: 1 }}>
                <div style={{ width: 48, height: 48, background: '#111C44', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(17,28,68,0.2)' }}>
                    <Shield size={24} color="#fff" />
                </div>
                <div>
                    <span style={{ fontWeight: 800, fontSize: 28, color: '#111C44', letterSpacing: '0.05em' }}>SRATS</span>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.1em', marginTop: -2 }}>ADMINISTRATIVE OVERWATCH</div>
                </div>
            </div>

            <div className="card" style={{ width: '100%', maxWidth: 420, padding: 48, background: '#fff', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', zIndex: 1 }}>
                <div style={{ marginBottom: 40, textAlign: 'center' }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#2B3674', marginBottom: 12 }}>System Governance</h2>
                    <p style={{ color: '#707EAE', fontSize: 14 }}>
                        {step === 1 ? 'Please provide authorized administrator credentials' : 'Verification code required for system access'}
                    </p>
                </div>

                {error && (
                    <div style={{ background: '#FFF0ED', color: '#EE5D50', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 24, border: '1px solid #FFCECB', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="form-group">
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 10, display: 'block' }}>USER IDENTIFIER</label>
                            <div style={{ position: 'relative' }}>
                                <input className="input-field" style={{ background: '#F4F7FE', border: 'none', borderRadius: 16, padding: '14px 16px', fontWeight: 600, color: '#2B3674' }} type="email" value={form.email} onChange={set('email')} placeholder="admin@srats.edu" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#2B3674', marginLeft: 4, marginBottom: 10, display: 'block' }}>SECURITY KEY</label>
                            <div style={{ position: 'relative' }}>
                                <input className="input-field" style={{ background: '#F4F7FE', border: 'none', borderRadius: 16, padding: '14px 48px 14px 16px', fontWeight: 600, color: '#2B3674' }} type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" required />
                                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#A3AED0' }}>
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" style={{ height: 54, borderRadius: 16, fontSize: 14, fontWeight: 800, marginTop: 12, background: '#111C44', border: 'none', boxShadow: '0 10px 30px rgba(17,28,68,0.3)' }} disabled={loading}>
                            {loading ? 'VALIDATING...' : 'AUTHORIZE SESSION'}
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
                                theme="filled_blue"
                                shape="pill"
                                size="large"
                                width="100%"
                            />
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            {otp.map((v, i) => (
                                <input 
                                    key={i} id={`otp-${i}`} value={v} onChange={e => handleOtp(i, e.target.value)}
                                    maxLength={1} 
                                    style={{ 
                                        width: 50, height: 64, textAlign: 'center', fontWeight: 800, fontSize: 24, 
                                        background: '#F4F7FE', border: '2px solid transparent', borderRadius: 14, 
                                        color: '#2B3674', outline: 'none', transition: 'all 200ms ease' 
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#422AFB'}
                                    onBlur={e => e.target.style.borderColor = 'transparent'}
                                />
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <button type="submit" className="btn-primary" style={{ height: 54, borderRadius: 16, fontSize: 14, fontWeight: 800, background: '#05CD99', border: 'none', boxShadow: '0 10px 30px rgba(5,205,153,0.3)' }}>
                                VERIFY & ACCESS
                            </button>
                            <button type="button" style={{ background: 'none', border: 'none', color: '#707EAE', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setStep(1)}>CANCEL REQUEST</button>
                        </div>
                    </form>
                )}
            </div>

            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#A3AED0', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', background: '#fff', padding: '10px 24px', borderRadius: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', zIndex: 1 }}>
                <Lock size={12} color="#05CD99" /> END-TO-END ENCRYPTED GATEWAY
            </div>
        </div>
    );
}
