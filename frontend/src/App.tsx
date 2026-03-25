import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AnalysisCreatePage from './pages/AnalysisCreatePage';
import AnalysisReportPage from './pages/AnalysisReportPage';
import ApplicationsPage from './pages/ApplicationsPage';
import BillingPage from './pages/BillingPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analysis/new" element={<AnalysisCreatePage />} />
      <Route path="/analysis/:id" element={<AnalysisReportPage />} />
      <Route path="/applications" element={<ApplicationsPage />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
