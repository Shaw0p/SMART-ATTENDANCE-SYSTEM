import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function DashboardLayout({ children, title, subtitle }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
            <TopNavbar collapsed={collapsed} title={title} />
            <main className={`main-content ${collapsed ? 'collapsed' : ''}`} style={{ padding: '40px 32px' }}>
                {children}
            </main>
        </div>
    );
}
