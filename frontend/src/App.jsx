import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { NeonBackground } from './components/NeonBackground';
import FinancePage from './pages/FinancePage';
import WorkoutsPage from './pages/WorkoutsPage';
import LoginPage from './pages/LoginPage';
import StartPage from './pages/StartPage';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" replace />;
}

function AppContent() {
    const location = useLocation();
    const neonVariant = location.pathname.startsWith('/workouts') ? 'red'
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
                    <PrivateRoute><FinancePage /></PrivateRoute>
                } />
                <Route path="/workouts" element={
                    <PrivateRoute><WorkoutsPage /></PrivateRoute>
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
