// App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import AdminSignup from './pages/AdminSignup'
import { AuthProvider } from './contexts/AuthContext'
import StudentDocuments from './pages/StudentDocuments'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">

          <Routes>
            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Login page */}
            <Route path="/login" element={<Login />} />

            {/* Admin signup page */}
            <Route path="/admin/signup" element={<AdminSignup />} />

            {/* Admin dashboard (now unprotected) */}
            <Route path="/admin/*" element={<Dashboard />} />

            <Route path="/admin/students/application-documents" element={<StudentDocuments />} />
          </Routes>

        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
