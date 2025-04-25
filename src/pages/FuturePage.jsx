// pages/FuturePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchFutureData } from '../api/futureService';
import FutureDataTable from '../components/FutureDataTable';

function FuturePage() {
  const [futureData, setFutureData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [newEntries, setNewEntries] = useState([]); // 새로운 데이터 항목 ID 저장
  
  // 요청 취소 및 최근 데이터 저장을 위한 ref
  const autoUpdateRef = useRef(false);
  const lastResponseRef = useRef(null); // 이전 요청의 가장 최근 응답 저장
  
  // 데이터 로드 함수
  const loadFutureData = async () => {
    try {
      // 첫 로드인 경우 로딩 상태 활성화, 업데이트인 경우 업데이트 상태만 활성화
      if (futureData.length === 0) {
        setLoading(true);
      } else {
        setUpdating(true);
      }
      
      setError(null);
      
      // API 호출
      const data = await fetchFutureData();
      
      // 이전 응답과 비교하여 새로운 공시 확인
      if (lastResponseRef.current) {
        // 가장 최근 응답의 시간과 새로운 응답의 시간을 비교
        const latestEntries = findNewEntries(lastResponseRef.current, data);
        setNewEntries(latestEntries);
        
        // 일정 시간(10초) 후 강조 효과 제거
        if (latestEntries.length > 0) {
          setTimeout(() => {
            setNewEntries([]);
          }, 10000);
        }
      }
      
      // 현재 응답을 저장
      lastResponseRef.current = data;
      
      // 데이터 설정
      setFutureData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch future data:', err);
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      
      // 오류 발생 시에도 자동 업데이트는 계속 (DB에서 로드하므로 임시 오류일 수 있음)
    } finally {
      // 로딩/업데이트 완료
      setLoading(false);
      setUpdating(false);
      
      // 자동 업데이트가 활성화된 상태이면서 컴포넌트가 마운트된 상태라면 다음 요청 예약
      if (autoUpdateRef.current) {
        setTimeout(() => {
          if (autoUpdateRef.current) { // 타임아웃 실행 시점에도 자동 업데이트가 활성화되어 있는지 확인
            loadFutureData();
          }
        }, 5000); // 5초 후 다음 요청 (이전 2초에서 변경)
      }
    }
  };
  
  // 새로운 데이터 항목을 찾는 함수
  const findNewEntries = (oldData, newData) => {
    // 이 함수는 데이터 구조에 따라 조정해야 합니다
    // 예시: 각 항목에 id와 timestamp가 있다고 가정
    const newEntryIds = [];
    
    // newData에서 가장 최근 시간대의 항목들을 확인
    const latestTimestamp = newData.length > 0 ? 
      Math.max(...newData.map(item => new Date(item.timestamp).getTime())) : 0;
    
    if (latestTimestamp > 0) {
      // oldData에서 가장 최근 시간대의 항목 확인
      const oldLatestTimestamp = oldData.length > 0 ? 
        Math.max(...oldData.map(item => new Date(item.timestamp).getTime())) : 0;
      
      // 최근 시간대가 다르면 새로운 항목으로 간주
      if (latestTimestamp > oldLatestTimestamp) {
        // 새로운 시간대의 모든 항목 ID 저장
        newData.forEach(item => {
          if (new Date(item.timestamp).getTime() === latestTimestamp) {
            newEntryIds.push(item.id);
          }
        });
      }
    }
    
    return newEntryIds;
  };
  
  // 자동 업데이트 시작
  const startAutoUpdate = () => {
    setAutoUpdate(true);
    autoUpdateRef.current = true;
    loadFutureData(); // 즉시 첫 요청 시작
  };
  
  // 자동 업데이트 중지
  const stopAutoUpdate = () => {
    setAutoUpdate(false);
    autoUpdateRef.current = false;
    setUpdating(false);
  };
  
  // 컴포넌트 언마운트 시 자동 업데이트 중지
  useEffect(() => {
    return () => {
      autoUpdateRef.current = false;
    };
  }, []);

  return (
    <div className="container py-4">
      <header className="pb-3 mb-4 border-bottom">
        <h1 className="fw-bold">주식선물 데이터</h1>
        <p className="text-muted">주식선물 가격제한폭 확대요건 정보를 확인할 수 있습니다.</p>
      </header>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">데이터 조회</h5>
          <p className="card-text">주식선물 데이터를 조회하고 5초마다 자동으로 업데이트됩니다. 새로운 공시는 테두리가 강조되어 표시됩니다.</p>
          
          <div className="d-flex flex-wrap gap-2">
            {/* 수동 데이터 조회 버튼 */}
            {!autoUpdate && (
              <button 
                className="btn btn-primary" 
                onClick={loadFutureData}
                disabled={loading || updating}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    데이터 조회 중...
                  </>
                ) : (
                  '데이터 조회'
                )}
              </button>
            )}
            
            {/* 자동 업데이트 시작/중지 버튼 */}
            {autoUpdate ? (
              <button 
                className="btn btn-danger" 
                onClick={stopAutoUpdate}
              >
                자동 업데이트 중지
              </button>
            ) : (
              <button 
                className="btn btn-success" 
                onClick={startAutoUpdate}
                disabled={loading}
              >
                자동 업데이트 시작
              </button>
            )}
          </div>
          
          {/* 업데이트 상태 표시 */}
          {updating && (
            <div className="mt-2 d-flex align-items-center text-success">
              <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
              <span>데이터 자동 업데이트 중...</span>
            </div>
          )}
          
          {/* 마지막 업데이트 시간 */}
          {lastUpdated && (
            <div className="mt-2 text-muted small">
              마지막 업데이트: {lastUpdated.toLocaleString()}
            </div>
          )}
        </div>
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </div>
        </div>
      )}
      
      {/* 데이터 테이블 (데이터가 있을 때만 표시) */}
      {futureData.length > 0 && (
        <>
          <FutureDataTable 
            data={futureData} 
            newEntries={newEntries} // 새로운 항목 정보 전달
          />
          
          {/* 자동 업데이트 중이면 하단에도 상태 표시 */}
          {autoUpdate && (
            <div className="d-flex justify-content-center align-items-center mt-3 text-success">
              <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
              <span>5초마다 자동 업데이트 중</span>
            </div>
          )}
        </>
      )}
      
      {/* 데이터가 없고 로딩 중이 아닐 때 메시지 */}
      {!loading && futureData.length === 0 && !error && (
        <div className="alert alert-info my-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle-fill me-2"></i>
            <div>데이터가 없습니다. '데이터 조회' 또는 '자동 업데이트 시작' 버튼을 클릭하여 데이터를 조회하세요.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FuturePage;