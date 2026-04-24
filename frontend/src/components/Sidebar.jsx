import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, QrCode, Calendar, Bell, Settings,
    BookOpen, PlayCircle, Radio, ClipboardList, AlertTriangle,
    BarChart2, Users, GraduationCap, Building, Shield, ScrollText,
    ChevronLeft, ChevronRight, LogOut, UserCheck
} from 'lucide-react';

const STUDENT_NAV = [
    { to: '/student', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/student/attendance', label: 'My Attendance', icon: Calendar },
    { to: '/student/scan', label: 'Scan QR', icon: QrCode },
    { to: '/settings', label: 'Settings', icon: Settings },
];

const TEACHER_NAV = [
    { to: '/teacher', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/teacher/start-session', label: 'Start Session', icon: PlayCircle },
    { to: '/teacher/live-session', label: 'Live Session', icon: Radio },
    { to: '/teacher/records', label: 'Records', icon: ClipboardList },
    { to: '/teacher/defaulters', label: 'Defaulters', icon: AlertTriangle },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
];

const ADMIN_NAV = [
    { to: '/admin', label: 'DASHBOARD', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'STUDENTS', icon: Users },
    { to: '/admin/attendance', label: 'ATTENDANCE', icon: Calendar },
    { to: '/admin/courses', label: 'COURSES', icon: BookOpen },
    { to: '/analytics', label: 'REPORTS', icon: BarChart2 },
];

function navForRole(role) {
    if (role === 'STUDENT') return STUDENT_NAV;
    if (role === 'TEACHER') return TEACHER_NAV;
    if (role === 'ADMIN') return ADMIN_NAV;
    return [];
}

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const navItems = navForRole(user?.role);
    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={{ background: 'var(--sidebar)', color: 'rgba(255,255,255,0.7)' }}>
            {/* Logo Section */}
            <div className="sidebar-logo" style={{ height: 100, borderBottom: 'none', padding: '0 24px', alignItems: 'flex-start', paddingTop: 24, gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <GraduationCap size={22} color="#fff" />
                </div>
                {!collapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.2 }}>ACADEMIC<br />LEDGER</span>
                        <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: '0.04em' }}>ADMINISTRATIVE<br />PORTAL</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '12px 0' }}>
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            margin: '4px 16px',
                            height: 48,
                            padding: '0 16px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.03em'
                        })}
                    >
                        <Icon size={18} />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}

                {/* New Record Button as seen in image */}
                {!collapsed && (
                    <div style={{ padding: '24px 16px' }}>
                        <button 
                            className="btn-primary" 
                            style={{ 
                                width: '100%', 
                                background: 'rgba(93,120,255,0.8)', 
                                border: 'none', 
                                height: 44, 
                                fontSize: 12, 
                                fontWeight: 600, 
                                letterSpacing: '0.05em',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        >
                            NEW RECORD
                        </button>
                    </div>
                )}
            </nav>

            {/* Bottom Section */}
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <NavLink to="/settings" className="nav-item" style={{ color: 'rgba(255,255,255,0.5)', height: 40, margin: '2px 16px', padding: '0 12px', fontSize: 12 }}>
                    <Settings size={18} />
                    {!collapsed && <span>SETTINGS</span>}
                </NavLink>
                <div onClick={handleLogout} className="nav-item" style={{ color: 'rgba(255,255,255,0.5)', height: 40, margin: '2px 16px', padding: '0 12px', fontSize: 12, cursor: 'pointer' }}>
                    <LogOut size={18} />
                    {!collapsed && <span>SIGN OUT</span>}
                </div>
            </div>

            {/* Collapse toggle */}
            {!collapsed && (
                <button
                    className="collapse-btn"
                    onClick={onToggle}
                    style={{
                        position: 'absolute', top: 32, right: -14,
                        background: '#fff', border: '1px solid var(--border)',
                        borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--sidebar)', zIndex: 101,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    <ChevronLeft size={14} />
                </button>
            )}
        </aside>
    );
}
