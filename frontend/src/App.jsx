import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SignPage from './pages/SignPage'
import { LangProvider } from './context/LangContext'
import Register from './pages/Register'
import SuperAdmin from './pages/SuperAdmin'
import BookingPage from './pages/BookingPage'

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sign/:id" element={<SignPage />} />
<Route path="/register" element={<Register />} />
<Route path="/superadmin" element={<SuperAdmin />} />
<Route path="/booking/:slug" element={<BookingPage />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}

export default App