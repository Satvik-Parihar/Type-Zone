import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function TournamentPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    try {
      setLoading(true);
      const [{ data: upcomingData }, { data: myData }] = await Promise.all([
        api.get('/tournaments'),
        api.get('/tournaments/mine')
      ]);
      setTournaments(upcomingData.tournaments || []);
      setMyTournaments(myData.tournaments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  }

  async function joinTournament(tournamentId) {
    try {
      await api.post('/tournaments/join', { tournamentId });
      await loadTournaments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join tournament');
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusBadge(tournament) {
    const now = new Date();
    const start = new Date(tournament.startsAt);
    const end = new Date(tournament.endsAt);

    if (tournament.status === 'completed') {
      return <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Completed</span>;
    }
    if (now >= start && now < end) {
      return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Live</span>;
    }
    return <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Upcoming</span>;
  }

  function getStandingsForTournament(tournament) {
    const participants = tournament.participants || [];
    return participants
      .map((p) => ({
        ...p,
        score: Math.round((p.wpm || 0) * 0.8 + (p.accuracy || 0) * 0.2)
      }))
      .sort((a, b) => b.score - a.score);
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading tournaments...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Tournaments</h1>

        {error && <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">{error}</div>}

        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 ${
              activeTab === 'upcoming'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Upcoming ({tournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 ${
              activeTab === 'mine'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            My Tournaments ({myTournaments.length})
          </button>
        </div>

        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tournaments.length === 0 ? (
              <p className="text-gray-400">No tournaments available</p>
            ) : (
              tournaments.map((tournament) => {
                const isJoined = myTournaments.some((t) => String(t._id) === String(tournament._id));
                return (
                  <div
                    key={tournament._id}
                    className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 cursor-pointer transition"
                    onClick={() => setSelectedTournament(tournament)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-cyan-400">{tournament.title}</h3>
                      {getStatusBadge(tournament)}
                    </div>
                    <div className="space-y-2 text-sm text-gray-300 mb-4">
                      <p>Mode: <span className="text-white capitalize">{tournament.mode}</span></p>
                      <p>Difficulty: <span className="text-white capitalize">{tournament.difficulty}</span></p>
                      <p>Starts: <span className="text-white">{formatDate(tournament.startsAt)}</span></p>
                      <p>Ends: <span className="text-white">{formatDate(tournament.endsAt)}</span></p>
                      <p>Prize XP: <span className="text-yellow-400 font-bold">{tournament.rewardXp}</span></p>
                      <p>Participants: <span className="text-white">{tournament.participants?.length || 0}</span></p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isJoined) {
                          joinTournament(tournament._id);
                        }
                      }}
                      disabled={isJoined}
                      className={`w-full py-2 rounded font-semibold transition ${
                        isJoined
                          ? 'bg-gray-700 text-gray-400 cursor-default'
                          : 'bg-cyan-600 text-white hover:bg-cyan-500'
                      }`}
                    >
                      {isJoined ? 'Joined' : 'Join Tournament'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'mine' && (
          <div className="space-y-6">
            {myTournaments.length === 0 ? (
              <p className="text-gray-400">You haven't joined any tournaments yet</p>
            ) : (
              myTournaments.map((tournament) => {
                const standings = getStandingsForTournament(tournament);
                const userIndex = standings.findIndex((p) => String(p.userId) === String(user?._id));
                const userParticipant = userIndex >= 0 ? { ...standings[userIndex], rank: userIndex + 1 } : null;
                return (
                  <div
                    key={tournament._id}
                    className="bg-gray-900 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition"
                    onClick={() => setSelectedTournament(tournament)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-cyan-400">{tournament.title}</h3>
                      {getStatusBadge(tournament)}
                    </div>

                    {userParticipant && (
                      <div className="mb-4 p-3 bg-blue-900 rounded">
                        <p className="text-sm text-blue-200">
                          Your Position: <span className="text-white font-bold">#{userParticipant.rank || '-'}</span>
                          {userParticipant.xpAwarded && (
                            <span className="ml-4 text-yellow-400">
                              XP Earned: {userParticipant.xpAwarded}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-blue-200">
                          WPM: {userParticipant.wpm || 0} | Accuracy: {userParticipant.accuracy || 0}%
                        </p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-300 mb-3">Top 5 Standings:</h4>
                      <div className="space-y-2">
                        {standings.slice(0, 5).map((participant, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm p-2 bg-gray-800 rounded"
                          >
                            <span className="font-semibold">
                              #{index + 1} {participant.username}
                              {String(participant.userId) === String(user?._id) && (
                                <span className="ml-2 text-cyan-400 text-xs">(You)</span>
                              )}
                            </span>
                            <span className="text-gray-400">
                              {participant.wpm || 0} WPM · {participant.accuracy || 0}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs text-gray-400">
                      <span>{formatDate(tournament.startsAt)}</span>
                      <span>→</span>
                      <span>{formatDate(tournament.endsAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {selectedTournament && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTournament(null)}
          >
            <div
              className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">{selectedTournament.title}</h2>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white font-semibold capitalize">{selectedTournament.status}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Participants</p>
                  <p className="text-white font-semibold">{selectedTournament.participants?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Prize Pool</p>
                  <p className="text-yellow-400 font-semibold">{selectedTournament.rewardXp} XP</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mode / Difficulty</p>
                  <p className="text-white font-semibold capitalize">
                    {selectedTournament.mode} / {selectedTournament.difficulty}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3 text-gray-200">Full Standings:</h3>
              <div className="space-y-2 mb-6">
                {getStandingsForTournament(selectedTournament).map((participant, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-800 rounded text-sm">
                    <span className="font-semibold">#{index + 1} {participant.username}</span>
                    <span className="text-gray-400">
                      {participant.wpm || 0} WPM · {participant.accuracy || 0}%
                      {participant.xpAwarded && (
                        <span className="ml-2 text-yellow-400">+{participant.xpAwarded} XP</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedTournament(null)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
