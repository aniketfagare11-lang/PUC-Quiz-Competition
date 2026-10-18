import { Navigate } from 'react-router-dom';
import { useTeam } from '../context/TeamContext';
import { useAdmin } from '../context/AdminContext';

export function TeamRoute({ children }) {
  const { team } = useTeam();
  if (!team) return <Navigate to="/team" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { admin } = useAdmin();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
