import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { Search } from 'lucide-react';

const DEMO = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: ['Dr. Priya Nair', 'Prof. Rajesh Kumar', 'Dr. Anil Sharma', 'Prof. Sunita Rao', 'Dr. Vikram Joshi', 'Prof. Meena Pillai', 'Dr. Suresh Iyer', 'Prof. Kavitha Reddy', 'Dr. Arjun Menon', 'Prof. Sita Patel'][i],
    employeeId: `EMP${2000 + i}`, department: ['Computer Science', 'Information Technology', 'Electronics'][i % 3],
    designation: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'][i % 4],
    subject: ['Computer Networks', 'Data Structures', 'DBMS', 'Operating Systems', 'Software Engineering'][i % 5],
}));

export default function FacultyTable() {
    const [faculty, setFaculty] = useState([]);
    const [q, setQ] = useState('');

    useEffect(() => {
        api.get(`/admin/faculty?q=${q}`).catch(() => null).then(res => {
            setFaculty(res?.data?.content || res?.data || DEMO.filter(f => f.name.toLowerCase().includes(q.toLowerCase())));
        });
    }, [q]);

    return (
        <DashboardLayout title="Faculty Directory">
            <div className="section-header" style={{ marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2B3674' }}>Academic Staff Register</h2>
                    <p style={{ color: '#A3AED0', fontSize: 13, marginTop: 4 }}>{faculty.length} active faculty members in the department</p>
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
                        placeholder="Search faculty by name..." 
                        value={q} 
                        onChange={e => setQ(e.target.value)} 
                    />
                </div>
            </div>

            <div className="card" style={{ background: '#fff', border: 'none', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <table className="data-table">
                    <thead style={{ background: '#F4F7FE' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>STAFF MEMBER</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>ID</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>DEPARTMENT</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0' }}>DESIGNATION</th>
                            <th style={{ padding: '16px 24px', fontSize: 10, color: '#A3AED0', textAlign: 'right' }}>SPECIALIZATION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculty.map((f, i) => (
                            <tr key={f.id}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div className="flex items-center gap-16">
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#5D78FF' }}>
                                            {f.name?.charAt(0)}
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2B3674' }}>{f.name}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px', fontSize: 13, fontWeight: 600, color: '#707EAE' }}>{f.employeeId}</td>
                                <td style={{ padding: '20px 24px', fontSize: 13, color: '#707EAE' }}>{f.department}</td>
                                <td style={{ padding: '20px 24px' }}>
                                    <span style={{ 
                                        padding: '4px 12px', fontSize: 10, fontWeight: 700, borderRadius: 6,
                                        background: '#F4F7FE', color: '#5D78FF'
                                    }}>
                                        {f.designation.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: 13, color: '#707EAE', fontWeight: 500 }}>{f.subject}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
