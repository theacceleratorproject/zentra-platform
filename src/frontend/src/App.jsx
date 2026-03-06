// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard    from './pages/Dashboard'
import Accounts     from './pages/Accounts'
import Loans        from './pages/Loans'
import Transactions from './pages/Transactions'
import Reports      from './pages/Reports'
import Batch        from './pages/Batch'
import { api } from './services/api'

export default function App() {
  const [apiStatus, setApiStatus] = useState('unknown')

  useEffect(() => {
    api.health()
      .then(d => setApiStatus(d.status))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar apiStatus={apiStatus} />
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/accounts"     element={<Accounts />} />
          <Route path="/loans"        element={<Loans />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports"      element={<Reports />} />
          <Route path="/batch"        element={<Batch />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
