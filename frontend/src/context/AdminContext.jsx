import { createContext, useContext, useState, useCallback } from 'react';

const AdminContext = createContext(null);

const ADMIN_KEY = 'qc_admin';
const TOKEN_KEY = 'qc_admin_token';

function readAdmin() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(readAdmin);

  const loginAdmin = useCallback((adminObj, token) => {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminObj));
    localStorage.setItem(TOKEN_KEY, token);
    setAdmin(adminObj);
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }, []);

  return (
    <AdminContext.Provider value={{ admin, loginAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
