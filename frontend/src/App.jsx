import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NeonBackground } from './components/NeonBackground';
import FinancePage from './pages/FinancePage';
import WorkoutsPage from './pages/WorkoutsPage';
import SteamPage from './pages/SteamPage';
import SteamAchievementsDetailPage from './pages/SteamAchievementsDetailPage';
import LoginPage from './pages/LoginPage';
import StartPage from './pages/StartPage';
import { useModules } from './hooks/useModules';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" replace />;
}

// Пускает на страницу, только если у пользователя есть соответствующий модуль
// (по данным GET /users/me/modules). Пока грузится список — ничего не рендерим.
function ModuleRoute({ module, children }) {
    const { modules, loading } = useModules();

    if (loading) return null;
    if (!modules.has(module)) return <Navigate to="/" replace />;

    return children;
}

function AppContent() {
    const location = useLocation();
    const neonVariant = location.pathname.startsWith('/workouts') ? 'red'
        : location.pathname.startsWith('/steam') ? 'purple'
        : location.pathname === '/' ? 'white'
        : 'green';

    return (
        <>
            <NeonBackground variant={neonVariant} />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={
                    <PrivateRoute><StartPage /></PrivateRoute>
                } />
                <Route path="/finance" element={
                    <PrivateRoute><ModuleRoute module="finances"><FinancePage /></ModuleRoute></PrivateRoute>
                } />
                <Route path="/workouts" element={
                    <PrivateRoute><ModuleRoute module="trainings"><WorkoutsPage /></ModuleRoute></PrivateRoute>
                } />
                <Route path="/steam" element={
                    <PrivateRoute><ModuleRoute module="achievements"><SteamPage /></ModuleRoute></PrivateRoute>
                } />
                <Route path="/steam/achievements/:appid" element={
                    <PrivateRoute><ModuleRoute module="achievements"><SteamAchievementsDetailPage /></ModuleRoute></PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
