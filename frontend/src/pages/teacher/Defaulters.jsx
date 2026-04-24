import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Bell, Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Defaulters() {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [threshold, setThreshold] = useState(75);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        api.get(`/reports/defaulters?threshold=${threshold}`).catch(() => null).then(res => {
            if (res?.data) setData(res.data);
        });
    }, [threshold]);

    const exportLedger = async () => {
        setIsExporting(true);
        try {
            const dept = user?.department || 'CS';
            const response = await api.get(`/reports/exam-eligibility?departmentId=${dept}&subjectCode=ALL`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Defaulter_Ledger_${dept}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed', err);
            alert('Export service currently unavailable. Please check backend connection.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DashboardLayout title="Compliance Oversight" subtitle="Faculty / Attendance Monitoring">
            {/* Header Intelligence */}
            <div 
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr auto', 
                    alignItems: 'end',
                    gap: 24, 
                    marginBottom: 32,
                    background: '#fff',
                    padding: 32,
                    borderRadius: 20,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                         <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EE5D50', boxShadow: '0 0 10px rgba(238,93,80,0.4)' }} />
                         <span style={{ fontSize: 13, fontWeight: 700, color: '#EE5D50', letterSpacing: '0.1em' }}>REMEDIATION LIST</span>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#2B3674', marginBottom: 4 }}>Attendance Defaulters</h2>
                    <p style={{ color: '#A3AED0', fontSize: 14 }}>Displaying <span style={{ color: '#2B3674', fontWeight: 700 }}>{data.length}</span> students currently below institutional compliance thresholds.</p>
                </div>

                <div className="flex items-center gap-16" style={{ background: '#F4F7FE', padding: '12px 20px', borderRadius: 16 }}>
                    <div className="flex items-center gap-12" style={{ borderRight: '1px solid #E9EDF7', paddingRight: 16, marginRight: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#707EAE' }}>THRESHOLD:</label>
                        <select 
                            style={{ background: '#fff', border: 'none', borderRadius: 8, padding: '4px 8px', fontWeight: 700, color: '#2B3674' }} 
                            value={threshold} 
                            onChange={e => setThreshold(Number(e.target.value))}
                        >
                            {[60, 65, 70, 75, 80].map(v => <option key={v} value={v}>{v}%</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={exportLedger}
                        disabled={isExporting}
                        style={{ background: '#111C44', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <Download size={14} /> {isExporting ? 'EXPORTING...' : 'EXPORT LEDGER'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, border: 'none', background: '#fff', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.03)', overflow: 'hidden', minHeight: 400 }}>
                {data.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#F4F7FE' }}>
                        <tr>
                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#707EAE', borderBottom: '1px solid #E9EDF7' }}>RANK</th>
                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#707EAE', borderBottom: '1px solid #E9EDF7' }}>NAME & IDENTIFIER</th>
                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#707EAE', borderBottom: '1px solid #E9EDF7' }}>MODULE</th>
                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#707EAE', borderBottom: '1px solid #E9EDF7' }}>STATS</th>
                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#707EAE', borderBottom: '1px solid #E9EDF7' }}>REQUISITION</th>
                            <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#707EAE', borderBottom: '1px solid #E9EDF7' }}>INTERVENTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((d, i) => (
                            <tr key={`${d.studentId}-${d.subject}`} style={{ borderBottom: '1px solid #F4F7FE' }}>
                                <td style={{ padding: '20px 24px', fontSize: 14, fontWeight: 700, color: '#2B3674', opacity: 0.5 }}>#{i + 1}</td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontWeight: 800, color: '#2B3674', fontSize: 15 }}>{d.name}</div>
                                    <div style={{ fontSize: 12, color: '#A3AED0', fontWeight: 600 }}>{d.rollNo}</div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontWeight: 700, color: '#2B3674', fontSize: 13 }}>{d.subject}</div>
                                    <div style={{ fontSize: 11, color: '#707EAE', textTransform: 'uppercase' }}>{d.department}</div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ fontWeight: 900, fontSize: 18, color: d.percentage >= threshold ? '#05CD99' : d.percentage >= threshold - 10 ? '#FFB547' : '#EE5D50' }}>{d.percentage.toFixed(1)}%</div>
                                        <div style={{ width: 1, height: 24, background: '#E9EDF7' }} />
                                        <div style={{ fontSize: 12, color: '#707EAE', fontWeight: 600 }}>{d.present}/{d.total}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ display: 'inline-flex', background: '#FFF0ED', color: '#EE5D50', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                                        NEED {d.classesNeeded} CLASSES
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => alert(`Warning notification queued for ${d.name}`)}
                                        style={{ background: '#F4F7FE', color: '#422AFB', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                    >
                                        <Bell size={14} /> SEND WARNING
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 16 }}>
                        <div style={{ width: 64, height: 64, background: '#F4F7FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={32} color="#422AFB" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2B3674' }}>Institutional Compliance 100%</h3>
                            <p style={{ color: '#A3AED0', fontSize: 14, marginTop: 4 }}>No students found below the {threshold}% threshold for your modules.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
