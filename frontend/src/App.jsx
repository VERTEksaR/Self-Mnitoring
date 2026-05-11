import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FinancePage from './pages/FinancePage';
import LoginPage from './pages/LoginPage';

// Защищённый роут: без токена отправляет на /login
function PrivateRoute({ children }) {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/finance" element={
                    <PrivateRoute>
                        <FinancePage />
                    </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/finance" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;