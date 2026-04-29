import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TypingPage from './pages/TypingPage';
import PracticePage from './pages/PracticePage';
import LobbyPage from './pages/LobbyPage';
import RoomPage from './pages/RoomPage';
import RacePage from './pages/RacePage';
import NotFoundPage from './pages/NotFoundPage';

const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center text-text-secondary">Loading...</div>
);

export default function App() {
  return (
    <Routes>
      {/* Main routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/type" element={<Layout><TypingPage /></Layout>} />
      <Route path="/practice" element={<Layout><PracticePage /></Layout>} />
      <Route
        path="/leaderboard"
        element={
          <Layout>
            <Suspense fallback={<PageFallback />}>
              <LeaderboardPage />
            </Suspense>
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout>
            <Suspense fallback={<PageFallback />}>
              <ProfilePage />
            </Suspense>
          </Layout>
        }
      />
      
      {/* Auth routes */}
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      
      {/* Multiplayer routes */}
      <Route path="/multiplayer" element={<Layout><LobbyPage /></Layout>} />
      <Route path="/multiplayer/room/:roomId" element={<Layout><RoomPage /></Layout>} />
      <Route path="/multiplayer/race/:roomId" element={<Layout><RacePage /></Layout>} />
      
      {/* Legacy routes - redirect to new paths */}
      <Route path="/typing" element={<Navigate to="/type" replace />} />
      
      {/* Catch-all 404 */}
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  );
}
