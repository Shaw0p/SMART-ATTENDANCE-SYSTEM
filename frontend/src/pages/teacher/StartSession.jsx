import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { MapPin, Radio, Loader2 } from 'lucide-react';

export default function StartSession() {
    const [form, setForm] = useState({ subject: '', section: '', room: '', latitude: '', longitude: '', radius: 300 });
    const [acquiring, setAcquiring] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

    const getLocation = () => {
        setAcquiring(true);
        navigator.geolocation.getCurrentPosition(pos => {
            setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(7), longitude: pos.coords.longitude.toFixed(7) }));
            setAcquiring(false);
        }, () => { setError('Location access denied. Enter coordinates manually.'); setAcquiring(false); });
    };

    const submit = async e => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const { data } = await api.post('/teacher/sessions/start', {
                subject: form.subject, section: form.section, room: form.room,
                latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
                radius: parseFloat(form.radius),
            });
            navigate('/teacher/live-session', { state: { session: data } });
        } catch (err) { setError(err.response?.data?.error || 'Failed to start session.'); }
        finally { setLoading(false); }
    };

    return (
        <DashboardLayout title="Initialize Session">
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <div className="card" style={{ padding: 40, border: 'none', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                    <div className="flex items-center gap-16" style={{ marginBottom: 32 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Radio size={24} color="#5D78FF" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2B3674' }}>Live Attendance Protocol</h2>
                            <p style={{ color: '#A3AED0', fontSize: 13, marginTop: 4 }}>Initialize geofencing and generate secure session tokens</p>
                        </div>
                    </div>

                    {error && <div style={{ background: '#FFF0ED', borderRadius: 8, padding: '12px 16px', marginBottom: 24, color: '#EE5D50', fontSize: 13, fontWeight: 600 }}>{error}</div>}

                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-group">
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>SUBJECT DESCRIPTION *</label>
                            <input className="input-field" style={{ border: '1px solid #E9EDF7', height: 48, borderRadius: 10 }} value={form.subject} onChange={set('subject')} placeholder="e.g., Computer Networks" required />
                        </div>
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="form-group">
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>CLASS SECTION</label>
                                <input className="input-field" style={{ border: '1px solid #E9EDF7', height: 48, borderRadius: 10 }} value={form.section} onChange={set('section')} placeholder="CSE-A" />
                            </div>
                            <div className="form-group">
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>LECTURE HALL / ROOM</label>
                                <input className="input-field" style={{ border: '1px solid #E9EDF7', height: 48, borderRadius: 10 }} value={form.room} onChange={set('room')} placeholder="204" />
                            </div>
                        </div>

                        {/* GPS section */}
                        <div style={{ padding: '24px 0', borderTop: '1px solid #F4F7FE' }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em' }}>GEOSPATIAL ANCHOR *</label>
                                <button type="button" className="btn-secondary" style={{ height: 32, fontSize: 11, background: '#F4F7FE', border: 'none', color: '#5D78FF' }} onClick={getLocation} disabled={acquiring}>
                                    {acquiring ? <Loader2 size={13} className="spinner" /> : <MapPin size={13} />}
                                    {acquiring ? 'ACQUIRING...' : 'SYNC LOCATION'}
                                </button>
                            </div>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div className="form-group">
                                    <input className="input-field mono" style={{ border: '1px solid #E9EDF7', height: 44, borderRadius: 8, fontSize: 12 }} value={form.latitude} onChange={set('latitude')} placeholder="Latitude" required />
                                </div>
                                <div className="form-group">
                                    <input className="input-field mono" style={{ border: '1px solid #E9EDF7', height: 44, borderRadius: 8, fontSize: 12 }} value={form.longitude} onChange={set('longitude')} placeholder="Longitude" required />
                                </div>
                            </div>
                        </div>

                        {/* Radius slider */}
                        <div className="form-group">
                            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em' }}>GEOFENCE RADIUS</label>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#5D78FF' }}>{form.radius}m</span>
                            </div>
                            <input type="range" min={50} max={1000} step={50} value={form.radius} onChange={set('radius')}
                                style={{ width: '100%', accentColor: '#5D78FF' }} />
                        </div>

                        <button type="submit" className="btn-primary w-full" style={{ background: '#000066', height: 54, borderRadius: 12, fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', marginTop: 12 }} disabled={loading}>
                            {loading ? <Loader2 size={18} className="spinner" /> : 'AUTHORIZE & COMMENCE SESSION'}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
