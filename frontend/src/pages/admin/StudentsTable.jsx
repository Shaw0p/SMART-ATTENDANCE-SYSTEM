import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';
import { Search } from 'lucide-react';

const DEMO = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1, name: ['Rahul Mehta', 'Priya Singh', 'Amit Kumar', 'Sneha Rao', 'Rohan Joshi', 'Anjali Sharma', 'Vikram Nair', 'Divya Patel', 'Suresh Reddy', 'Kavita Gupta', 'Mahesh Iyer', 'Sana Sheikh', 'Arjun Verma', 'Tanya Malhotra', 'Rohit Kapoor'][i],
    rollNo: `CS21${String(i + 1).padStart(3, '0')}`, department: ['Computer Science', 'Information Technology', 'Electronics'][i % 3],
    year: (i % 4) + 1, attendancePercent: [82, 67, 91, 55, 78, 66, 89, 73, 60, 84, 71, 95, 63, 77, 88][i],
}));

export default function StudentsTable() {
    const [students, setStudents] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/admin/students?q=${q}`).catch(() => null).then(res => {
            setStudents(res?.data?.content || res?.data || DEMO.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.rollNo.includes(q)));
            setLoading(false);
        });
    }, [q]);

    return (
        <DashboardLayout title="Student Database">
            <div className="section-header" style={{ marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2B3674' }}>Institutional Records</h2>
                    <p style={{ color: '#A3AED0', fontSize: 13, marginTop: 4 }}>{students.length} students currently enrolled in the register</p>
                </div>
                <div 
                    style={{ 
                        background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', 
                        padding: '8px 16px', gap: 12, border: '1px solid #E9EDF7', width: 340,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}
                >
                    <Search size={18} color="#A3AED0" />
                    <input 
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13, color: '#2B3674', fontWeight: 500 }}
                        placeholder="Search student by name or ID..." 
                        value={q} 
                        onChange={e => setQ(e.target.value)} 
                    />
                </div>
            </div>

            <div className="card" style={{ background: '#fff', border: 'none', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <table className="data-table">
                    <thead style={{ background: '#F4F7FE' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>FULL NAME / CREDENTIALS</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>ROLL NO</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>DEPARTMENT</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>YEAR</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'right' }}>COMPLIANCE STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s, i) => (
                            <tr key={s.id}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div className="flex items-center gap-16">
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#5D78FF' }}>
                                            {s.name?.charAt(0)}
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2B3674' }}>{s.name}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px', fontSize: 13, fontWeight: 600, color: '#707EAE' }}>{s.rollNo}</td>
                                <td style={{ padding: '20px 24px', fontSize: 13, color: '#707EAE' }}>{s.department}</td>
                                <td style={{ padding: '20px 24px', fontSize: 13, color: '#707EAE' }}>Level {s.year}</td>
                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                    <div className="flex items-center justify-end gap-12">
                                        <span style={{ fontSize: 13, fontWeight: 800, color: s.attendancePercent >= 75 ? '#05CD99' : s.attendancePercent >= 65 ? '#FFB547' : '#EE5D50' }}>
                                            {s.attendancePercent?.toFixed ? s.attendancePercent.toFixed(1) : s.attendancePercent}%
                                        </span>
                                        <span style={{ 
                                            padding: '4px 12px', fontSize: 10, fontWeight: 700, borderRadius: 6,
                                            background: s.attendancePercent >= 75 ? '#E6F9F4' : s.attendancePercent >= 65 ? '#FFF9EE' : '#FFF0ED',
                                            color: s.attendancePercent >= 75 ? '#05CD99' : s.attendancePercent >= 65 ? '#FFB547' : '#EE5D50'
                                        }}>
                                            {s.attendancePercent >= 75 ? 'ELIGIBLE' : 'WARNING'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
