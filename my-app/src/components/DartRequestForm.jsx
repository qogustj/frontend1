import React, { useState } from 'react';

const DartRequestForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    corpCode: '',    // 공시대상회사의 고유번호(8자리)
    bsnsYear: '',    // 사업연도(4자리)
    reprtCode: '',   // 보고서 코드
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>DART 데이터 조회</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="corpCode" className="form-label">회사 고유번호 (8자리)</label>
            <input
              type="text"
              className="form-control"
              id="corpCode"
              name="corpCode"
              value={formData.corpCode}
              onChange={handleChange}
              required
              maxLength="8"
            />
            <div className="form-text">예: 00126380 (삼성전자)</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="bsnsYear" className="form-label">사업연도 (4자리)</label>
            <input
              type="text"
              className="form-control"
              id="bsnsYear"
              name="bsnsYear"
              value={formData.bsnsYear}
              onChange={handleChange}
              required
              maxLength="4"
              pattern="[0-9]{4}"
            />
            <div className="form-text">예: 2018</div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="reprtCode" className="form-label">보고서 코드</label>
            <select
              className="form-select"
              id="reprtCode"
              name="reprtCode"
              value={formData.reprtCode}
              onChange={handleChange}
              required
            >
              <option value="">보고서 종류 선택</option>
              <option value="11011">정기보고서</option>
              <option value="11012">반기보고서</option>
              <option value="11013">1분기보고서</option>
              <option value="11014">3분기보고서</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                조회 중...
              </>
            ) : (
              '데이터 조회'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DartRequestForm;