import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { PieChart, BookCheck, Flame, Clock, AlertTriangle } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function AttendanceCalendar() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Shift so Mon=0
    const offset = (firstDay + 6) % 7;
    const today = now.getDate();

    // Fake attendance data for demo
    const status = {};
    for (let d = 1; d <= daysInMonth; d++) {
        const dow = new Date(year, month, d).getDay();
        if (dow === 0 || dow === 6) { status[d] = 'noclass'; continue; }
        if (d > today) { status[d] = 'future'; continue; }
        status[d] = d % 5 === 0 ? 'absent' : 'present';
    }

    const cellStyle = (d) => {
        const s = status[d];
        return {
            width: 36, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontFamily: 'Syne', fontWeight: d === today ? 700 : 500, cursor: 'default',
            background: s === 'present' ? 'var(--success-bg)' : s === 'absent' ? 'var(--danger-bg)' : 'transparent',
            color: s === 'present' ? 'var(--success)' : s === 'absent' ? 'var(--danger)' : s === 'future' ? 'var(--text3)' : 'var(--text3)',
            border: d === today && month === now.getMonth() ? '2px solid var(--accent)' : '2px solid transparent',
        };
    };

    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(<div key={`e${i}`} />);
    for (let d = 1; d <= daysInMonth; d++) cells.push(<div key={d} style={cellStyle(d)}>{d}</div>);

    return (
        <div className="card p-24">
            <div className="section-header">
                <div className="section-title">Attendance Calendar</div>
                <div className="flex items-center gap-8">
                    <button className="btn-secondary btn-icon btn-sm" onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}>‹</button>
                    <span style={{ fontFamily: 'Syne', fontSize: 14, minWidth: 110, textAlign: 'center' }}>{MONTHS[month]} {year}</span>
                    <button className="btn-secondary btn-icon btn-sm" onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}>›</button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.04em', paddingBottom: 8 }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>{cells}</div>
            <div className="flex gap-16" style={{ marginTop: 16 }}>
                {[['var(--success-bg)', 'var(--success)', 'Present'], ['var(--danger-bg)', 'var(--danger)', 'Absent'], ['transparent', 'var(--text3)', 'No Class']].map(([bg, c, l]) => (
                    <div key={l} className="flex items-center gap-8" style={{ fontSize: 12, color: 'var(--text2)' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: bg, border: `1px solid ${c}` }} />
                        {l}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/student/dashboard'),
            api.get('/student/attendance/subjects'),
        ]).then(([dashRes, subRes]) => {
            setData(dashRes.data);
            setSubjects(subRes.data);
        }).catch(() => {
            // Use demo data if API not running
            setData({ summary: { overallPercentage: 82, totalClasses: 60, totalPresent: 49, totalAbsent: 11, streakDays: 7 }, subjects: [] });
            setSubjects([
                { subject: 'Computer Networks', total: 30, present: 25, absent: 5, percentage: 83.3, statusLabel: 'GOOD' },
                { subject: 'Data Structures', total: 28, present: 19, absent: 9, percentage: 67.8, statusLabel: 'LOW' },
                { subject: 'DBMS', total: 25, present: 23, absent: 2, percentage: 92, statusLabel: 'GOOD' },
                { subject: 'Operating Systems', total: 22, present: 15, absent: 7, percentage: 68.1, statusLabel: 'LOW' },
            ]);
        }).finally(() => setLoading(false));
    }, []);

    const summary = data?.summary || {};
    const pct = summary.overallPercentage || 0;
    const lowSubjects = subjects.filter(s => s.percentage < 75);

    if (loading) return <DashboardLayout title="Overview"><div style={{ color: 'var(--text2)', marginTop: 40 }}>Loading...</div></DashboardLayout>;

    return (
        <DashboardLayout title="Student Overview">
            {/* Critical Alert for Low Attendance */}
            {lowSubjects.length > 0 && (
                <div 
                    className="animate-fadeup" 
                    style={{ 
                        background: '#FFF0ED', border: 'none', borderRadius: 12, padding: '20px 24px', 
                        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16,
                        boxShadow: '0 4px 12px rgba(238, 93, 80, 0.08)'
                    }}
                >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EE5D50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#EE5D50' }}>Critical Attendance Warning</div>
                        <div style={{ fontSize: 12, color: '#B04C43', marginTop: 2 }}>
                            Your attendance in <strong>{lowSubjects[0].subject}</strong> is <strong>{lowSubjects[0].percentage.toFixed(1)}%</strong>. Immediate improvement required.
                        </div>
                    </div>
                    <a href="/student/attendance" style={{ background: '#fff', padding: '8px 16px', borderRadius: 8, color: '#EE5D50', fontSize: 12, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>RESOLVE NOW</a>
                </div>
            )}

            {/* Stat cards */}
            <div className="stats-grid animate-fadeup-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
                <StatCard label="Overall Attendance" value={`${pct.toFixed(1)}%`} icon={<PieChart size={20} color={pct >= 75 ? '#05CD99' : '#EE5D50'} />} trend={`${summary.totalPresent}/${summary.totalClasses}`} delay={0} />
                <StatCard label="Total Present" value={summary.totalPresent} icon={<BookCheck size={20} color="#5D78FF" />} delay={60} />
                <StatCard label="Learning Streak" value={summary.streakDays} icon={<Flame size={20} color="#FFB547" />} trend="Days in a row" delay={120} />
                <StatCard label="Next Scheduled" value="10:30 AM" icon={<Clock size={20} color="#5D78FF" />} trend="CN • Room 204" delay={180} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, marginBottom: 24 }}>
                 {/* Calendar */}
                <div className="animate-fadeup-2">
                    <AttendanceCalendar />
                </div>

                {/* Subject Table */}
                <div className="card" style={{ background: '#fff', border: 'none', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div className="p-24 flex justify-between items-center" style={{ borderBottom: '1px solid #F4F7FE' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#A3AED0', letterSpacing: '0.05em' }}>SUBJECT PERFORMANCE</div>
                        <a href="/analytics" className="btn-secondary btn-sm" style={{ background: '#F4F7FE', border: 'none', color: '#707EAE' }}>ANALYTICS</a>
                    </div>
                    <table className="data-table">
                        <thead style={{ background: '#F4F7FE' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>COURSE NAME</th>
                                <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'center' }}>PRESENT</th>
                                <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'center' }}>PCT%</th>
                                <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'right' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map(s => (
                                <tr key={s.subject}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#2B3674' }}>{s.subject}</div>
                                        <div style={{ fontSize: 11, color: '#A3AED0' }}>Total: {s.total} Classes</div>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#2B3674' }}>{s.present}</td>
                                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: s.percentage >= 75 ? '#05CD99' : s.percentage >= 65 ? '#FFB547' : '#EE5D50' }}>{s.percentage.toFixed(1)}%</div>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <span style={{ 
                                            padding: '4px 12px', fontSize: 10, fontWeight: 700, borderRadius: 6,
                                            background: s.percentage >= 75 ? '#E6F9F4' : s.percentage >= 65 ? '#FFF9EE' : '#FFF0ED',
                                            color: s.percentage >= 75 ? '#05CD99' : s.percentage >= 65 ? '#FFB547' : '#EE5D50'
                                        }}>
                                            {s.percentage >= 75 ? 'ELIGIBLE' : s.percentage >= 65 ? 'WARNING' : 'INELIGIBLE'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
