import { useState } from 'react';
import api from '../api/axios';

const NetworkTest = () => {
    const [results, setResults] = useState([]);
    const [testing, setTesting] = useState(false);

    const runTests = async () => {
        setTesting(true);
        setResults([]);
        const tests = [];

        // Test 1: Can we reach backend health
        try {
            const res = await fetch(`http://${window.location.hostname}:8080/actuator/health`);
            const data = await res.json();
            tests.push({ name: 'Backend Health', status: 'PASS', detail: data.status });
        } catch (e) {
            tests.push({ name: 'Backend Health', status: 'FAIL', detail: e.message });
        }

        // Test 2: Can we reach API
        try {
            await api.get('/auth/test').catch(e => {
                if (e.response) {
                    tests.push({ name: 'API Reachable', status: 'PASS', detail: `HTTP ${e.response.status}` });
                } else throw e;
            });
            // If no error thrown, also pass
            if (!tests.find(t => t.name === 'API Reachable')) {
                tests.push({ name: 'API Reachable', status: 'PASS', detail: 'HTTP 200' });
            }
        } catch (e) {
            tests.push({ name: 'API Reachable', status: 'FAIL', detail: e.message });
        }

        // Test 3: GPS available
        if (navigator.geolocation) {
            tests.push({ name: 'GPS Available', status: 'PASS', detail: 'navigator.geolocation exists' });
        } else {
            tests.push({ name: 'GPS Available', status: 'FAIL', detail: 'Not supported on this browser' });
        }

        // Test 4: Camera available
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(d => d.kind === 'videoinput');
            tests.push({ name: 'Camera Available', status: cameras.length > 0 ? 'PASS' : 'FAIL', detail: `${cameras.length} camera(s) found` });
        } catch (e) {
            tests.push({ name: 'Camera Available', status: 'FAIL', detail: e.message });
        }

        setResults(tests);
        setTesting(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#08080F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 32, maxWidth: 480, width: '100%' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#E8E8F0', marginBottom: 8, marginTop: 0 }}>Network Diagnostics</h2>
                <p style={{ color: '#8A8AA0', fontSize: 14, marginBottom: 24 }}>
                    Current host: <code style={{ color: '#D4A017' }}>{window.location.hostname}</code><br />
                    Backend URL: <code style={{ color: '#D4A017' }}>{`http://${window.location.hostname}:8080/api`}</code>
                </p>
                <button onClick={runTests} disabled={testing} style={{
                    background: '#D4A017', color: 'white', border: 'none', borderRadius: 8,
                    padding: '10px 20px', fontFamily: 'Syne, sans-serif', fontWeight: 600,
                    cursor: 'pointer', width: '100%', marginBottom: 24
                }}>
                    {testing ? 'Running Tests...' : 'Run Connection Tests'}
                </button>
                {results.map((r, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div>
                            <div style={{ color: '#E8E8F0', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{r.name}</div>
                            <div style={{ color: '#8A8AA0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{r.detail}</div>
                        </div>
                        <span style={{
                            color: r.status === 'PASS' ? '#2ECC71' : '#E74C4C',
                            background: r.status === 'PASS' ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)',
                            borderRadius: 999, padding: '2px 10px', fontSize: 12,
                            fontFamily: 'Syne, sans-serif', fontWeight: 600
                        }}>
                            {r.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NetworkTest;
