import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Public pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected pages
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { CareerDigitalTwin } from './pages/CareerDigitalTwin';
import { TargetRole } from './pages/TargetRole';
import { SkillGap } from './pages/SkillGap';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { Roadmap } from './pages/Roadmap';
import { CodingAssessment } from './pages/CodingAssessment';
import { Communication } from './pages/Communication';
import { ProjectsCerts } from './pages/ProjectsCerts';
import { AssessmentHistory } from './pages/AssessmentHistory';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected dashboard routes wrapped in Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/career-twin" element={<CareerDigitalTwin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/target-role" element={<TargetRole />} />
              <Route path="/skill-gap" element={<SkillGap />} />
              <Route path="/resume" element={<ResumeAnalyzer />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/assessment" element={<CodingAssessment />} />
              <Route path="/communication" element={<Communication />} />
              <Route path="/projects" element={<ProjectsCerts />} />
              <Route path="/history" element={<AssessmentHistory />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
