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
  const [newDataCount, setNewDataCount] = useState(0);
  // 알림음 활성화 상태 추가
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const autoUpdateRef = useRef(false);
  const prevDataRef = useRef([]);
  // 오디오 컨텍스트 참조 추가
  const audioContextRef = useRef(null);
  
  // 오디오 컨텍스트 초기화 함수
  const initAudioContext = () => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      } catch (e) {
        console.error('Web Audio API is not supported in this browser', e);
      }
    }
  };

  // 알림음 재생 함수
  const playNotificationSound = () => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A5 음
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContextRef.current.currentTime + 0.2); // A4 음으로 하강
      
      gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    } catch (e) {
      console.error('Error playing notification sound:', e);
    }
  };
  
  // 컴포넌트 마운트 시 오디오 컨텍스트 초기화
  useEffect(() => {
    initAudioContext();
    
    return () => {
      autoUpdateRef.current = false;
      // 오디오 컨텍스트 정리
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);
  
  // 데이터 로드 함수
  const loadFutureData = async () => {
    try {
      if (futureData.length === 0) {
        setLoading(true);
      } else {
        setUpdating(true);
      }
      
      setError(null);
      
      const data = await fetchFutureData();
      
      // 새로운 데이터가 있는지 확인
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
          
          // 새 데이터가 있을 때 알림음 재생
          playNotificationSound();
          
          // 10초 후에 알림 초기화
          setTimeout(() => {
            setNewDataCount(0);
          }, 10000);
        }
      }
      
      prevDataRef.current = [...data];
      setFutureData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch future data:', err);
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      
      if (autoUpdate) {
        stopAutoUpdate();
      }
    } finally {
      setLoading(false);
      setUpdating(false);
      
      if (autoUpdateRef.current) {
        setTimeout(() => {
          if (autoUpdateRef.current) {
            loadFutureData();
          }
        }, 2000);
      }
    }
  };
  
  const startAutoUpdate = () => {
    setAutoUpdate(true);
    autoUpdateRef.current = true;
    loadFutureData();
  };
  
  const stopAutoUpdate = () => {
    setAutoUpdate(false);
    autoUpdateRef.current = false;
    setUpdating(false);
  };

  // 알림음 토글 함수
  const toggleSound = () => {
    // 사용자 상호작용 시 오디오 컨텍스트 초기화 또는 재개
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(console.error);
    } else if (!audioContextRef.current) {
      initAudioContext();
    }
    
    setSoundEnabled(prev => !prev);
  };

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
          
          <div className="d-flex flex-wrap gap-2 mb-3">
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
            
            {/* 알림음 토글 버튼 */}
            <button
              className={`btn ${soundEnabled ? 'btn-outline-secondary' : 'btn-outline-secondary opacity-50'}`}
              onClick={toggleSound}
              title={soundEnabled ? '알림음 끄기' : '알림음 켜기'}
            >
              {soundEnabled ? (
                <>
                  <i className="bi bi-volume-up me-1"></i>
                  알림음 켜짐
                </>
              ) : (
                <>
                  <i className="bi bi-volume-mute me-1"></i>
                  알림음 꺼짐
                </>
              )}
            </button>
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
      
      {/* 로딩 인디케이터 */}
      {loading && futureData.length === 0 && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">데이터를 불러오는 중입니다...</p>
        </div>
      )}
      
      {/* 데이터 테이블 */}
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
      
      {/* 데이터가 없을 때 메시지 */}
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