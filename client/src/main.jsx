import { StrictMode } from 'react'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login.jsx'
import Notes from './components/Notes.jsx'
import ReactDOM from 'react-dom/client';


const root = document.getElementById('root')

ReactDOM.createRoot(root).render(

  <StrictMode>
    <BrowserRouter>
    
    <App />
    </BrowserRouter>



  </StrictMode>



)