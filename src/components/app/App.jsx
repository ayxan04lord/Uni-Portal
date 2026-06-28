import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoginPage from '../../pages/LoginPage'
import StudentDashboard from '../../pages/student/StudentDashboard'
import StudentProfile from '../../pages/student/StudentProfile'
import StudentAttendance from '../../pages/student/StudentAttendance'
import StudentExams from '../../pages/student/StudentExams'
import TeacherDashboard from '../../pages/teacher/TeacherDashboard'
import TeacherSubject from '../../pages/teacher/TeacherSubject'
import Layout from '../Layout/Layout'
import Spinner from '../ui/Spinner'
import './App.css'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullscreen />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

function App() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner fullscreen />

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace /> : <LoginPage />
      } />

      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute role="student"><Layout /></ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="attendance/:subjectId" element={<StudentAttendance />} />
        <Route path="exams" element={<StudentExams />} />
      </Route>

      {/* Teacher routes */}
      <Route path="/teacher" element={
        <ProtectedRoute role="teacher"><Layout /></ProtectedRoute>
      }>
        <Route index element={<TeacherDashboard />} />
        <Route path="subject/:subjectId" element={<TeacherSubject />} />
      </Route>

      <Route path="*" element={
        <Navigate to={user ? (user.role === 'teacher' ? '/teacher' : '/student') : '/login'} replace />
      } />
    </Routes>
  )
}

export default App
