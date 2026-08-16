import { Routes, Route } from 'react-router-dom';
import App from './App';
import ProtocolDetail from './pages/ProtocolDetail';

// ─────────────────────────────────────────────────────────────────────────────
// APP ROUTER — Routing client-side per SPA Aurex
// ─────────────────────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/protocollo/:slug" element={<ProtocolDetail />} />
    </Routes>
  );
}
