import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import Notes from './components/Notes.jsx'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  const loggedIn = !!localStorage.getItem('token')

  return (

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/notes"
          element={
         
              <Notes />
          
          }
        />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to={loggedIn ? "/notes" : "/login"} />} />
      </Routes>

  )
}

export default App

