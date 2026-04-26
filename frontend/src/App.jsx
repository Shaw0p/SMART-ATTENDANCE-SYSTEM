import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Auth pages
import StudentAuth from './pages/auth/StudentAuth';
import TeacherAuth from './pages/auth/TeacherAuth';
import AdminAuth from './pages/auth/AdminAuth';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import ScanQR from './pages/student/ScanQR';
import AttendanceView from './pages/student/AttendanceView';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StartSession from './pages/teacher/StartSession';
import LiveSession from './pages/teacher/LiveSession';
import Records from './pages/teacher/Records';
import Defaulters from './pages/teacher/Defaulters';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsTable from './pages/admin/StudentsTable';
import FacultyTable from './pages/admin/FacultyTable';

// Shared pages
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import NetworkTest from './pages/NetworkTest';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to={homeFor(user.role)} /> : <Landing />} />
      <Route path="/auth/student" element={<StudentAuth />} />
      <Route path="/auth/teacher" element={<TeacherAuth />} />
      <Route path="/auth/admin" element={<AdminAuth />} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/scan" element={<ProtectedRoute role="STUDENT"><ScanQR /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute role="STUDENT"><AttendanceView /></ProtectedRoute>} />

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/start-session" element={<ProtectedRoute role="TEACHER"><StartSession /></ProtectedRoute>} />
      <Route path="/teacher/live-session" element={<ProtectedRoute role="TEACHER"><LiveSession /></ProtectedRoute>} />
      <Route path="/teacher/records" element={<ProtectedRoute role="TEACHER"><Records /></ProtectedRoute>} />
      <Route path="/teacher/defaulters" element={<ProtectedRoute role="TEACHER"><Defaulters /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute role="ADMIN"><StudentsTable /></ProtectedRoute>} />
      <Route path="/admin/faculty" element={<ProtectedRoute role="ADMIN"><FacultyTable /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Diagnostics */}
      <Route path="/network-test" element={<NetworkTest />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function homeFor(role) {
  if (role === 'STUDENT') return '/student';
  if (role === 'TEACHER') return '/teacher';
  if (role === 'ADMIN') return '/admin';
  return '/';
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="593294445694-dis0dk8c396u4q48dmluigst2dai958c.apps.googleusercontent.com">
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
