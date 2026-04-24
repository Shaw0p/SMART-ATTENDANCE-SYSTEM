import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import { PlayCircle, Users, BarChart3, AlertTriangle, Radio, Plus, FileDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [exporting, setExporting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            api.get('/teacher/dashboard'),
            api.get('/teacher/sessions/my'),
        ]).then(([d, s]) => { setData(d.data); setSessions(s.data); })
            .catch(() => {
                setData({ todaySessionsCount: 2, totalSessionsHeld: 24, livePresent: 0, avgAttendancePercent: 78.4, activeSessionId: null });
                setSessions([
                    { id: 1, subject: 'Computer Networks', section: 'CSE-A', room: '204', startTime: new Date().toISOString(), active: false },
                    { id: 2, subject: 'Data Structures', section: 'CSE-B', room: '102', startTime: new Date(Date.now() - 86400000).toISOString(), active: false },
                ]);
            });
    }, []);

    const handleExport = async () => {
        if (!user || !user.department || !user.subject) {
            alert("Department or Subject not found for your profile.");
            return;
        }

        try {
            setExporting(true);
            const response = await api.get(`/reports/exam-eligibility`, {
                params: {
                    departmentId: user.department,
                    subjectCode: user.subject
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Exam_Eligibility_${user.department}_${user.subject}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to export report. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const d = data || {};

    return (
        <DashboardLayout title="Faculty Overview">
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
                <StatCard label="Today's Sessions" value={d.todaySessionsCount ?? 0} icon={<PlayCircle size={20} color="var(--accent)" />} delay={0} />
                <StatCard label="Students Present" value={d.livePresent ?? 0} icon={<Users size={20} color="var(--success)" />} trend="Live count" delay={60} />
                <StatCard label="Avg Attendance" value={`${(d.avgAttendancePercent || 0).toFixed(1)}%`} icon={<BarChart3 size={20} color="var(--accent)" />} trend="This semester" delay={120} />
                <StatCard label="Defaulters List" value={d.defaulterCount ?? 0} icon={<AlertTriangle size={20} color="#EE5D50" />} status="ACTION REQUIRED" iconBg="#FFF0ED" delay={180} />
            </div>

            {/* Active Session Activity */}
            <div className="animate-fadeup-2" style={{ marginBottom: 24 }}>
                {d.activeSessionId ? (
                    <div className="card" style={{ padding: 32, border: 'none', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="flex items-center gap-16">
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#05CD99', filter: 'drop-shadow(0 0 4px #05CD99)' }} />
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#2B3674' }}>Active Session in Progress</div>
                                <div style={{ color: '#707EAE', fontSize: 13, marginTop: 4 }}>{d.livePresent} students have marked attendance so far</div>
                            </div>
                        </div>
                        <button className="btn-primary" style={{ background: '#000066' }} onClick={() => navigate('/teacher/live-session')}>
                            <Radio size={16} /> VIEW LIVE PORTAL
                        </button>
                    </div>
                ) : (
                    <div className="card shadow-sm" style={{ padding: 40, textAlign: 'center', border: '2px dashed #E9EDF7', background: '#fff' }} onClick={() => navigate('/teacher/start-session')}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Plus size={28} color="var(--accent)" />
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2B3674', marginBottom: 8 }}>Initialize New Live Session</h2>
                        <p style={{ color: '#A3AED0', fontSize: 14, maxWidth: 400, margin: '0 auto 24px' }}>Create a secure, geofenced QR code for your current class and monitor student check-ins in real-time.</p>
                        <button className="btn-primary" style={{ background: '#000066', height: 48, padding: '0 32px' }}>BEGIN SESSION NOW</button>
                    </div>
                )}
            </div>

            {/* Session History */}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2B3674', marginBottom: 20 }}>Session History</h2>
            <div className="card" style={{ background: '#fff', border: 'none', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div className="p-24 flex justify-between items-center" style={{ borderBottom: '1px solid #F4F7FE' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em' }}>RECENT RECORDS</div>
                    <div className="flex gap-12">
                        <button 
                            className="btn-secondary btn-sm" 
                            style={{ background: '#F4F7FE', border: 'none', color: '#707EAE' }}
                            onClick={handleExport}
                            disabled={exporting}
                        >
                            <FileDown size={14} /> 
                            {exporting ? 'EXPORTING...' : 'EXPORT ELIGIBILITY'}
                        </button>
                        <a href="/teacher/records" className="btn-primary btn-sm" style={{ background: '#000066' }}>VIEW ALL RECORDS</a>
                    </div>
                </div>
                <table className="data-table">
                    <thead style={{ background: '#F4F7FE' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>SUBJECT / CODE</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>SECTION</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>ROOM</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'right' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.slice(0, 5).map(s => (
                            <tr key={s.id}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2B3674' }}>{s.subject}</div>
                                    <div style={{ fontSize: 11, color: '#A3AED0' }}>{new Date(s.startTime).toLocaleDateString()}</div>
                                </td>
                                <td style={{ padding: '20px 24px', fontSize: 13, fontWeight: 600, color: '#707EAE' }}>{s.section || 'N/A'}</td>
                                <td style={{ padding: '20px 24px', fontSize: 13, color: '#707EAE' }}>{s.room || '—'}</td>
                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                    {s.active ? (
                                        <span style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700, borderRadius: 6, background: '#E6F9F4', color: '#05CD99' }}>LIVE NOW</span>
                                    ) : (
                                        <span style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700, borderRadius: 6, background: '#F4F7FE', color: '#A3AED0' }}>ARCHIVED</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
