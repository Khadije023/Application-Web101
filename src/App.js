import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ListPatientsPage from "./pages/ListPatientsPage";
import ListDocteurPage from "./pages/ListDocteurPage";
import AmbulancesPage from "./pages/AmbulancesPage";
import UrgencesPage from "./pages/UrgencesPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/listpatients/" element={<ListPatientsPage />} />
        <Route path="/listdocteur/" element={<ListDocteurPage />} />
        <Route path="/ambulances/" element={<AmbulancesPage />} />
        <Route path="/urgences/" element={<UrgencesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
