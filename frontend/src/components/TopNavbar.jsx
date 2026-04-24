import { Bell, Search, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopNavbar({ collapsed, title }) {
    const { user } = useAuth();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';

    return (
        <header className={`top-navbar ${collapsed ? 'collapsed' : ''}`} style={{ background: '#fff', borderBottom: 'none', padding: '0 32px' }}>
            {/* Left: Section Title */}
            <div>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 18, color: '#2B3674', letterSpacing: '-0.01em' }}>{title || "Dashboard Overview"}</h1>
            </div>

            {/* Right: Search + Icons + User */}
            <div className="flex items-center gap-16">
                {/* Search Bar */}
                <div className="input-group" style={{ width: 300, background: '#F4F7FE', borderRadius: 12, border: 'none' }}>
                    <Search className="input-icon" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search archives..." 
                        className="input-field" 
                        style={{ border: 'none', background: 'transparent', height: 40, fontSize: 12, color: '#2B3674' }}
                    />
                </div>

                {/* Icons */}
                <div className="flex items-center gap-12" style={{ color: '#A3AED0' }}>
                    <Bell size={18} style={{ cursor: 'pointer' }} />
                    <HelpCircle size={18} style={{ cursor: 'pointer' }} />
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-8" style={{ paddingLeft: 8 }}>
                    <div className="avatar" style={{ width: 40, height: 40, background: '#EFF4FB', color: '#2B3674', fontSize: 14 }}>
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}
