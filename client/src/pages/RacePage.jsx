import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { RotateCcw, Home } from 'lucide-react';
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
    resetTest,
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
    if (isFinished) {
      setRaceFinished(true);
    }
  }, [isFinished]);

  const handleRaceStart = () => {
    setRaceStarted(true);
  };

  const handleRetry = () => {
    resetTest();
    setRaceStarted(false);
    setRaceFinished(false);
    setCountdown(3);
    setPlayers((prev) => prev.map((p) => ({ ...p, charactersTyped: 0, wpm: 0, accuracy: 100, finished: false, finishTime: 0 })));
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
            <div className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-border-dark min-h-[150px] overflow-hidden">
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

        {/* Results */}
        {raceFinished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            {/* Winner Banner */}
            <div className="card p-8 text-center mb-8 bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-4"
              >
                <div className="text-5xl font-bold text-accent">WIN</div>
              </motion.div>
              <h2 className="text-3xl font-bold text-text mb-2">Race Completed!</h2>
              <p className="text-text-secondary">
                {players[0]?.finished ? 'You won the race!' : 'Better luck next time!'}
              </p>
            </div>

            {/* Your Stats */}
            <div className="card p-8 mb-8">
              <h3 className="text-xl font-bold text-text mb-6">Your Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-text-secondary text-sm mb-2">WPM</p>
                  <p className="text-3xl font-bold text-accent">{Math.round(metrics.wpm || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-sm mb-2">Accuracy</p>
                  <p className="text-3xl font-bold text-text">{Math.round(metrics.accuracy || 100)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-sm mb-2">Errors</p>
                  <p className="text-3xl font-bold text-error">{metrics.errorCount || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-sm mb-2">Time</p>
                  <p className="text-3xl font-bold text-text">{Math.round(metrics.time || 0)}s</p>
                </div>
              </div>
            </div>

            {/* Rankings */}
            <div className="card p-8 mb-8">
              <h3 className="text-xl font-bold text-text mb-6">Final Rankings</h3>
              <div className="space-y-3">
                {players.map((player, idx) => {
                  const placement = idx + 1;
                  const displayName = player.username || player.name || 'Player';
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        idx === 0 ? 'border-accent bg-accent/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-text-secondary w-8">{placement}</span>
                        <div>
                          <p className="font-semibold text-text">{displayName}</p>
                          <p className="text-xs text-text-secondary">
                            {player.finished ? `Finished in ${player.finishTime}s` : 'Did not finish'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-text text-lg">{Math.round(player.wpm)} WPM</p>
                        <p className="text-xs text-text-secondary">{Math.round(player.accuracy)}% acc</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="btn-primary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Race Again
              </button>
              <button
                onClick={() => navigate('/multiplayer')}
                className="btn-secondary flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Lobby
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
