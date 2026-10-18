import { createContext, useContext, useState, useCallback } from 'react';

const TeamContext = createContext(null);

const TEAM_KEY = 'qc_team';
const TOKEN_KEY = 'qc_team_token';
const clearAttemptIds = () => {
  Object.keys(localStorage)
    .filter((key) => key === 'qc_attempt_id' || key.startsWith('qc_attempt_id_round_'))
    .forEach((key) => localStorage.removeItem(key));
};

function readTeam() {
  try {
    return JSON.parse(localStorage.getItem(TEAM_KEY) || 'null');
  } catch {
    return null;
  }
}

export function TeamProvider({ children }) {
  const [team, setTeam] = useState(readTeam);

  const loginTeam = useCallback((teamObj, token) => {
    // An attempt ID is browser-wide, while a token belongs to one team. Never
    // carry an ID from a previous authentication into this new team session.
    // The quiz will safely create or resume this team's server-side attempt.
    clearAttemptIds();
    localStorage.setItem(TEAM_KEY, JSON.stringify(teamObj));
    localStorage.setItem(TOKEN_KEY, token);
    setTeam(teamObj);
  }, []);

  const logoutTeam = useCallback(() => {
    localStorage.removeItem(TEAM_KEY);
    localStorage.removeItem(TOKEN_KEY);
    clearAttemptIds();
    setTeam(null);
  }, []);

  return (
    <TeamContext.Provider value={{ team, loginTeam, logoutTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export const useTeam = () => useContext(TeamContext);
