import client from './client';

// DART 데이터 조회 API
export const fetchDartData = async (dartRequest) => {
  try {
    const response = await client.post('/dart/data', dartRequest);
    return response.data;
  } catch (error) {
    console.error('Error fetching DART data:', error);
    throw error;
  }
};