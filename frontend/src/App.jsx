import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import RoundEntry from './pages/RoundEntry';
import Quiz from './pages/Quiz';
import Done from './pages/Done';
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
      <Route path="/team" element={<Navigate to="/round1" replace />} />
      <Route path="/round1" element={<RoundEntry round={1} />} />
      <Route path="/round2" element={<RoundEntry round={2} />} />
      <Route path="/round1/quiz" element={<TeamRoute><Quiz round={1} /></TeamRoute>} />
      <Route path="/round2/quiz" element={<TeamRoute><Quiz round={2} /></TeamRoute>} />
      <Route path="/quiz" element={<Navigate to="/round1/quiz" replace />} />
      <Route path="/done" element={<TeamRoute><Done /></TeamRoute>} />
      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminEntry />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
