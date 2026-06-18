import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NeonBackground } from './components/NeonBackground';
import FinancePage from './pages/FinancePage';
import LoginPage from './pages/LoginPage';
import StartPage from './pages/StartPage';

function PrivateRoute({ children }) {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <>
            <NeonBackground />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={
                        <PrivateRoute><StartPage /></PrivateRoute>
                    } />
                    <Route path="/finance" element={
                        <PrivateRoute><FinancePage /></PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
