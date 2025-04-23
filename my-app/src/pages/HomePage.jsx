// pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="container py-5">
      <header className="pb-3 mb-5 border-bottom text-center">
        <h1 className="display-4 fw-bold">금융 정보 포털</h1>
        <p className="lead">다양한 금융 정보 서비스를 한 곳에서 이용해보세요.</p>
      </header>

      <div className="row g-4 py-5 row-cols-1 row-cols-md-3">
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="card-title h4">DART 정보 조회</h2>
              <p className="card-text">
                기업 재무정보와 공시자료를 조회할 수 있습니다.
              </p>
              <Link to="/dart" className="btn btn-primary">
                DART 정보 조회
              </Link>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="card-title h4">주식선물 데이터</h2>
              <p className="card-text">
                주식선물 가격제한폭 확대요건 데이터를 확인할 수 있습니다.
              </p>
              <Link to="/future" className="btn btn-primary">
                주식선물 데이터
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="card-title h4">주식 정보</h2>
              <p className="card-text">
                실시간 주식 시세 및 차트를 확인할 수 있습니다.
              </p>
              <Link to="/stock" className="btn btn-primary">
                주식 정보 조회
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="card-title h4">환율 정보</h2>
              <p className="card-text">
                주요 통화의 환율 정보를 조회할 수 있습니다.
              </p>
              <Link to="/exchange" className="btn btn-primary">
                환율 정보 조회
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;