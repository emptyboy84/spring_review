
// 백엔드(Spring Boot)로 사업자 상태 조회 요청을 보내는 함수
export const fetchCompanyStatus = async (inputRegNum: string): Promise<string> => {//비동기함수(Promise<string>는 비동기함수임을 알려주는 타입입니다)
   // 1. 우리 백엔드 서버로 GET 요청 보내기
   const response = await fetch(`http://localhost:8080/company/api/status?regNum=${inputRegNum}`); //비동기함수 호출(await:결과가나올때까지기다려줘)
   // 2. 받아온 JSON 데이터 뜯기
   const data = await response.json();
   // 3. 화면단으로 데이터 넘겨주기
   return data;

};