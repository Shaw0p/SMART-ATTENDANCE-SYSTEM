import { useState } from 'react';
import { Wifi, Copy, Check } from 'lucide-react';

const NetworkInfo = () => {
    const [copied, setCopied] = useState(false);
    const networkUrl = `http://${window.location.hostname}:5173`;

    const copy = () => {
        navigator.clipboard.writeText(networkUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: '#14141F',
            border: '1px solid rgba(212,160,23,0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            zIndex: 9999,
            maxWidth: 300,
            fontFamily: 'DM Sans, sans-serif'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Wifi size={16} color="#D4A017" />
                <span style={{ color: '#D4A017', fontSize: 12, fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>
                    OPEN ON PHONE
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code style={{
                    color: '#E8E8F0',
                    fontSize: 13,
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    flex: 1,
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    {networkUrl}
                </code>
                <button onClick={copy} style={{
                    background: 'rgba(212,160,23,0.15)',
                    border: '1px solid rgba(212,160,23,0.3)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    cursor: 'pointer',
                    color: '#D4A017'
                }}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>
            <p style={{ color: '#8A8AA0', fontSize: 11, marginTop: 8, marginBottom: 0 }}>
                Make sure phone and laptop are on the same WiFi
            </p>
        </div>
    );
};

export default NetworkInfo;
