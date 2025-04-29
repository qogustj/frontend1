// pages/FuturePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchFutureData } from '../api/futureService';
import FutureDataTable from '../components/FutureDataTable';

function FuturePage() {
  const [futureData, setFutureData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false); // 자동 업데이트 상태
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(false); // 자동 업데이트 활성화 여부
  const [newDataCount, setNewDataCount] = useState(0); // 새로운 데이터 개수 추적
  
  // 요청 취소를 위한 ref
  const autoUpdateRef = useRef(false);
  const prevDataRef = useRef([]); // 이전 데이터 저장용 ref
  
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
      
      // 새로운 데이터가 있는지 확인
      // 최초 로딩이 아닌 경우에만 새 데이터 확인
      if (prevDataRef.current.length > 0) {
        const prevDataMap = new Map(
          prevDataRef.current.map(item => [
            `${item.company}_${item.title}_${item.expandTime}`, 
            item
          ])
        );
        
        let newItems = 0;
        data.forEach(item => {
          const itemId = `${item.company}_${item.title}_${item.expandTime}`;
          if (!prevDataMap.has(itemId)) {
            newItems++;
          }
        });
        
        if (newItems > 0) {
          setNewDataCount(newItems);
          // 새 데이터 알림을 10초 후에 초기화
          setTimeout(() => {
            setNewDataCount(0);
          }, 10000);
        }
      }
      
      // 현재 데이터를 이전 데이터로 저장
      prevDataRef.current = [...data];
      
      // 데이터 설정
      setFutureData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch future data:', err);
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      
      // 오류 발생 시 자동 업데이트 중단
      if (autoUpdate) {
        stopAutoUpdate();
      }
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
        }, 2000); // 2초 후 다음 요청
      }
    }
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
          <p className="card-text">주식선물 데이터를 조회하고 자동으로 업데이트할 수 있습니다. ( 데이터가 안 떠도 오류창이 안 뜨고 업데이트 시간이 증가하면 자동 조회 되는 중 입니다. )</p>
          
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
          
          {/* 새로운 데이터 알림 */}
          {newDataCount > 0 && (
            <div className="mt-2 alert alert-warning d-flex align-items-center py-2" role="alert">
              <span className="badge bg-danger me-2">NEW</span>
              <span>새로운 데이터 {newDataCount}건이 추가되었습니다!</span>
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
      
      {/* 로딩 인디케이터 (최초 로드 시에만 표시) */}
      {loading && futureData.length === 0 && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">데이터를 불러오는 중입니다...</p>
        </div>
      )}
      
      {/* 데이터 테이블 (데이터가 있을 때만 표시) */}
      {futureData.length > 0 && (
        <>
          <FutureDataTable data={futureData} />
          
          {/* 자동 업데이트 중이면 하단에도 상태 표시 */}
          {autoUpdate && (
            <div className="d-flex justify-content-center align-items-center mt-3 text-success">
              <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
              <span>자동 업데이트 활성화됨</span>
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