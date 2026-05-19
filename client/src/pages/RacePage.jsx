import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { generatePrompt } from '../utils/typingData';
import { useSocket } from '../hooks/useSocket';
import { raceEvents, playerEvents } from '../services/socketService';


const PlayerTrack = ({ player, raceText, isCurrentUser }) => {
  const progress = typeof player.progress === 'number'
    ? Math.max(0, Math.min(player.progress, 100))
    : Math.min(((player.charactersTyped || 0) / raceText.length) * 100, 100);
  const displayName = player.username || player.name || 'Player';

  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      isCurrentUser ? 'border-accent bg-accent/5' : 'border-border'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold text-text">{displayName}</p>
        <p className="text-accent font-bold">{Math.round(player.wpm)} WPM</p>
      </div>
      <div className="relative h-3 rounded-full bg-surface overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
      <p className="text-xs text-text-secondary mt-2">{Math.floor(progress)}% complete</p>
    </div>
  );
};

export default function RacePage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [raceResults, setRaceResults] = useState(null);
  const [raceText, setRaceText] = useState(() => generatePrompt('quote', 0, 'english'));
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(3);

  const {
    input,
    currentIndex,
    isActive,
    isFinished,
    metrics,
    startTest,
    handleInput,
    inputRef
  } = useTypingEngine(raceText, 'time', 60);

  // Socket event handlers for real-time race updates
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit(raceEvents.JOIN_RACE, { roomId });

    const handleRaceStarted = (data) => {
      setRaceText(data.text || generatePrompt('quote', 0, 'english'));
      setRaceStarted(true);
      setRaceFinished(false);
      setRaceResults(null);
      setCountdown(3);
      setPlayers(Array.isArray(data.players) ? data.players : []);
    };

    const handleRaceCountdown = (count) => {
      setCountdown(count);
    };

    const handleRaceUpdate = (raceData) => {
      // Update player list with real-time progress
      if (raceData.players) {
        setPlayers(raceData.players);
      }
    };

    const handleRaceFinished = (result) => {
      setRaceFinished(true);
      setRaceResults(result);
      // Update final rankings
      if (result.players) {
        setPlayers(result.players);
      }
    };

    socket.on(raceEvents.RACE_STARTED, handleRaceStarted);
    socket.on(raceEvents.RACE_COUNTDOWN, handleRaceCountdown);
    socket.on(raceEvents.RACE_UPDATE, handleRaceUpdate);
    socket.on(raceEvents.RACE_FINISHED, handleRaceFinished);

    return () => {
      socket.off(raceEvents.RACE_STARTED, handleRaceStarted);
      socket.off(raceEvents.RACE_COUNTDOWN, handleRaceCountdown);
      socket.off(raceEvents.RACE_UPDATE, handleRaceUpdate);
      socket.off(raceEvents.RACE_FINISHED, handleRaceFinished);
    };
  }, [socket, roomId]);

  useEffect(() => {
    if (!raceStarted) return;

    if (socket && roomId) {
      socket.emit(playerEvents.UPDATE_PROGRESS, {
        roomId,
        progress: (currentIndex / raceText.length) * 100,
        wpm: metrics.wpm || 0,
        accuracy: metrics.accuracy || 100
      });
    }
  }, [raceStarted, currentIndex, metrics, socket, roomId, raceText]);

  // Race countdown
  useEffect(() => {
    if (!raceStarted) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      startTest();
    }
  }, [countdown, raceStarted, startTest]);

  useEffect(() => {
    if (isFinished && raceStarted && socket && roomId) {
      socket.emit(raceEvents.RACE_PROGRESS, {
        roomId,
        progress: 100,
        wpm: metrics?.wpm || 0,
        accuracy: metrics?.accuracy || 100,
        finished: true,
      });
    }
  }, [isFinished, raceStarted, socket, roomId, metrics]);

  const handleRaceStart = () => {
    setRaceStarted(true);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-text mb-2">Live Race</h1>
            <p className="text-text-secondary">Type fast to win!</p>
          </div>
          <button
            onClick={() => navigate('/multiplayer')}
            className="btn-ghost"
          >
            <Home className="w-4 h-4 mr-2" />
            Lobby
          </button>
        </div>

        {/* Race Tracks */}
        <div className="mb-12 space-y-4">
          {players.length === 0 ? (
            <div className="card p-8 text-center text-text-secondary">
              Waiting for race to start...
            </div>
          ) : (
            players.map((player, idx) => (
              <PlayerTrack
                key={player.id}
                player={player}
                raceText={raceText}
                isCurrentUser={idx === 0}
              />
            ))
          )}
        </div>

        {/* Countdown */}
        {raceStarted && countdown > 0 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center z-40"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: 3 }}
              className="text-9xl font-bold text-accent"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}

        {/* Typing Area */}
        <div className="mb-12">
          {!raceStarted && !raceFinished && (
            <button
              onClick={handleRaceStart}
              className="btn-primary w-full py-4 text-lg mb-6"
            >
              Start Race
            </button>
          )}

          <div className="card p-8 rounded-2xl">
            <div className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-border min-h-[150px] overflow-hidden">
              <div className="font-mono text-xl leading-relaxed text-text-secondary">
                {raceText.split('').map((char, idx) => {
                  let className = '';
                  if (idx < input.length) {
                    className = input[idx] === char ? 'text-text bg-green-500/20' : 'text-error bg-error/20';
                  } else if (idx === currentIndex && isActive) {
                    className = 'text-accent';
                  }
                  return (
                    <span key={idx} className={className}>
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              className="absolute inset-0 opacity-0"
              autoComplete="off"
              spellCheck="false"
              disabled={!raceStarted || countdown > 0 || raceFinished}
            />
          </div>
        </div>

        {raceFinished && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center">
              <h2 className="text-3xl font-bold text-text mb-6">Race Complete</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="card p-4">
                  <p className="text-xs text-text-secondary uppercase mb-1">Your WPM</p>
                  <p className="text-3xl font-bold text-accent">
                    {Math.round(metrics?.wpm || 0)}
                  </p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-text-secondary uppercase mb-1">Accuracy</p>
                  <p className="text-3xl font-bold text-correct">
                    {Math.round(metrics?.accuracy || 100)}%
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-sm text-text-secondary uppercase mb-3">Final Standings</h3>
                {(() => {
                  const finalPlayers = [...(raceResults?.players || players)];
                  return finalPlayers
                    .sort((a, b) => (b.wpm || 0) - (a.wpm || 0))
                    .map((p, i) => (
                      <div
                        key={p.id || i}
                        className="flex justify-between items-center py-2 border-b border-border last:border-0"
                      >
                        <span className="flex items-center gap-2 text-text">
                          {i === 0 && <span>👑</span>}
                          {i === 1 && <span>🥈</span>}
                          {i === 2 && <span>🥉</span>}
                          {p.username || p.name}
                        </span>
                        <span className="text-accent font-bold">
                          {Math.round(p.wpm || 0)} WPM
                        </span>
                      </div>
                    ));
                })()}
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/multiplayer')} className="btn-ghost">
                  Back to Lobby
                </button>
                <Link to="/profile" className="btn-primary">View Profile</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
