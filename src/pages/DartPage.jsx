// pages/DartPage.jsx
import React, { useState } from 'react';
import { fetchDartData } from '../api/dartService.js';
import DartRequestForm from '../components/DartRequestForm.jsx';
import DartDataTable from '../components/DartDataTable.jsx';

function DartPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const responseData = await fetchDartData(formData);
      setData(responseData);
    } catch (err) {
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <header className="pb-3 mb-4 border-bottom">
        <h1 className="fw-bold">DART 정보 조회 시스템</h1>
      </header>

      <DartRequestForm onSubmit={handleSubmit} isLoading={loading} />
      
      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}
      
      <DartDataTable data={data} />
    </div>
  );
}

export default DartPage;