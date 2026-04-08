import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TypingPage from './pages/TypingPage';
import MultiplayerPage from './pages/MultiplayerPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PracticePage from './pages/PracticePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/typing" element={<Layout><TypingPage /></Layout>} />
      <Route path="/multiplayer" element={<Layout><MultiplayerPage /></Layout>} />
      <Route path="/leaderboard" element={<Layout><LeaderboardPage /></Layout>} />
      <Route path="/practice" element={<Layout><PracticePage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
