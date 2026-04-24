import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ScanQR() {
    const [gpsStatus, setGpsStatus] = useState('acquiring');
    const gpsCoordsRef = useRef(null);          // ref = no stale closure
    const [gpsDisplay, setGpsDisplay] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [isHttps, setIsHttps] = useState(window.location.protocol === 'https:');
    const [cameraError, setCameraError] = useState('');
    const html5QrRef = useRef(null);
    const navigate = useNavigate();

    // --- GPS ---
    useEffect(() => {
        if (!navigator.geolocation) { setGpsStatus('denied'); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                gpsCoordsRef.current = coords;
                setGpsDisplay(coords);
                setGpsStatus('ready');
            },
            () => setGpsStatus('denied'),
            { enableHighAccuracy: true, timeout: 15000 }
        );
    }, []);

    // --- Camera ---
    useEffect(() => {
        const timer = setTimeout(() => {
            if (html5QrRef.current) return;
            try {
                const scanner = new Html5Qrcode('qr-reader');
                html5QrRef.current = scanner;
                scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 220, height: 220 } },
                    handleScan,
                    () => {}
                ).then(() => setCameraReady(true))
                  .catch((err) => {
                    console.warn('Camera error:', err);
                    setCameraError(err);
                    setCameraReady(false);
                 });
            } catch (e) { console.warn(e); }
        }, 400);

        return () => {
            clearTimeout(timer);
            if (html5QrRef.current) {
                html5QrRef.current.stop().catch(() => {});
                html5QrRef.current = null;
            }
        };
    }, []);

    // --- Scan handler — reads gpsCoordsRef so it is NEVER stale ---
    const handleScan = async (qrToken) => {
        if (loading || scanResult) return;
        const coords = gpsCoordsRef.current;
        if (!coords) return;                     // GPS not ready yet
        const token = qrToken.includes('?token=') ? qrToken.split('?token=')[1] : qrToken;
        html5QrRef.current?.stop().catch(() => {});
        setLoading(true);
        try {
            const { data } = await api.post('/student/attendance/mark', {
                qrToken: token,
                studentLat: coords.lat,
                studentLon: coords.lon,
            });
            setResultData(data);
            setScanResult(data.success ? 'success' : 'blocked');
            if (data.success) setTimeout(() => navigate('/student'), 3000);
        } catch (err) {
            setResultData({ message: err.response?.data?.error || 'Server error. Is the session still active?' });
            setScanResult('blocked');
        } finally { setLoading(false); }
    };

    return (
        <DashboardLayout title="Security Dispatch">
            <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Satellite GPS Verification */}
                <div 
                    className="card" 
                    style={{ 
                        padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, 
                        background: gpsStatus === 'ready' ? '#E6F9F4' : gpsStatus === 'denied' ? '#FFF0ED' : '#fff', 
                        border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}
                >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: gpsStatus === 'ready' ? '#05CD99' : gpsStatus === 'denied' ? '#EE5D50' : '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2B3674' }}>
                            {gpsStatus === 'acquiring' && 'ACQUIRING POSITION...'}
                            {gpsStatus === 'ready' && 'LOCATION VERIFIED ✓'}
                            {gpsStatus === 'denied' && 'ACCESS DENIED'}
                        </div>
                        {gpsDisplay && <div className="mono" style={{ fontSize: 10, color: '#707EAE', marginTop: 4, letterSpacing: '0.05em' }}>COORD: {gpsDisplay.lat.toFixed(5)}, {gpsDisplay.lon.toFixed(5)}</div>}
                    </div>
                    {gpsStatus === 'acquiring' && <Loader2 size={18} className="spinner" color="#A3AED0" />}
                </div>

                {/* Neural Token Scanner */}
                {!scanResult && !loading && (
                    <div className="card" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, background: '#fff', border: 'none' }}>
                        <div style={{ alignSelf: 'flex-start' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em', marginBottom: 4 }}>AUTHORIZATION</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2B3674' }}>Neural Scan</h3>
                        </div>
                        
                        <div id="qr-reader" style={{ width: '100%', maxWidth: 300, borderRadius: 24, overflow: 'hidden', background: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                        
                        {!isHttps && window.location.hostname !== 'localhost' && (
                            <div style={{ background: '#FFF0ED', color: '#EE5D50', padding: 12, borderRadius: 12, fontSize: 11, fontWeight: 700, textAlign: 'center' }}>
                                ⚠️ SECURITY BLOCK: Camera & GPS require HTTPS. Please use the Ngrok URL.
                            </div>
                        )}

                        {cameraError && (
                            <div style={{ color: '#EE5D50', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                                Camera Access Denied. Please enable camera permissions in your browser settings.
                            </div>
                        )}

                        <div style={{ color: '#A3AED0', fontSize: 12, textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>
                            {gpsStatus === 'acquiring'
                                ? 'Awaiting cryptographic GPS lock before submitting scan...'
                                : 'Please align the session QR code within the digital viewfinder.'}
                        </div>
                    </div>
                )}

                {/* Processing Overlay */}
                {loading && (
                    <div className="card" style={{ padding: 60, textAlign: 'center', border: 'none', background: '#fff' }}>
                        <Loader2 size={48} className="spinner" color="#5D78FF" style={{ margin: '0 auto 24px' }} />
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#2B3674' }}>Authenticating...</div>
                        <div style={{ fontSize: 13, color: '#A3AED0', marginTop: 8 }}>Cryptographic verification in progress</div>
                    </div>
                )}

                {/* VALIDATED SUCCESS */}
                {scanResult === 'success' && (
                    <div className="card" style={{ padding: 60, textAlign: 'center', border: 'none', background: '#E6F9F4' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#05CD99', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <CheckCircle size={40} color="#fff" />
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#05CD99', marginBottom: 12 }}>ACCESS GRANTED</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#2B3674' }}>{resultData?.subject}</div>
                        <div className="mono" style={{ fontSize: 12, color: '#05CD99', marginTop: 8 }}>{new Date().toLocaleTimeString()} • Verified ✓</div>
                        <div style={{ fontSize: 12, color: '#707EAE', marginTop: 32 }}>Synchronizing dashboard...</div>
                    </div>
                )}

                {/* BLOCKED ACCESS */}
                {scanResult === 'blocked' && (
                    <div className="card" style={{ padding: 60, textAlign: 'center', border: 'none', background: '#FFF0ED' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#EE5D50', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <XCircle size={40} color="#fff" />
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#EE5D50', marginBottom: 12 }}>ACCESS DENIED</div>
                        <div style={{ fontSize: 14, color: '#B04C43', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>{resultData?.message}</div>
                        <button className="btn-primary" style={{ marginTop: 32, background: '#EE5D50', border: 'none', width: '100%' }} onClick={() => window.location.reload()}>RETRY AUTHENTICATION</button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
