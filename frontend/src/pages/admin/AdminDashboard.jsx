import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import { 
    Users, GraduationCap, BarChart3, AlertTriangle, 
    Activity, Shield, Cpu, Filter, Download, AlertCircle
} from 'lucide-react';

const FEED_EVENTS = [
    { time: '09:42 AM', title: 'External perimeter breach cleared. Gate 4 operational.', icon: Shield, color: '#422AFB' },
    { time: '08:15 AM', title: 'Server Node 7 synchronized successfully with Central Ledger.', icon: Cpu, color: '#05CD99' },
    { time: '07:30 AM', title: 'Routine system maintenance completed for Student Portal.', icon: Activity, color: 'rgba(255,255,255,0.4)' },
];

export default function AdminDashboard() {
    const [kpis, setKpis] = useState({ totalStudents: 0, totalFaculty: 0, activeSessions: 0, alerts: 0, campusAttendancePercent: 0 });
    const [deptStats, setDeptStats] = useState([]);
    const [defaulters, setDefaulters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/admin/dashboard'),
            api.get('/admin/defaulters?threshold=75')
        ]).then(([dashRes, defRes]) => {
            if (dashRes.data) {
                setKpis(dashRes.data);
                setDeptStats(dashRes.data.deptStats || []);
            }
            if (defRes.data) {
                setDefaulters(defRes.data);
            }
        }).catch(err => {
            console.error("Dashboard load failed", err);
        }).finally(() => setLoading(false));
    }, []);

    const exportGlobalLedger = async () => {
        try {
            const response = await api.get('/reports/exam-eligibility?departmentId=ALL&subjectCode=ALL', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Institutional_Ledger_${new Date().toLocaleDateString()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Export failed. Please ensure the reporting engine is online.");
        }
    };

    return (
        <DashboardLayout title="Institutional Governance">
            {/* Stat Cards Row */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
                <StatCard label="Total Enrollment" value={kpis.totalStudents.toLocaleString()} icon={<GraduationCap size={20} color="#422AFB" />} delay={0} />
                <StatCard label="Academic Staff" value={kpis.totalFaculty} icon={<Users size={20} color="#422AFB" />} delay={60} />
                <StatCard label="Live Classrooms" value={kpis.activeSessions} icon={<BarChart3 size={20} color="#422AFB" />} delay={120} />
                <StatCard label="Deficit Alerts" value={defaulters.length} icon={<AlertTriangle size={20} color="#EE5D50" />} status="REMEDIATION NEEDED" iconBg="#FFF0ED" delay={180} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 24, marginBottom: 24 }}>
                {/* Departmental Index */}
                <div className="card" style={{ background: '#fff', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', padding: 32 }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#422AFB', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Performance Metrics</div>
                            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2B3674' }}>Departmental Compliance Index</h2>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#05CD99' }}>LIVE SYNC STATUS ACTIVE</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {deptStats.length > 0 ? deptStats.map((d, i) => (
                            <div key={i}>
                                <div className="flex justify-between" style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#707EAE' }}>
                                    <span>{d.department}</span>
                                    <span style={{ color: '#2B3674' }}>{d.attendancePercent}%</span>
                                </div>
                                <div style={{ height: 8, width: '100%', background: '#F4F7FE', borderRadius: 10 }}>
                                    <div style={{ height: '100%', width: `${d.attendancePercent}%`, background: d.attendancePercent >= 75 ? '#05CD99' : '#422AFB', borderRadius: 10, transition: 'width 1s ease-in-out' }} />
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: 40, textAlign: 'center', color: '#A3AED0', fontSize: 14 }}>
                                Awaiting departmental data synchronization...
                            </div>
                        )}
                    </div>

                    {/* Institutional Intelligence */}
                    <div style={{ marginTop: 32, background: '#F4F7FE', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 12, background: '#111C44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>{kpis.campusAttendancePercent}%</div>
                        <div>
                            <div style={{ fontWeight: 800, color: '#2B3674', fontSize: 15, marginBottom: 4 }}>Institutional Attendance Average</div>
                            <div style={{ fontSize: 12, color: '#707EAE', lineHeight: 1.4 }}>Aggregated participation across all departments for the current academic cycle.</div>
                        </div>
                    </div>
                </div>

                {/* System Activity Hub */}
                <div 
                    className="card" 
                    style={{ 
                        background: '#111C44', 
                        color: '#fff', 
                        border: 'none', 
                        padding: 32,
                        borderRadius: 20,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', opacity: 0.05, backgroundImage: 'radial-gradient(circle at top right, #422AFB, transparent)' }} />
                    <div className="flex items-center gap-10" style={{ marginBottom: 32, position: 'relative' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#05CD99', filter: 'drop-shadow(0 0 4px #05CD99)' }} />
                        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em' }}>SATELLITE SYNC: ACTIVE</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>
                        {FEED_EVENTS.map((event, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <event.icon size={18} color={event.color} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>{event.time}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)' }}>{event.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        className="btn-secondary" 
                        style={{ 
                            width: '100%', background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)', color: '#fff', 
                            height: 48, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', 
                            marginTop: 48, position: 'relative'
                        }}
                    >
                        SYSTEM DIAGNOSTICS
                    </button>
                </div>
            </div>

            {/* Critical Oversight Feed */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                 <h2 style={{ fontSize: 18, fontWeight: 800, color: '#2B3674' }}>Institutional Defaulter Sentinel</h2>
                 <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={exportGlobalLedger} className="btn-primary" style={{ background: '#111C44', height: 40, border: 'none', padding: '0 20px', borderRadius: 10, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Download size={14} /> EXPORT GLOBAL LEDGER
                    </button>
                 </div>
            </div>

            <div className="card" style={{ background: '#fff', border: 'none', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.02)', borderRadius: 20 }}>
                {defaulters.length > 0 ? (
                <table className="data-table">
                    <thead style={{ background: '#F4F7FE' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>LEARNER / ID</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>DEPARTMENT / SUBJECT</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>CURRENT STANDING</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>LEVEL</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'right' }}>VIGILANCE STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {defaulters.slice(0, 10).map((d, i) => (
                            <tr key={i}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div className="flex items-center gap-12">
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#422AFB' }}>{d.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#2B3674' }}>{d.name}</div>
                                            <div style={{ fontSize: 10, color: '#A3AED0', fontWeight: 600 }}>{d.rollNo}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2B3674' }}>{d.subject}</div>
                                    <div style={{ fontSize: 11, color: '#707EAE' }}>{d.department}</div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ height: 6, width: 80, background: '#F4F7FE', borderRadius: 10 }}>
                                            <div style={{ height: '100%', width: `${d.percentage}%`, background: d.percentage >= 70 ? '#FFB547' : '#EE5D50', borderRadius: 10 }} />
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 900, color: d.percentage >= 70 ? '#FFB547' : '#EE5D50' }}>{d.percentage.toFixed(1)}%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px', fontSize: 13, fontWeight: 600, color: '#707EAE' }}>L0{Math.floor(Math.random() * 4) + 1}</td>
                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                    <span style={{ 
                                        padding: '4px 12px', fontSize: 10, fontWeight: 800, borderRadius: 6,
                                        background: '#FFF0ED', color: '#EE5D50'
                                    }}>
                                        BELOW THRESHOLD
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                ) : (
                    <div style={{ padding: 80, textAlign: 'center' }}>
                         <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E6F9F4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <AlertCircle size={32} color="#05CD99" />
                         </div>
                         <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2B3674' }}>Campus Integrity Optimal</h3>
                         <p style={{ color: '#A3AED0', fontSize: 14, marginTop: 4 }}>No behavioral anomalies or attendance deficits detected across the institutional grid.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
