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
  
  // 알림음 설정 관련 상태들
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState('beep'); // 'beep', 'bell', 'chirp'
  const [soundVolume, setSoundVolume] = useState(0.2); // 0.0 ~ 1.0
  const [soundDuration, setSoundDuration] = useState(0.3); // 초 단위
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  
  // 임시 설정값 (적용 버튼 사용 시)
  const [tempSoundType, setTempSoundType] = useState('beep');
  const [tempSoundVolume, setTempSoundVolume] = useState(0.2);
  const [tempSoundDuration, setTempSoundDuration] = useState(0.3);
  
  // 설정 변경 추적
  const [settingsChanged, setSettingsChanged] = useState(false);
  
  const autoUpdateRef = useRef(false);
  const prevDataRef = useRef([]);
  const audioContextRef = useRef(null);
  const soundSettingsRef = useRef({ type: 'beep', volume: 0.2, duration: 0.3 });
  
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

  // soundSettings가 변경될 때마다 ref 업데이트
  useEffect(() => {
    soundSettingsRef.current = {
      type: soundType,
      volume: soundVolume,
      duration: soundDuration
    };
  }, [soundType, soundVolume, soundDuration]);

  // 알림음 재생 함수
  const playNotificationSound = (test = false) => {
    if ((!soundEnabled && !test) || !audioContextRef.current) return;
    
    try {
      // 항상 현재 설정된 설정값 사용
      const settings = test ? 
        { type: tempSoundType, volume: tempSoundVolume, duration: tempSoundDuration } : 
        soundSettingsRef.current;
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      // 소리 타입에 따른 설정
      switch(settings.type) {
        case 'beep':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(440, audioContextRef.current.currentTime + settings.duration * 0.5);
          break;
        case 'bell':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(1046.5, audioContextRef.current.currentTime); // C6
          oscillator.frequency.exponentialRampToValueAtTime(523.25, audioContextRef.current.currentTime + settings.duration * 0.7); // C5
          break;
        case 'chirp':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(900, audioContextRef.current.currentTime + settings.duration * 0.6);
          break;
        default:
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime);
      }
      
      gainNode.gain.setValueAtTime(settings.volume, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + settings.duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + settings.duration);
      
      console.log('Playing sound with settings:', settings); // 디버깅용 로그
    } catch (e) {
      console.error('Error playing notification sound:', e);
    }
  };
  
  // 컴포넌트 마운트 시 오디오 컨텍스트 초기화 및 임시 설정값 동기화
  useEffect(() => {
    initAudioContext();
    setTempSoundType(soundType);
    setTempSoundVolume(soundVolume);
    setTempSoundDuration(soundDuration);
    
    // 초기 설정도 ref에 저장
    soundSettingsRef.current = {
      type: soundType,
      volume: soundVolume,
      duration: soundDuration
    };
    
    return () => {
      autoUpdateRef.current = false;
      // 오디오 컨텍스트 정리
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);
  
  // 설정창이 열릴 때 임시 설정값 동기화
  useEffect(() => {
    if (showSoundSettings) {
      setTempSoundType(soundType);
      setTempSoundVolume(soundVolume);
      setTempSoundDuration(soundDuration);
      setSettingsChanged(false);
    }
  }, [showSoundSettings]);
  
  // 임시 설정값 변경 시 추적
  useEffect(() => {
    if (showSoundSettings) {
      const isChanged = 
        tempSoundType !== soundType || 
        tempSoundVolume !== soundVolume || 
        tempSoundDuration !== soundDuration;
      
      setSettingsChanged(isChanged);
    }
  }, [tempSoundType, tempSoundVolume, tempSoundDuration, showSoundSettings]);
  
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
          
          // 새 데이터가 있을 때 알림음 재생 (현재 설정으로)
          console.log('New data found, playing notification with current settings:', soundSettingsRef.current);
          playNotificationSound(false);
          
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

  // 알림음 설정 토글 함수
  const toggleSoundSettings = () => {
    setShowSoundSettings(prev => !prev);
  };

  // 알림음 테스트 함수 - 현재 임시 설정으로 테스트
  const testSound = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        playNotificationSound(true);
      }).catch(console.error);
    } else {
      playNotificationSound(true);
    }
  };
  
  // 설정 적용 함수
  const applySettings = () => {
    setSoundType(tempSoundType);
    setSoundVolume(tempSoundVolume);
    setSoundDuration(tempSoundDuration);
    
    // 설정 적용 시 ref도 바로 업데이트
    soundSettingsRef.current = {
      type: tempSoundType,
      volume: tempSoundVolume,
      duration: tempSoundDuration
    };
    
    console.log('Settings applied:', soundSettingsRef.current); // 디버깅용 로그
    
    // 설정 변경 상태 초기화
    setSettingsChanged(false);
    
    // 적용 후 테스트 소리 재생
    testSound();
  };
  
  // 설정 취소 함수
  const cancelSettings = () => {
    setTempSoundType(soundType);
    setTempSoundVolume(soundVolume);
    setTempSoundDuration(soundDuration);
    setSettingsChanged(false);
    setShowSoundSettings(false);
  };

  return (
    <div className="container py-4">
      <header className="pb-3 mb-4 border-bottom">
        <h1 className="fw-bold">주식선물 데이터(v2)</h1>
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
            
            {/* 알림음 설정 버튼 */}
            <button
              className={`btn btn-outline-info ${showSoundSettings ? 'active' : ''}`}
              onClick={toggleSoundSettings}
            >
              <i className="bi bi-gear me-1"></i>
              알림음 설정
              {settingsChanged && <span className="badge bg-danger ms-1">!</span>}
            </button>
          </div>
          
          {/* 알림음 설정 패널 */}
          {showSoundSettings && (
            <div className="card mt-3 mb-3">
              <div className="card-body">
                <h6 className="card-subtitle mb-3">알림음 설정</h6>
                
                <div className="mb-3">
                  <label className="form-label">알림음 종류</label>
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="soundType"
                      id="soundTypeBeep"
                      autoComplete="off"
                      checked={tempSoundType === 'beep'}
                      onChange={() => setTempSoundType('beep')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="soundTypeBeep">
                      삐 소리
                    </label>
                    
                    <input
                      type="radio"
                      className="btn-check"
                      name="soundType"
                      id="soundTypeBell"
                      autoComplete="off"
                      checked={tempSoundType === 'bell'}
                      onChange={() => setTempSoundType('bell')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="soundTypeBell">
                      종 소리
                    </label>
                    
                    <input
                      type="radio"
                      className="btn-check"
                      name="soundType"
                      id="soundTypeChirp"
                      autoComplete="off"
                      checked={tempSoundType === 'chirp'}
                      onChange={() => setTempSoundType('chirp')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="soundTypeChirp">
                      짹 소리
                    </label>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="volumeRange" className="form-label">
                    소리 크기: {Math.round(tempSoundVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    id="volumeRange"
                    min="0"
                    max="1"
                    step="0.05"
                    value={tempSoundVolume}
                    onChange={(e) => setTempSoundVolume(parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="durationRange" className="form-label">
                    소리 길이: {tempSoundDuration.toFixed(1)}초
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    id="durationRange"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={tempSoundDuration}
                    onChange={(e) => setTempSoundDuration(parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={testSound}
                  >
                    <i className="bi bi-play-fill me-1"></i>
                    소리 테스트
                  </button>
                  
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={applySettings}
                    disabled={!settingsChanged}
                  >
                    <i className="bi bi-check-lg me-1"></i>
                    설정 적용
                  </button>
                  
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={cancelSettings}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    취소
                  </button>
                </div>
                
                {/* 현재 적용된 설정 정보 */}
                <div className="mt-3 pt-2 border-top">
                  <p className="text-muted mb-0 small">
                    <strong>현재 적용된 설정:</strong> {soundType === 'beep' ? '삐 소리' : 
                      soundType === 'bell' ? '종 소리' : '짹 소리'}, 
                    볼륨 {Math.round(soundVolume * 100)}%, 
                    길이 {soundDuration.toFixed(1)}초
                  </p>
                </div>
              </div>
            </div>
          )}
          
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