import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navigation from './components/Navigation'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import CreateProjectPage from './pages/CreateProjectPage'
import MyRequestsPage from './pages/MyRequestsPage'
import ProjectRequestsPage from './pages/ProjectRequestsPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import PrivateRoute from './components/PrivateRoute'
import EditProjectPage from './pages/EditProjectPage'
import HRDashboardPage from './pages/HRDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import CompanyRegistrationPage from './pages/CompanyRegistrationPage'


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Project Routes */}
            <Route path="/projects" element={<ProjectsPage />} />

            <Route
             path="/projects/:id"
              element={
              <PrivateRoute>
                <ProjectDetailPage />
              </PrivateRoute>} />

            {/* Protected Routes */}
            <Route
              path="/student-dashboard"
              element={
                <PrivateRoute>
                  <StudentDashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-requests"
              element={
                <PrivateRoute>
                  <MyRequestsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:projectId/requests"
              element={
                <PrivateRoute>
                  <ProjectRequestsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-project"
              element={
                <PrivateRoute>
                  <CreateProjectPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-project/:id"
              element={
                <PrivateRoute>
                  <EditProjectPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/hr-dashboard"
              element={
                <PrivateRoute>
                  <HRDashboardPage />
                </PrivateRoute>
              }
            />
            <Route 
              path="/admin-dashboard" 
              element={<PrivateRoute><AdminDashboardPage /></PrivateRoute>} 
            />
            <Route path="/register-company" element={<CompanyRegistrationPage />} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/projects" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App