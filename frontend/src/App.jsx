import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import PublicTracer from "./pages/PublicTracer";
import PublicDirectory from "./pages/PublicDirectory";
import DonationPage from "./pages/DonationPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/dashboard/*" element={<AlumniDashboard />} />
        <Route path="/tracer-study" element={<PublicTracer />} />
        <Route path="/directory" element={<PublicDirectory />} />
        <Route path="/donation" element={<DonationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
