import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import PublicTracer from "./pages/PublicTracer";
import PublicDirectory from "./pages/PublicDirectory";
import DonationPage from "./pages/DonationPage";

function App() {
  useEffect(() => {
    // Fetch settings to update document title and favicon
    axios.get("/api/settings")
      .then(res => {
        if (res.data?.status === "success") {
          const { schoolName, schoolLogo } = res.data.data;
          if (schoolName) {
            document.title = schoolName;
          }
          if (schoolLogo) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = schoolLogo;
          }
        }
      })
      .catch(err => console.error("Failed to load global settings", err));
  }, []);

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
