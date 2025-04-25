// components/FutureDataTable.jsx
import React from 'react';

function FutureDataTable({ data, newEntries = [] }) {
  // 데이터가 비어있으면 빈 테이블 반환
  if (!data || data.length === 0) {
    return null;
  }
  
  // 테이블 헤더 (데이터 구조에 맞게 조정 필요)
  const headers = Object.keys(data[0]).filter(key => key !== 'id'); // id는 표시하지 않음
  
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            {headers.map((header, index) => (
              <th key={index} scope="col">
                {formatHeaderName(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            // 새로운 항목인지 확인
            const isNewEntry = newEntries.includes(item.id);
            
            return (
              <tr 
                key={item.id} 
                className={isNewEntry ? 'position-relative' : ''}
                style={isNewEntry ? {
                  boxShadow: '0 0 0 3px #00c853',
                  animation: 'pulse 2s infinite'
                } : {}}
              >
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex}>
                    {formatCellValue(item[header], header)}
                    {isNewEntry && cellIndex === 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        NEW
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* 새 항목 강조를 위한 CSS 애니메이션 */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(0, 200, 83, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 200, 83, 0);
          }
        }
      `}</style>
    </div>
  );
}

// 헤더 이름 포맷팅 함수
function formatHeaderName(header) {
  // camelCase나 snake_case를 띄어쓰기가 있는 텍스트로 변환
  return header
    .replace(/([A-Z])/g, ' $1') // camelCase 변환
    .replace(/_/g, ' ') // snake_case 변환
    .replace(/^\w/, (c) => c.toUpperCase()); // 첫 글자 대문자
}

// 셀 값 포맷팅 함수 (데이터 타입에 따라 조정 필요)
function formatCellValue(value, header) {
  // 날짜 형식 확인 및 변환
  if (header.includes('date') || header.includes('time') || header === 'timestamp') {
    if (value && !isNaN(new Date(value).getTime())) {
      return new Date(value).toLocaleString();
    }
  }
  
  // 숫자 형식 변환 (예: 가격, 금액 등)
  if (typeof value === 'number') {
    if (header.includes('price') || header.includes('amount') || header.includes('value')) {
      return value.toLocaleString();
    }
  }
  
  // 불리언 값 변환
  if (typeof value === 'boolean') {
    return value ? '예' : '아니오';
  }
  
  // 나머지는 그대로 반환
  return value === null || value === undefined ? '-' : String(value);
}

export default FutureDataTable;