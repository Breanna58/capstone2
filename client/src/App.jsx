import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login.jsx'
import Notes from './components/Notes.jsx'

function App() {
  const loggedIn = !!localStorage.getItem('token')

  return (
    <BrowserRouter>
      <Routes>
        {!loggedIn && <Route path="/login" element={<Login />} />}
        {loggedIn && <Route path="/notes" element={<Notes />} />}
        {/* Redirect or fallback */}
        <Route path="*" element={loggedIn ? <Notes /> : <Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

