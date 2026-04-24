import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

export default function Records() {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        api.get('/teacher/sessions/my').catch(() => null).then(res => {
            setSessions(res?.data || [
                { id: 1, subject: 'Computer Networks', section: 'CSE-A', room: '204', startTime: new Date(Date.now() - 3600000).toISOString(), active: false, presentCount: 28, totalEnrolled: 35 },
                { id: 2, subject: 'Data Structures', section: 'CSE-B', room: '102', startTime: new Date(Date.now() - 172800000).toISOString(), active: false, presentCount: 30, totalEnrolled: 38 },
                { id: 3, subject: 'Computer Networks', section: 'CSE-A', room: '204', startTime: new Date(Date.now() - 259200000).toISOString(), active: false, presentCount: 22, totalEnrolled: 35 },
            ]);
        });
    }, []);

    return (
        <DashboardLayout title="Institutional Archives">
            <div className="section-header" style={{ marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2B3674' }}>Session Register</h2>
                    <p style={{ color: '#A3AED0', fontSize: 13, marginTop: 4 }}>Archives of all historical attendance protocols initiated</p>
                </div>
                <div style={{ background: '#fff', padding: '12px 24px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', fontSize: 13, fontWeight: 700, color: '#2B3674' }}>
                    TOTAL ENTRIES: <span style={{ color: '#5D78FF' }}>{sessions.length}</span>
                </div>
            </div>

            <div className="card" style={{ background: '#fff', border: 'none', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <table className="data-table">
                    <thead style={{ background: '#F4F7FE' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>SUBJECT DESCRIPTION</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>SEC</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>ROOM</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>TIMESTAMP</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'center' }}>ATTENDANCE</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'right' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((s, i) => {
                            const pct = s.presentCount && s.totalEnrolled ? ((s.presentCount / s.totalEnrolled) * 100).toFixed(0) : '—';
                            return (
                                <tr key={s.id}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2B3674' }}>{s.subject}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontSize: 13, fontWeight: 600, color: '#707EAE' }}>{s.section || '—'}</td>
                                    <td style={{ padding: '20px 24px', fontSize: 13, color: '#707EAE' }}>{s.room || '—'}</td>
                                    <td style={{ padding: '20px 24px', fontSize: 12, color: '#707EAE', fontFamily: 'monospace' }}>
                                        {new Date(s.startTime).toLocaleDateString()} • {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2B3674' }}>{s.presentCount ?? '—'} <span style={{ color: '#A3AED0', fontWeight: 500, fontSize: 12 }}>/ {s.totalEnrolled || '0'}</span></div>
                                        {pct !== '—' && <div style={{ fontSize: 10, fontWeight: 700, color: '#5D78FF', marginTop: 2 }}>{pct}% COMPLIANCE</div>}
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        {s.active ? (
                                            <span style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700, borderRadius: 6, background: '#E6F9F4', color: '#05CD99' }}>LIVE NOW</span>
                                        ) : (
                                            <span style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700, borderRadius: 6, background: '#F4F7FE', color: '#A3AED0' }}>ARCHIVED</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
