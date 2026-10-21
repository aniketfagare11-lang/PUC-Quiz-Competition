import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Quiz from './pages/Quiz';
import Done from './pages/Done';
import Briefing from './pages/Briefing';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { TeamRoute } from './components/ProtectedRoute';
import { useAdmin } from './context/AdminContext';

function AdminEntry() {
  const { admin } = useAdmin();
  const hasToken = Boolean(localStorage.getItem('qc_admin_token'));
  return admin && hasToken ? <AdminDashboard /> : <AdminLogin />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/team" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/round1" element={<Navigate to="/register" replace />} />
      <Route path="/round2" element={<Navigate to="/register" replace />} />
      <Route path="/quiz" element={<TeamRoute><Quiz /></TeamRoute>} />
      <Route path="/round1/quiz" element={<Navigate to="/quiz" replace />} />
      <Route path="/round2/quiz" element={<Navigate to="/quiz" replace />} />
      <Route path="/briefing" element={<TeamRoute><Briefing /></TeamRoute>} />
      <Route path="/done" element={<TeamRoute><Done /></TeamRoute>} />
      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminEntry />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
