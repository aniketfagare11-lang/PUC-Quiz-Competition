const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api';
const TOKEN_KEYS = {
  team: 'qc_team_token',
  admin: 'qc_admin_token',
};

async function request(method, path, { body, tokenType = 'team' } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (tokenType && tokenType !== 'public') {
    const token = localStorage.getItem(TOKEN_KEYS[tokenType]);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('Network error — cannot reach the server.');
    err.status = 0;
    throw err;
  }

  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    if (res.status === 401 && tokenType) localStorage.removeItem(TOKEN_KEYS[tokenType]);
    throw err;
  }
  return data;
}

export const api = {
  availability: () => request('GET', '/teams/availability', { tokenType: 'public' }),
  register: (payload) => request('POST', '/teams/register', { body: payload, tokenType: 'public' }),
  login: (payload) => request('POST', '/teams/login', { body: payload, tokenType: 'public' }),
  startSession: (payload) => request('POST', '/teams/session', { body: payload, tokenType: 'public' }),
  teamMe: () => request('GET', '/teams/me', { tokenType: 'team' }),

  startAttempt: (payload) => request('POST', '/attempts/start', { body: payload, tokenType: 'team' }),
  quizInfo: () => request('GET', '/attempts/info', { tokenType: 'team' }),
  getAttempt: (id) => request('GET', `/attempts/${id}`, { tokenType: 'team' }),
  saveAnswer: (id, payload) => request('PUT', `/attempts/${id}/answer`, { body: payload, tokenType: 'team' }),
  submitAttempt: (id, payload) => request('POST', `/attempts/${id}/submit`, { body: payload, tokenType: 'team' }),

  adminLogin: (payload) => request('POST', '/auth/admin/login', { body: payload, tokenType: 'public' }),
  adminOverview: () => request('GET', '/admin/overview', { tokenType: 'admin' }),
  adminTeams: () => request('GET', '/admin/teams', { tokenType: 'admin' }),
  adminRankings: () => request('GET', '/admin/rankings', { tokenType: 'admin' }),
  adminForceSubmit: (id) => request('POST', `/admin/attempts/${id}/force-submit`, { tokenType: 'admin' }),
  adminResetAttempt: (teamNumber) => request('DELETE', `/admin/teams/${teamNumber}/reset`, { tokenType: 'admin' }),
  adminQuestions: (set = 'A') => request('GET', `/admin/questions?set=${set}`, { tokenType: 'admin' }),
  adminCreateQuestion: (payload) => request('POST', '/admin/questions', { body: payload, tokenType: 'admin' }),
  adminUpdateQuestion: (id, payload) => request('PUT', `/admin/questions/${id}`, { body: payload, tokenType: 'admin' }),
  adminDeleteQuestion: (id) => request('DELETE', `/admin/questions/${id}`, { tokenType: 'admin' }),
  adminActiveSet: () => request('GET', '/admin/active-set', { tokenType: 'admin' }),
  adminSetActiveSet: (activeSet) => request('PUT', '/admin/active-set', {
    body: { activeSet },
    tokenType: 'admin',
  }),
};
