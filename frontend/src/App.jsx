import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FinancePage from './pages/FinancePage';


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/finance' element={<FinancePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;