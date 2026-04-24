import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, StopCircle, CheckCircle, XCircle, MapPin, Users } from 'lucide-react';

export default function LiveSession() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [session, setSession] = useState(state?.session || null);
    const [students, setStudents] = useState([]);
    const [countdown, setCountdown] = useState(30);
    const [elapsed, setElapsed] = useState('00:00');
    const [ending, setEnding] = useState(false);
    const [publicBaseUrl, setPublicBaseUrl] = useState(window.location.origin);

    // Auto-detect ngrok public URL so QR code works from any device
    useEffect(() => {
        fetch('/ngrok-api/tunnels')
            .then(r => r.json())
            .then(data => {
                const tunnel = data.tunnels?.find(t => t.proto === 'https');
                if (tunnel?.public_url) setPublicBaseUrl(tunnel.public_url);
            })
            .catch(() => {}); // fallback: keep window.location.origin
    }, []);

    // Poll active session every 5s
    const refresh = useCallback(async () => {
        try {
            const [sess, studs] = await Promise.all([
                api.get('/teacher/sessions/active'),
                session?.id ? api.get(`/teacher/sessions/${session.id}/attendance`) : Promise.resolve({ data: [] }),
            ]);
            setSession(sess.data);
            setStudents(studs.data);
        } catch {
            // No active session — went to demo mode
        }
    }, [session?.id]);

    useEffect(() => {
        refresh();
        const poll = setInterval(refresh, 5000);
        return () => clearInterval(poll);
    }, [refresh]);

    // QR countdown
    useEffect(() => {
        const t = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) {
                    api.post(`/teacher/sessions/${session?.id}/refresh-qr`).then(r => setSession(r.data)).catch(() => { });
                    return 30;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [session?.id]);

    // Elapsed timer
    useEffect(() => {
        if (!session?.startTime) return;
        const start = new Date(session.startTime);
        const t = setInterval(() => {
            const diff = Math.floor((Date.now() - start.getTime()) / 1000);
            const m = String(Math.floor(diff / 60)).padStart(2, '0');
            const s = String(diff % 60).padStart(2, '0');
            setElapsed(`${m}:${s}`);
        }, 1000);
        return () => clearInterval(t);
    }, [session?.startTime]);

    const endSession = async () => {
        if (!session?.id) return;
        setEnding(true);
        try { await api.put(`/teacher/sessions/${session.id}/end`); navigate('/teacher'); }
        catch { setEnding(false); }
    };

    const presentCount = students.filter(s => s.status === 'PRESENT').length;
    const blockedCount = students.filter(s => s.status === 'PROXY_BLOCKED').length;

    // Demo mode if no session from server
    const demoQrToken = 'demo-session-' + (session?.id || '001');

    return (
        <DashboardLayout title="Live Session Intelligence">
            {/* Session Intelligence Bar */}
            <div className="card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, border: 'none', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div className="flex items-center gap-24">
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#05CD99', filter: 'drop-shadow(0 0 4px #05CD99)' }} />
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#2B3674' }}>{session?.subject || 'Computer Networks'} • {session?.section || 'CSE-A'}</div>
                        <div style={{ color: '#707EAE', fontSize: 13, marginTop: 4 }}>Lecture Hall {session?.room || '204'} · Session Active for <strong>{elapsed || '00:00'}</strong></div>
                    </div>
                </div>
                <button className="btn-primary" style={{ background: '#EE5D50', height: 44, padding: '0 24px', fontSize: 12, fontWeight: 700 }} onClick={endSession} disabled={ending}>
                    <StopCircle size={16} /> {ending ? 'TERMINATING...' : 'TERMINATE SESSION'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
                {/* LEFT: QR + GPS Control */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* QR Code Matrix */}
                    <div className="card" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: '#fff', border: 'none' }}>
                        <div style={{ alignSelf: 'flex-start' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em', marginBottom: 4 }}>DYNAMIC TOKEN</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2B3674' }}>Authorization Matrix</h3>
                            <div style={{ fontSize: 10, color: publicBaseUrl.includes('ngrok') ? '#05CD99' : '#A3AED0', fontWeight: 600, marginTop: 4 }}>
                                Broadcast URL: {publicBaseUrl}
                            </div>
                        </div>
                        
                        <div style={{ padding: 32, background: '#F4F7FE', borderRadius: 24, position: 'relative' }}>
                            <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <QRCodeSVG value={`${publicBaseUrl}/student/scan?token=${session?.qrToken || demoQrToken}`} size={240} level="H" includeMargin={false} />
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#A3AED0', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>NEXT ROTATION IN</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: countdown <= 10 ? '#EE5D50' : '#2B3674', marginTop: 4 }}>
                                00:{String(countdown).padStart(2, '0')}
                            </div>
                            <div style={{ width: 240, height: 4, background: '#F4F7FE', borderRadius: 999, marginTop: 12, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(countdown / 30) * 100}%`, background: '#5D78FF', borderRadius: 999, transition: 'width 1s linear' }} />
                            </div>
                        </div>

                        <button className="btn-secondary" style={{ border: 'none', background: '#F4F7FE', color: '#5D78FF', height: 36, fontSize: 11, fontWeight: 700 }} onClick={() => api.post(`/teacher/sessions/${session?.id}/refresh-qr`).then(r => setSession(r.data)).catch(() => { })}>
                            <RefreshCw size={14} /> ROTATE TOKEN NOW
                        </button>
                    </div>

                    {/* Geofence Status */}
                    <div className="card" style={{ padding: 32, background: '#fff', border: 'none' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em', marginBottom: 20 }}>GEOGRAPHY VIGILANCE</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <svg width="140" height="140" viewBox="0 0 180 180" style={{ filter: 'drop-shadow(0 0 8px rgba(93,120,255,0.1))' }}>
                                <circle cx="90" cy="90" r="80" fill="none" stroke="#5D78FF" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />
                                <circle cx="90" cy="90" r="50" fill="rgba(93,120,255,0.02)" stroke="#5D78FF" strokeWidth="1" opacity="0.4" />
                                <circle cx="90" cy="90" r="12" fill="#000066" />
                                {[...Array(Math.min(presentCount || 0, 12))].map((_, i) => {
                                    const angle = (i / 12) * 2 * Math.PI;
                                    const r = 30 + (i % 4) * 10;
                                    return <circle key={i} cx={90 + r * Math.cos(angle)} cy={90 + r * Math.sin(angle)} r="4" fill="#05CD99" />;
                                })}
                            </svg>
                            <div className="flex gap-16" style={{ fontSize: 11, fontWeight: 600 }}>
                                <div className="flex items-center gap-6" style={{ color: '#05CD99' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#05CD99' }} /> COMPLIANT</div>
                                <div className="flex items-center gap-6" style={{ color: '#EE5D50' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EE5D50' }} /> BREACHED</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Live Audit Log */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: 'none' }}>
                    <div className="p-32" style={{ borderBottom: '1px solid #F4F7FE' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em', marginBottom: 8 }}>SESSION AUDIT LOG</div>
                        <div className="flex items-center justify-between">
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2B3674' }}>Verified Attendees</h3>
                            <div className="flex gap-8">
                                <span style={{ background: '#E6F9F4', color: '#05CD99', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{presentCount} OK</span>
                                {blockedCount > 0 && <span style={{ background: '#FFF0ED', color: '#EE5D50', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{blockedCount} BLOCKED</span>}
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: 600 }}>
                        {students.length === 0 ? (
                            <div style={{ padding: 60, textAlign: 'center', color: '#A3AED0' }}>
                                <Users size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                                <div style={{ fontSize: 14, fontWeight: 600 }}>Awaiting initial student scan...</div>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead style={{ background: '#F4F7FE' }}>
                                    <tr>
                                        <th style={{ padding: '12px 24px', fontSize: 10, color: '#A3AED0' }}>STUDENT IDENTIFIER</th>
                                        <th style={{ padding: '12px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'right' }}>VIGILANCE STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s, i) => (
                                        <tr key={s.id}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: '#2B3674' }}>{s.student?.name}</div>
                                                <div style={{ fontSize: 11, color: '#A3AED0', marginTop: 2 }}>{s.student?.rollNo} • {new Date(s.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                {s.status === 'PRESENT' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', color: '#05CD99', fontSize: 12, fontWeight: 600 }}>
                                                        <CheckCircle size={14} /> COMPLIANT
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', color: '#EE5D50', fontSize: 12, fontWeight: 600 }}>
                                                        <XCircle size={14} /> BREACHED ({Math.round(s.distanceMeters)}m)
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
