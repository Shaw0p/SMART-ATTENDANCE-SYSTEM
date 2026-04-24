import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import api from '../api/axios';
import { Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TREND_DEMO = [
    { date: 'Feb 1', present: 82 }, { date: 'Feb 3', present: 78 }, { date: 'Feb 5', present: 85 },
    { date: 'Feb 7', present: 72 }, { date: 'Feb 10', present: 88 }, { date: 'Feb 12', present: 84 },
    { date: 'Feb 14', present: 91 }, { date: 'Feb 17', present: 79 }, { date: 'Feb 19', present: 86 },
    { date: 'Feb 21', present: 83 }, { date: 'Feb 24', present: 90 }, { date: 'Feb 26', present: 85 },
];

const SUBJECT_DEMO = [
    { subject: 'Computer Networks', pct: 83 }, { subject: 'Data Structures', pct: 68 },
    { subject: 'DBMS', pct: 92 }, { subject: 'OS', pct: 66 }, { subject: 'Software Eng.', pct: 77 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', border: 'none', borderRadius: 12, padding: '12px 16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <div style={{ color: '#A3AED0', fontSize: 12, fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>{label.toUpperCase()}</div>
            <div style={{ color: '#2B3674', fontSize: 18, fontWeight: 800 }}>{payload[0].value}% <span style={{ fontSize: 11, fontWeight: 600, color: '#05CD99' }}>PRESENT</span></div>
        </div>
    );
};

export default function Analytics() {
    const { user } = useAuth();
    const [trend, setTrend] = useState(TREND_DEMO);
    const [subjects, setSubjects] = useState(SUBJECT_DEMO);
    const [defaulters, setDefaulters] = useState([]);
    const [days, setDays] = useState(30);
    const [trendSubject, setTrendSubject] = useState('Computer Networks');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        api.get(`/reports/trend?subject=${encodeURIComponent(trendSubject)}&days=${days}`).catch(() => null).then(res => {
            if (res?.data?.length) setTrend(res.data.map(d => ({ date: d.date, present: d.present })));
        });
    }, [trendSubject, days]);

    useEffect(() => {
        api.get('/reports/defaulters').catch(() => null).then(res => {
            if (res?.data) setDefaulters(res.data);
        });
    }, []);

    const downloadExcel = async () => {
        setIsDownloading(true);
        try {
            const dept = user?.department || 'CS';
            const response = await api.get(`/reports/exam-eligibility?departmentId=${dept}&subjectCode=${trendSubject}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Eligibility_Report_${dept}_${trendSubject}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed', err);
            alert('Failed to generate Excel report. Ensure backend services are active.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <DashboardLayout title="Institutional Analytics" subtitle="Reports / Global Insights">
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 32 }}>
                <button 
                    onClick={() => window.print()}
                    style={{ background: '#fff', color: '#2B3674', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Download size={16} /> EXPORT PDF
                </button>
                <button 
                    onClick={downloadExcel}
                    disabled={isDownloading}
                    style={{ background: '#111C44', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: isDownloading ? 'wait' : 'pointer', boxShadow: '0 10px 20px rgba(17,28,68,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Download size={16} /> {isDownloading ? 'GENERATING...' : 'DATA DUMP (XLSX)'}
                </button>
            </div>

            {/* Main Trend analysis */}
            <div className="card" style={{ padding: 32, border: 'none', background: '#fff', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.02)', marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                    <div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2B3674', marginBottom: 4 }}>Attendance Trajectory</h3>
                        <p style={{ color: '#A3AED0', fontSize: 14 }}>Longitudinal participation data across selected curricula</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                         <select 
                            style={{ background: '#F4F7FE', border: 'none', padding: '8px 16px', borderRadius: 12, fontWeight: 700, color: '#2B3674', outline: 'none' }}
                            value={days} onChange={e => setDays(Number(e.target.value))}
                         >
                            <option value={7}>LAST 7 DAYS</option>
                            <option value={30}>LAST 30 DAYS</option>
                            <option value={90}>SEMESTER VIEW</option>
                         </select>
                         <select 
                            style={{ background: '#F4F7FE', border: 'none', padding: '8px 16px', borderRadius: 12, fontWeight: 700, color: '#2B3674', outline: 'none' }}
                            value={trendSubject} onChange={e => setTrendSubject(e.target.value)}
                         >
                            {['Computer Networks', 'Data Structures', 'DBMS', 'Operating Systems'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                         </select>
                    </div>
                </div>

                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="jadeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#422AFB" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#422AFB" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F7FE" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 600 }} tickFormatter={v => `${v}%`} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#422AFB', strokeWidth: 1, strokeDasharray: '5 5' }} />
                            <Area type="monotone" dataKey="present" stroke="#422AFB" strokeWidth={3} fill="url(#jadeGrad)" dot={{ r: 4, fill: '#fff', stroke: '#422AFB', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#422AFB', stroke: '#fff', strokeWidth: 2 }} />
                            <ReferenceLine y={75} stroke="#EE5D50" strokeDasharray="3 3" label={{ position: 'right', value: '75% REQ', fill: '#EE5D50', fontSize: 10, fontWeight: 800 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Remediation Table */}
            <div className="card" style={{ padding: 0, border: 'none', background: '#fff', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                 <div style={{ padding: '24px 32px', borderBottom: '1px solid #F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#2B3674' }}>Critical Retention Watchlist</h3>
                    <div style={{ padding: '6px 12px', background: '#FFF0ED', color: '#EE5D50', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>REQUIRES ACTION</div>
                 </div>
                 {defaulters.length > 0 ? (
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#F4F7FE' }}>
                        <tr>
                            <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#A3AED0' }}>IDENTIFIER</th>
                            <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#A3AED0' }}>DEPARTMENT / MODULE</th>
                            <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#A3AED0' }}>LEDGER STATUS</th>
                            <th style={{ padding: '16px 32px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#A3AED0' }}>REQUISITION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {defaulters.slice(0, 10).map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #F4F7FE' }}>
                                <td style={{ padding: '20px 32px' }}>
                                    <div style={{ fontWeight: 800, color: '#2B3674', fontSize: 14 }}>{d.name}</div>
                                    <div style={{ fontSize: 11, color: '#A3AED0', fontWeight: 600 }}>{d.rollNo}</div>
                                </td>
                                <td style={{ padding: '20px 32px' }}>
                                    <div style={{ fontWeight: 700, color: '#2B3674', fontSize: 13 }}>{d.dept || d.department}</div>
                                    <div style={{ fontSize: 12, color: '#707EAE' }}>{d.subject}</div>
                                </td>
                                <td style={{ padding: '20px 32px' }}>
                                    <span style={{ fontSize: 16, fontWeight: 900, color: d.percentage >= 70 ? '#FFB547' : '#EE5D50' }}>{d.percentage.toFixed(1)}%</span>
                                </td>
                                <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', background: '#FFF0ED', color: '#EE5D50', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>+{d.classesNeeded} CLASSES</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                 ) : (
                    <div style={{ padding: 60, textAlign: 'center' }}>
                        <AlertCircle size={40} color="#A3AED0" style={{ marginBottom: 16 }} />
                        <div style={{ color: '#2B3674', fontWeight: 800, fontSize: 16 }}>No Active Defaulters Detected</div>
                        <p style={{ color: '#A3AED0', fontSize: 14, marginTop: 4 }}>Institutional compliance is currently at 100%.</p>
                    </div>
                 )}
            </div>
        </DashboardLayout>
    );
}
