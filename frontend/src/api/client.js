const BASE = `${import.meta.env.VITE_API_URL}/api`;
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
    // Clear stale session tokens on auth failures
    if (res.status === 401 && tokenType) localStorage.removeItem(TOKEN_KEYS[tokenType]);
    throw err;
  }
  return data;
}

export const api = {
  // teams (public)
  availability: () => request('GET', '/teams/availability', { tokenType: 'public' }),
  register: (payload) => request('POST', '/teams/register', { body: payload, tokenType: 'public' }),
  login: (payload) => request('POST', '/teams/login', { body: payload, tokenType: 'public' }),
  startSession: (payload) => request('POST', '/teams/session', { body: payload, tokenType: 'public' }),
  teamMe: () => request('GET', '/teams/me', { tokenType: 'team' }),

  // attempts (team)
  startAttempt: (payload) => request('POST', '/attempts/start', { body: payload, tokenType: 'team' }),
  getAttempt: (id) => request('GET', `/attempts/${id}`, { tokenType: 'team' }),
  saveAnswer: (id, payload) => request('PUT', `/attempts/${id}/answer`, { body: payload, tokenType: 'team' }),
  submitAttempt: (id, payload) => request('POST', `/attempts/${id}/submit`, { body: payload, tokenType: 'team' }),

  // admin
  adminLogin: (payload) => request('POST', '/auth/admin/login', { body: payload, tokenType: 'public' }),
  adminOverview: () => request('GET', '/admin/overview', { tokenType: 'admin' }),
  adminTeams: () => request('GET', '/admin/teams', { tokenType: 'admin' }),
  adminRankings: (round = 1) => request('GET', `/admin/rankings?round=${round}`, { tokenType: 'admin' }),
  adminCombinedResults: () => request('GET', '/admin/results/combined', { tokenType: 'admin' }),
  adminForceSubmit: (id) => request('POST', `/admin/attempts/${id}/force-submit`, { tokenType: 'admin' }),
  adminResetAttempt: (teamNumber, round = 1) => request('DELETE', `/admin/teams/${teamNumber}/reset?round=${round}`, { tokenType: 'admin' }),
  adminQuestions: (round = 1) =>
  request('GET', `/admin/questions?round=${round}`, { tokenType: 'admin' }),

adminCreateQuestion: (payload) =>
  request('POST', '/admin/questions', {
    body: payload,
    tokenType: 'admin',
  }),

adminUpdateQuestion: (id, payload) =>
  request('PUT', `/admin/questions/${id}`, {
    body: payload,
    tokenType: 'admin',
  }),

adminDeleteQuestion: (id) =>
  request('DELETE', `/admin/questions/${id}`, {
    tokenType: 'admin',
  }),
};
