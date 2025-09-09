// api/client.js
import axios from 'axios';

// axios 인스턴스 생성
const client = axios.create({
  baseURL: 'https://qogustj.store', // 백엔드 서버 URL (필요에 따라 수정)
  headers: {
    'Content-Type': 'application/json',
  },
  // 서버 응답이 오래 걸리는 경우를 위해 타임아웃 설정 (30초)
  timeout: 60000,
});

export default client;