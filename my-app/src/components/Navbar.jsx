// components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <NavLink className="navbar-brand" to="/">금융 정보 포털</NavLink>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/"
              >
                홈
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/dart"
              >
                DART 정보
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/future"
              >
                주식선물
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/stock"
              >
                주식 정보
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({isActive}) => 
                  isActive ? "nav-link active" : "nav-link"
                } 
                to="/exchange"
              >
                환율 정보
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;