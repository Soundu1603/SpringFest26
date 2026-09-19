import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import CoordinatorCheckIn from "./pages/CoordinatorCheckIn";
import Events from "./pages/events";
import { useAdminAuth } from "./hooks/useAdminAuth";

function ProtectedAdminRoute() {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return <div className="admin-page"><div className="admin-status">Checking admin access...</div></div>;
  }

  return isAuthenticated ? <Admin /> : <Navigate to="/admin-login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="page-transition" key={`${location.pathname}${location.search}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
        <Route path="/coordinator" element={<CoordinatorCheckIn />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;