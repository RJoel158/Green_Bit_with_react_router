import axios from 'axios';

export async function getActiveOrLastPeriod() {
  // Obtiene el periodo activo o el último cerrado
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ranking/periods/active-or-last`);
  return res.data;
}

export async function getLiveRanking(periodId: number, role: string) {
  // Obtiene el ranking en vivo desde users.score
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ranking/live/${periodId}?role=${role}`);
  return res.data;
}

export async function getHistoricalRanking(periodId: number, role: string) {
  // Obtiene el ranking histórico desde ranking_tops
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ranking/tops/${periodId}?role=${role}`);
  return res.data;
}
