import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import VisitorView from './components/VisitorView';
import Dashboard from './components/Dashboard';
import AdminView from './components/AdminView';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import ResetForm from './components/ResetForm';
import CreateStory from './components/CreateStory';
import StoryDetail from './components/StoryDetail';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // ⬅️ استخدم useNavigate هنا

  const handleLoginSuccess = (role) => {
    // ⬅️ إعادة توجيه حسب الـ role
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={<VisitorView />} />

        <Route path="/login" element={
          user ? (
            <Navigate to={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? "/admin" : "/dashboard"} replace />
          ) : (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          )
        } />

        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/reset-password" element={<ResetForm />} />

        <Route path="/dashboard" element={<ProtectedRoute>{<Dashboard onLogout={logout} />}</ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={[ 'ADMIN', 'SUPER_ADMIN' ]}>{<AdminView onLogout={logout} />}</ProtectedRoute>} />
        <Route path="/create-story" element={<ProtectedRoute>{<CreateStory />}</ProtectedRoute>} />
        <Route path="/stories/:id" element={<StoryDetail />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;