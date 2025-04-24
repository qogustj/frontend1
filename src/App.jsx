// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DartPage from './pages/DartPage';
import FuturePage from './pages/FuturePage';
// import StockPage from './pages/StockPage';
// import ExchangePage from './pages/ExchangePage';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dart" element={<DartPage />} />
            <Route path="/future" element={<FuturePage />} />
            {/* <Route path="/stock" element={<StockPage />} /> */}
            {/* <Route path="/exchange" element={<ExchangePage />} /> */}
          </Routes>
        </main>
        <footer className="py-3 bg-light mt-auto">
          <div className="container text-center">
            <p className="mb-0 text-muted">&copy; 2025 파생전략운용부</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;