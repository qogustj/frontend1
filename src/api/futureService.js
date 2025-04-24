// api/futureService.js
import client from './client';

// 주식선물 데이터 조회 API
export const fetchFutureData = async () => {
  try {
    const response = await client.get('/web/v2/future');
    return response.data;
  } catch (error) {
    console.error('Error fetching future data:', error);
    
    // 에러 응답이 있는 경우
    if (error.response) {
      // 서버 에러 (500대)
      if (error.response.status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      // 클라이언트 에러 (400대)
      else if (error.response.status >= 400) {
        throw new Error('요청이 잘못되었습니다. 관리자에게 문의하세요.');
      }
    }
    // 요청은 보냈지만 응답이 없는 경우 (서버 연결 불가, 타임아웃 등)
    else if (error.request) {
      throw new Error('서버에서 응답이 없습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.');
    }
    // 기타 에러
    throw new Error(error.message || '데이터를 불러오는 중 오류가 발생했습니다.');
  }
};