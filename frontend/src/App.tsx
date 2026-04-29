import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Docs from './pages/Docs'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<Dashboard />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
    </BrowserRouter>
  )
}
