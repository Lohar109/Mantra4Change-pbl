import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Districts } from './pages/Districts';
import { GrantReport } from './pages/GrantReport';
import { ReviewSummary } from './pages/ReviewSummary';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/districts" element={<Districts />} />
          <Route path="/grants" element={<GrantReport />} />
          <Route path="/review" element={<ReviewSummary />} />
          <Route path="*" element={
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-5xl mb-3">404</p>
                <p className="text-gray-500">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
